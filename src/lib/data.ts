/**
 * Reference data for the Margin Call marketing site.
 *
 * Every price, rate and yield here is a SIMULATED snapshot used to render the
 * page while the protocol is pre-launch. Nothing in this file is live market
 * data — see README.md for the Pyth / DexScreener integration notes.
 */

export const BRAND = {
  name: "Margin Call",
  ticker: "$CALL",
  tagline: "Don't sell your bags. Borrow against them.",
  /** Published at TGE — intentionally empty until the mint exists. */
  contract: "",
} as const;

export const SOCIALS = [
  { label: "X / Twitter", href: "#" },
  { label: "Telegram", href: "#" },
  { label: "Discord", href: "#" },
  { label: "DexScreener", href: "#" },
  { label: "GitHub", href: "#" },
] as const;

/* ------------------------------------------------------------------ */
/* Markets                                                             */
/* ------------------------------------------------------------------ */

export type CollateralAsset = {
  symbol: string;
  name: string;
  price: number;
  /** Maximum loan-to-value at origination. */
  maxLtv: number;
  /** LTV at which the position becomes liquidatable. */
  liqThreshold: number;
  supplyApy: number;
  change: number;
  tint: string;
  /** Sensible starting amount for the calculator. */
  defaultAmount: number;
};

export type EquityAsset = {
  symbol: string;
  name: string;
  price: number;
  borrowApr: number;
  change: number;
  tint: string;
};

export const COLLATERAL: CollateralAsset[] = [
  {
    symbol: "SOL",
    name: "Solana",
    price: 214.6,
    maxLtv: 0.75,
    liqThreshold: 0.8,
    supplyApy: 4.1,
    change: 3.12,
    tint: "#9b7cf6",
    defaultAmount: 100,
  },
  {
    symbol: "jitoSOL",
    name: "Jito Staked SOL",
    price: 246.8,
    maxLtv: 0.72,
    liqThreshold: 0.77,
    supplyApy: 7.8,
    change: 3.24,
    tint: "#00e676",
    defaultAmount: 100,
  },
  {
    symbol: "wBTC",
    name: "Wrapped Bitcoin",
    price: 97420,
    maxLtv: 0.75,
    liqThreshold: 0.8,
    supplyApy: 2.2,
    change: -0.86,
    tint: "#f7931a",
    defaultAmount: 1,
  },
  {
    symbol: "wETH",
    name: "Wrapped Ether",
    price: 3612,
    maxLtv: 0.73,
    liqThreshold: 0.78,
    supplyApy: 2.9,
    change: 1.47,
    tint: "#4da3ff",
    defaultAmount: 10,
  },
];

export const EQUITIES: EquityAsset[] = [
  { symbol: "USDC", name: "USD Coin", price: 1, borrowApr: 6.2, change: 0.01, tint: "#2775ca" },
  { symbol: "SPYx", name: "S&P 500 ETF", price: 614.05, borrowApr: 6.8, change: 0.31, tint: "#4da3ff" },
  { symbol: "AAPLx", name: "Apple Inc.", price: 241.18, borrowApr: 8.1, change: 0.74, tint: "#dce4ed" },
  { symbol: "NVDAx", name: "NVIDIA Corp.", price: 183.42, borrowApr: 9.4, change: 2.31, tint: "#76b900" },
  { symbol: "TSLAx", name: "Tesla Inc.", price: 402.77, borrowApr: 11.2, change: -1.92, tint: "#ff4d4d" },
  { symbol: "MSTRx", name: "Strategy Inc.", price: 328.9, borrowApr: 14.6, change: -3.47, tint: "#ffb000" },
];

/* ------------------------------------------------------------------ */
/* Risk                                                                */
/* ------------------------------------------------------------------ */

export type HealthBand = { label: string; color: string; note: (drop: string, sym: string) => string };

/** Health-factor risk bands, ordered from safest to most dangerous. */
export function healthBand(hf: number): HealthBand {
  if (!Number.isFinite(hf)) {
    return {
      label: "No debt",
      color: "var(--muted)",
      note: () => "Nothing drawn. Your collateral is fully unencumbered.",
    };
  }
  if (hf >= 1.8) {
    return {
      label: "Safe",
      color: "var(--pos)",
      note: (drop, sym) => `${sym} would have to fall ${drop} before this position is liquidatable.`,
    };
  }
  if (hf >= 1.35) {
    return {
      label: "Moderate",
      color: "var(--amber)",
      note: (drop, sym) => `A ${drop} drawdown in ${sym} triggers liquidation. Worth watching.`,
    };
  }
  if (hf >= 1) {
    return {
      label: "At risk",
      color: "var(--neg)",
      note: (drop, sym) => `Only ${drop} of downside left in ${sym}. Add collateral or repay.`,
    };
  }
  return {
    label: "Liquidatable",
    color: "var(--neg)",
    note: () => "A position at this level would be liquidated immediately.",
  };
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export type Stat = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  note: string;
  noteTone?: "pos" | "muted";
};

export const STATS: Stat[] = [
  { label: "Total value locked", value: 0, prefix: "$", note: "pre-launch" },
  { label: "Tokenized equities", value: 12, note: "+4 next quarter", noteTone: "pos" },
  { label: "Max LTV", value: 75, suffix: "%", note: "on blue-chip collateral" },
  { label: "Liquidation penalty", value: 5, suffix: "%", note: "flat, no hidden fees" },
];

