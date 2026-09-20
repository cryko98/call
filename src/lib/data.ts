/**
 * Static copy and protocol parameters.
 *
 * No market data lives here. Prices, 24h changes, supply/borrow rates and
 * max-LTV values are fetched live in `src/lib/market.ts` from Jupiter and
 * Kamino. What remains below is editorial copy plus the risk bands, which are
 * protocol design parameters rather than observations.
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

export const STEPS = [
  {
    n: "01",
    title: "Deposit collateral",
    body: "Supply SOL, JitoSOL, cbBTC or wETH into an isolated vault. Liquid-staking collateral keeps earning its native yield the whole time it backs a loan.",
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
    items: ["SOL / JitoSOL / cbBTC collateral vaults", "USDC borrow pool with utilisation curve", "Pyth feeds and liquidation engine"],
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
    q: "Where do the numbers on this page come from?",
    a: "Prices, 24h moves, liquidity and volume are pulled live from Jupiter, and the supply and borrow rates plus max-LTV parameters come from Kamino’s main lending market on Solana. Both refresh about once a minute. Liquidation thresholds are protocol parameters we set rather than fetched values, and they are labelled that way. $CALL itself has no market data because the token is not minted yet — that section shows the launch plan, not trading figures.",
  },
];
