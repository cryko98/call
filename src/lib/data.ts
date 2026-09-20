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

export type HealthBand = { label: string; note: (drop: string, sym: string) => string };

/** Health-factor risk bands, ordered from safest to most dangerous. */
export function healthBand(hf: number): HealthBand {
  if (!Number.isFinite(hf)) {
    return {
      label: "No debt",
      note: () => "Nothing drawn. Your collateral is fully unencumbered.",
    };
  }
  if (hf >= 1.8) {
    return {
      label: "Safe",
      note: (drop, sym) => `${sym} would have to fall ${drop} before this position is liquidatable.`,
    };
  }
  if (hf >= 1.35) {
    return {
      label: "Moderate",
      note: (drop, sym) => `A ${drop} drawdown in ${sym} triggers liquidation. Worth watching.`,
    };
  }
  if (hf >= 1) {
    return {
      label: "At risk",
      note: (drop, sym) => `Only ${drop} of downside left in ${sym}. Add collateral or repay.`,
    };
  }
  return {
    label: "Liquidatable",
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
    tint: "var(--gold)",
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
    tint: "var(--cornflower)",
  },
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
    title: "This site",
    status: "done",
    items: [
      "Live prices and lending rates from Jupiter and Kamino",
      "Working swap into tokenized stocks, signed by your wallet",
      "Position calculator built on the live parameters",
    ],
  },
  {
    phase: "Phase 01",
    title: "Lending program",
    status: "next",
    items: [
      "Core program written and reviewed",
      "Risk framework and liquidation design finalised",
      "Public repository",
    ],
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
    items: ["Third-party audit published in full", "Mainnet launch under a capped TVL", "Tokenized equity collateral markets"],
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
    q: "Is there a $CALL token?",
    a: "No. Nothing has been minted, so there is no supply, no liquidity pool, no vesting schedule and nothing to buy. Anything currently trading under that ticker is not ours. When a token does exist its mint address will be published here and the details will follow it — we would rather show you nothing than a distribution chart for a token that has not been created.",
  },
  {
    q: "Has this been audited?",
    a: "Not yet. The lending program is pre-devnet. A third-party audit is scheduled before any mainnet deployment and the full report will be published, including whatever it finds. Until that report exists, treat every number on this page as a design target rather than a live system.",
  },
  {
    q: "Where do the numbers on this page come from?",
    a: "Prices, 24h moves, liquidity and volume are pulled live from Jupiter, and the supply and borrow rates plus max-LTV parameters come from Kamino’s main lending market on Solana. Both refresh about once a minute. Liquidation thresholds are protocol parameters we set rather than fetched values, and they are labelled that way. Nothing on this page is a placeholder: if a source is unavailable you get an em-dash rather than an invented number.",
  },
];