export const STEPS = [
  {
    n: "01",
    title: "Deposit collateral",
    body: "Supply SOL, jitoSOL, wBTC or wETH into an isolated vault. Liquid-staking collateral keeps earning its native yield the whole time it backs a loan.",
  },
  {
    n: "02",
    title: "Draw liquidity",
    body: "Borrow USDC against the position up to the asset's max LTV. The rate floats with pool utilisation. Repay any amount, any time — no term, no prepayment penalty.",
  },
  {
    n: "03",
    title: "Go long equities",
    body: "Swap into tokenized stocks and hold them in the same wallet, or loop them back as collateral. Your crypto exposure never closes.",
  },
];

export const PILLARS = [
  {
    title: "Pyth price feeds",
    body: "Marks come from Pyth first-party publishers with confidence intervals enforced on-chain. A stale or wide-band price pauses the market rather than mispricing it.",
    tint: "var(--amber)",
  },
  {
    title: "Isolated risk pools",
    body: "Every market is ring-fenced. A failure in a long-tail equity pool cannot drain the SOL or USDC pools — bad debt is never socialised across markets.",
    tint: "var(--violet)",
  },
  {
    title: "Over-collateralised by design",
    body: "Liquidation thresholds sit above origination LTV, so every position opens with headroom. The calculator shows you exactly how much.",
    tint: "var(--pos)",
  },
  {
    title: "Dutch-auction liquidations",
    body: "Underwater positions unwind through a descending-price auction instead of a flat bonus, keeping the penalty proportionate to how far a position drifted.",
    tint: "var(--info)",
  },
];

export const TOKENOMICS = [
  { label: "Liquidity pool", sub: "LP burned at launch", pct: 40, tint: "var(--amber)" },
  { label: "Community & airdrop", sub: "no allocation to insiders", pct: 25, tint: "var(--pos)" },
  { label: "Protocol treasury", sub: "governance controlled", pct: 15, tint: "var(--info)" },
  { label: "Team", sub: "6mo cliff, 24mo linear vest", pct: 12, tint: "var(--violet)" },
  { label: "Listings & market making", pct: 8, tint: "var(--dim)" },
];

export const GUARANTEES = [
  {
    title: "Mint authority revoked",
    body: "Supply is permanently capped at 1,000,000,000. No new tokens can ever be minted.",
  },
  {
    title: "Freeze authority revoked",
    body: "No address can be blacklisted and no balance can be frozen, including by the team.",
  },
  {
    title: "LP tokens burned",
    body: "Initial liquidity is locked forever. It cannot be withdrawn by anyone, ever.",
  },
  {
    title: "No team allocation at TGE",
    body: "Six-month cliff, then linear vesting over 24 months, enforced on-chain.",
  },
  {
    title: "Fair launch",
    body: "No private round, no presale, no discounted insider allocation.",
  },
];

export const TOKEN_UTILITY = [
  { title: "Fee share", body: "A slice of the protocol interest spread routes to stakers each epoch." },
  { title: "Governance", body: "Vote on which collateral gets listed, at what LTV, and on the liquidation curve." },
  { title: "Fee rebate", body: "A staked balance reduces your borrow spread on a sliding scale." },
];

export type RoadmapStatus = "done" | "active" | "next";

export const ROADMAP: {
  phase: string;
  title: string;
  status: RoadmapStatus;
  items: string[];
}[] = [
  {
    phase: "Phase 00",
    title: "Foundations",
    status: "done",
    items: ["Protocol design and risk framework", "Core lending program written", "Site, brand and community launch"],
  },
  {
    phase: "Phase 01",
    title: "Token generation event",
    status: "active",
    items: ["$CALL fair launch, LP burned", "Mint and freeze authority revoked", "DexScreener and Birdeye listings"],
  },
  {
    phase: "Phase 02",
    title: "Devnet lending market",
    status: "next",
    items: ["SOL / jitoSOL / wBTC collateral vaults", "USDC borrow pool with utilisation curve", "Pyth feeds and liquidation engine"],
  },
  {
    phase: "Phase 03",
    title: "Mainnet & equities",
    status: "next",
    items: ["Third-party audit published in full", "Mainnet launch under a capped TVL", "Tokenized equity markets, $CALL staking live"],
  },
];

export const FAQ = [
  {
    q: "What actually happens if I get liquidated?",
    a: "If your collateral falls far enough that your health factor drops below 1.0, liquidators repay part of your debt in exchange for a portion of your collateral plus a 5% penalty. You keep whatever remains. The cure is simple: borrow well under the maximum and top up before the buffer runs out — the calculator shows you exactly where that line sits.",
  },
  {
    q: "Are the tokenized stocks real shares?",
    a: "They are tokens issued by regulated third parties, each backed 1:1 by the underlying share held in custody. They track the price and, depending on the issuer, the dividend. They are not shares registered in your name: you get no voting rights, and your claim is on the issuer rather than on the company. Availability is restricted in several jurisdictions, including the United States.",
  },
  {
    q: "Why borrow instead of just selling my crypto?",
    a: "Two reasons. Selling realises a taxable event in most jurisdictions while borrowing generally does not — though this varies and is not tax advice. And if you still believe in the position, selling to buy equities means giving up the upside. Borrowing lets you hold both sides. The cost is the interest; the risk is liquidation.",
  },
  {
    q: "What is $CALL for?",
    a: "Three things: governance over which collateral assets get listed and at what LTV, a share of protocol interest revenue for stakers, and fee rebates on borrowing. It is not a claim on protocol assets and it is not equity in any company.",
  },
  {
    q: "Has this been audited?",
    a: "Not yet. The lending program is pre-devnet. A third-party audit is scheduled before any mainnet deployment and the full report will be published, including whatever it finds. Until that report exists, treat every number on this page as a design target rather than a live system.",
  },
  {
    q: "Is the data on this page live?",
    a: "No. Every price, rate and APY shown here is simulated while the protocol is pre-launch — that is what the amber DEMO flags mark. They get replaced by live oracle and pool data at launch.",
  },
];
