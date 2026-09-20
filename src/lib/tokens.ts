/**
 * Verified Solana mint registry.
 *
 * Every mint below was resolved through the Jupiter token API and cross-checked
 * on issuer name, liquidity and holder count — not copied from memory. The
 * xStocks are real tokenized equities issued by Backed Finance and they trade
 * on Solana DEXes today, which is what makes the live price feed possible.
 *
 * Two filters decide what is listed here, and both matter:
 *
 *   1. Genuine Backed mints carry the `Xs` vanity prefix. Impostor tokens with
 *      the same ticker exist on pump.fun — AZNx, JPMx, NFLXx and CRWDx all
 *      resolve to `…pump` mints with no price and a handful of holders. Listing
 *      one of those would point a swap at a worthless token.
 *   2. A pool needs real depth. Several genuine xStocks sit under $10k of
 *      liquidity (Salesforce was $46), where any meaningful swap would move the
 *      price against the user. The floor here is roughly $40k.
 *
 * Re-verify with:
 *   curl "https://lite-api.jup.ag/tokens/v2/search?query=<SYMBOL>"
 */

export type TokenKind = "collateral" | "equity";

/** Grouping used by the market table and the swap selector. */
export type TokenGroup = "Index & commodity" | "Tech" | "Crypto-linked" | "Consumer & other";

export type TokenDef = {
  symbol: string;
  /** Short display name. The API returns the issuer's own longer name. */
  name: string;
  mint: string;
  kind: TokenKind;
  tint: string;
  group?: TokenGroup;
  /** Starting amount in the calculator, sized so the default position is realistic. */
  defaultAmount?: number;
};

export const COLLATERAL_TOKENS: TokenDef[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    kind: "collateral",
    tint: "var(--violet)",
    defaultAmount: 100,
  },
  {
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    kind: "collateral",
    tint: "var(--lime)",
    defaultAmount: 100,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    kind: "collateral",
    tint: "var(--gold)",
    defaultAmount: 0.25,
  },
  {
    symbol: "wETH",
    name: "Wrapped Ether",
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    kind: "collateral",
    tint: "var(--cornflower)",
    defaultAmount: 5,
  },
];

/**
 * USDC first — it is the default borrow asset and the quote side of most
 * routes. The rest are ordered by group, then by pool depth within it.
 */
export const EQUITY_TOKENS: TokenDef[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    kind: "equity",
    tint: "var(--sky)",
  },

  /* ---- Index & commodity ---- */
  {
    symbol: "SPYx",
    name: "S&P 500",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    kind: "equity",
    tint: "var(--cornflower)",
    group: "Index & commodity",
  },
  {
    symbol: "QQQx",
    name: "Nasdaq 100",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
    kind: "equity",
    tint: "var(--violet)",
    group: "Index & commodity",
  },
  {
    symbol: "GLDx",
    name: "Gold",
    mint: "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
    kind: "equity",
    tint: "var(--gold)",
    group: "Index & commodity",
  },
  {
    symbol: "TQQQx",
    name: "Nasdaq 100 3x",
    mint: "XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc",
    kind: "equity",
    tint: "var(--coral)",
    group: "Index & commodity",
  },

  /* ---- Tech ---- */
  {
    symbol: "NVDAx",
    name: "NVIDIA",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    kind: "equity",
    tint: "var(--lime)",
    group: "Tech",
  },
  {
    symbol: "AAPLx",
    name: "Apple",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    kind: "equity",
    tint: "var(--mist)",
    group: "Tech",
  },
  {
    symbol: "MSFTx",
    name: "Microsoft",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    kind: "equity",
    tint: "var(--sky)",
    group: "Tech",
  },
  {
    symbol: "GOOGLx",
    name: "Alphabet",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    kind: "equity",
    tint: "var(--periwinkle)",
    group: "Tech",
  },
  {
    symbol: "PLTRx",
    name: "Palantir",
    mint: "XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4",
    kind: "equity",
    tint: "var(--violet)",
    group: "Tech",
  },
  {
    symbol: "METAx",
    name: "Meta",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
    kind: "equity",
    tint: "var(--cornflower)",
    group: "Tech",
  },
  {
    symbol: "AMZNx",
    name: "Amazon",
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
    kind: "equity",
    tint: "var(--gold)",
    group: "Tech",
  },
  {
    symbol: "INTCx",
    name: "Intel",
    mint: "XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM",
    kind: "equity",
    tint: "var(--sky)",
    group: "Tech",
  },

  /* ---- Crypto-linked ---- */
  {
    symbol: "CRCLx",
    name: "Circle",
    mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
    kind: "equity",
    tint: "var(--mist)",
    group: "Crypto-linked",
  },
  {
    symbol: "COINx",
    name: "Coinbase",
    mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
    kind: "equity",
    tint: "var(--cornflower)",
    group: "Crypto-linked",
  },
  {
    symbol: "HOODx",
    name: "Robinhood",
    mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
    kind: "equity",
    tint: "var(--lime)",
    group: "Crypto-linked",
  },
  {
    symbol: "MSTRx",
    name: "Strategy",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
    kind: "equity",
    tint: "var(--gold)",
    group: "Crypto-linked",
  },
  {
    symbol: "DFDVx",
    name: "DeFi Development",
    mint: "Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy",
    kind: "equity",
    tint: "var(--violet)",
    group: "Crypto-linked",
  },

  /* ---- Consumer & other ---- */
  {
    symbol: "TSLAx",
    name: "Tesla",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    kind: "equity",
    tint: "var(--coral)",
    group: "Consumer & other",
  },
  {
    symbol: "MCDx",
    name: "McDonald's",
    mint: "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2",
    kind: "equity",
    tint: "var(--gold)",
    group: "Consumer & other",
  },
  {
    symbol: "KOx",
    name: "Coca-Cola",
    mint: "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ",
    kind: "equity",
    tint: "var(--coral)",
    group: "Consumer & other",
  },
  {
    symbol: "GMEx",
    name: "GameStop",
    mint: "Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc",
    kind: "equity",
    tint: "var(--lime)",
    group: "Consumer & other",
  },
  {
    symbol: "BRK.Bx",
    name: "Berkshire Hathaway",
    mint: "Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x",
    kind: "equity",
    tint: "var(--periwinkle)",
    group: "Consumer & other",
  },
];

export const ALL_TOKENS = [...COLLATERAL_TOKENS, ...EQUITY_TOKENS];

/** Order the market table and swap selector present groups in. */
export const TOKEN_GROUPS: TokenGroup[] = [
  "Index & commodity",
  "Tech",
  "Crypto-linked",
  "Consumer & other",
];

/**
 * Kamino's primary lending market. Its reserves are the source of the live
 * supply/borrow rates and max-LTV parameters shown on the site.
 */
export const KAMINO_MAIN_MARKET = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

/** Builds a real Jupiter swap deep link for a pair. */
export function jupiterSwapUrl(inputMint: string, outputMint: string): string {
  return `https://jup.ag/swap/${inputMint}-${outputMint}`;
}
