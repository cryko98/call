/**
 * Live market data.
 *
 * Two real sources, both public and key-less:
 *   - Jupiter  — spot price, 24h change, 24h volume, liquidity, holders
 *   - Kamino   — on-chain supply/borrow APY and max LTV from its main market
 *
 * Nothing here falls back to invented numbers. If a source fails, the affected
 * fields come back `null` and the UI says the data is unavailable — a wrong
 * number on a lending page is worse than a missing one.
 */

import {
  ALL_TOKENS,
  COLLATERAL_TOKENS,
  EQUITY_TOKENS,
  KAMINO_MAIN_MARKET,
  type TokenDef,
} from "./tokens";

const JUPITER_SEARCH = "https://lite-api.jup.ag/tokens/v2/search";
const KAMINO_METRICS = `https://api.kamino.finance/kamino-market/${KAMINO_MAIN_MARKET}/reserves/metrics`;

/** How long a snapshot is served before it is refetched. */
export const REVALIDATE_SECONDS = 60;

/**
 * Spread between max LTV and the liquidation threshold. This is a protocol
 * design parameter we set, not fetched data, and the UI labels it as such.
 */
const LIQUIDATION_SPREAD = 0.05;
const MAX_LIQ_THRESHOLD = 0.95;

export type MarketAsset = TokenDef & {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  holders: number | null;
  mcap: number | null;
  /** Live from Kamino's main market; null when that reserve is unavailable. */
  maxLtv: number | null;
  supplyApy: number | null;
  borrowApy: number | null;
  /** Derived from maxLtv — a protocol parameter, not market data. */
  liqThreshold: number | null;
};

export type MarketSnapshot = {
  fetchedAt: string;
  collateral: MarketAsset[];
  equities: MarketAsset[];
  totals: {
    equityLiquidityUsd: number | null;
    equityVolume24h: number | null;
    equityMarkets: number;
    kaminoSupplyUsd: number | null;
  };
  sources: { jupiter: boolean; kamino: boolean };
  errors: string[];
};

/* ------------------------------------------------------------------ */
/* Jupiter                                                             */
/* ------------------------------------------------------------------ */

type JupToken = {
  id: string;
  usdPrice?: number;
  liquidity?: number;
  mcap?: number;
  holderCount?: number;
  stats24h?: { priceChange?: number; buyVolume?: number; sellVolume?: number };
};

async function fetchJupiter(): Promise<Map<string, JupToken>> {
  const mints = ALL_TOKENS.map((t) => t.mint).join(",");
  const res = await fetch(`${JUPITER_SEARCH}?query=${mints}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Jupiter responded ${res.status}`);

  const json: unknown = await res.json();
  if (!Array.isArray(json)) throw new Error("Jupiter returned an unexpected shape");

  const byMint = new Map<string, JupToken>();
  for (const t of json as JupToken[]) {
    if (t && typeof t.id === "string") byMint.set(t.id, t);
  }
  return byMint;
}

/* ------------------------------------------------------------------ */
/* Kamino                                                              */
/* ------------------------------------------------------------------ */

type KaminoReserve = {
  liquidityTokenMint: string;
  maxLtv: string;
  supplyApy: string;
  borrowApy: string;
  totalSupplyUsd: string;
};

type KaminoRates = { maxLtv: number; supplyApy: number; borrowApy: number; supplyUsd: number };

async function fetchKamino(): Promise<{ byMint: Map<string, KaminoRates>; totalSupplyUsd: number }> {
  const res = await fetch(KAMINO_METRICS, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Kamino responded ${res.status}`);

  const json: unknown = await res.json();
  if (!Array.isArray(json)) throw new Error("Kamino returned an unexpected shape");

  const byMint = new Map<string, KaminoRates>();
  let totalSupplyUsd = 0;

  for (const r of json as KaminoReserve[]) {
    const supplyUsd = Number(r.totalSupplyUsd);
    if (!Number.isFinite(supplyUsd)) continue;
    totalSupplyUsd += supplyUsd;

    const existing = byMint.get(r.liquidityTokenMint);
    // Several reserves can share a mint; the deepest one is the real market.
    if (existing && existing.supplyUsd >= supplyUsd) continue;

    byMint.set(r.liquidityTokenMint, {
      maxLtv: Number(r.maxLtv),
      supplyApy: Number(r.supplyApy) * 100,
      borrowApy: Number(r.borrowApy) * 100,
      supplyUsd,
    });
  }

  return { byMint, totalSupplyUsd };
}

/* ------------------------------------------------------------------ */
/* Snapshot                                                            */
/* ------------------------------------------------------------------ */

function finite(n: number | undefined | null): number | null {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function buildAsset(
  token: TokenDef,
  jup: Map<string, JupToken>,
  kam: Map<string, KaminoRates>,
): MarketAsset {
  const j = jup.get(token.mint);
  const k = kam.get(token.mint);

  const buy = finite(j?.stats24h?.buyVolume) ?? 0;
  const sell = finite(j?.stats24h?.sellVolume) ?? 0;
  const volume24h = j?.stats24h ? buy + sell : null;

  const maxLtv = k ? k.maxLtv : null;

  return {
    ...token,
    price: finite(j?.usdPrice),
    change24h: finite(j?.stats24h?.priceChange),
    volume24h,
    liquidityUsd: finite(j?.liquidity),
    holders: finite(j?.holderCount),
    mcap: finite(j?.mcap),
    maxLtv,
    supplyApy: k ? k.supplyApy : null,
    borrowApy: k ? k.borrowApy : null,
    liqThreshold:
      maxLtv === null ? null : Math.min(maxLtv + LIQUIDATION_SPREAD, MAX_LIQ_THRESHOLD),
  };
}

function sumOrNull(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const errors: string[] = [];

  const [jupResult, kamResult] = await Promise.allSettled([fetchJupiter(), fetchKamino()]);

  const jup = jupResult.status === "fulfilled" ? jupResult.value : new Map<string, JupToken>();
  if (jupResult.status === "rejected") {
    errors.push(`Price feed unavailable: ${String(jupResult.reason)}`);
  }

  const kam =
    kamResult.status === "fulfilled" ? kamResult.value.byMint : new Map<string, KaminoRates>();
  if (kamResult.status === "rejected") {
    errors.push(`Rate feed unavailable: ${String(kamResult.reason)}`);
  }

  const collateral = COLLATERAL_TOKENS.map((t) => buildAsset(t, jup, kam));
  const equities = EQUITY_TOKENS.map((t) => buildAsset(t, jup, kam));

  // Headline figures describe the real tokenized-equity market on Solana,
  // excluding USDC, which would swamp them without meaning anything.
  const tradedEquities = equities.filter((e) => e.symbol !== "USDC");

  return {
    fetchedAt: new Date().toISOString(),
    collateral,
    equities,
    totals: {
      equityLiquidityUsd: sumOrNull(tradedEquities.map((e) => e.liquidityUsd)),
      equityVolume24h: sumOrNull(tradedEquities.map((e) => e.volume24h)),
      equityMarkets: tradedEquities.filter((e) => e.price !== null).length,
      kaminoSupplyUsd: kamResult.status === "fulfilled" ? kamResult.value.totalSupplyUsd : null,
    },
    sources: {
      jupiter: jupResult.status === "fulfilled",
      kamino: kamResult.status === "fulfilled",
    },
    errors,
  };
}
