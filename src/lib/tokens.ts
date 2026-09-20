/**
 * Verified Solana mint registry.
 *
 * Every mint below was resolved through the Jupiter token API and cross-checked
 * on issuer name, liquidity and holder count — not copied from memory. The
 * xStocks are real tokenized equities issued by Backed Finance and they trade
 * on Solana DEXes today, which is what makes the live price feed possible.
 *
 * Re-verify with:
 *   curl "https://lite-api.jup.ag/tokens/v2/search?query=<SYMBOL>"
 */

export type TokenKind = "collateral" | "equity";

export type TokenDef = {
  symbol: string;
  /** Short display name. The API returns the issuer's own longer name. */
  name: string;
  mint: string;
  kind: TokenKind;
  tint: string;
  /** Starting amount in the calculator, sized so the default position is realistic. */
  defaultAmount?: number;
};

export const COLLATERAL_TOKENS: TokenDef[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    kind: "collateral",
    tint: "#9b7cf6",
    defaultAmount: 100,
  },
  {
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    kind: "collateral",
    tint: "#00e676",
    defaultAmount: 100,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    kind: "collateral",
    tint: "#f7931a",
    defaultAmount: 0.25,
  },
  {
    symbol: "wETH",
    name: "Wrapped Ether",
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    kind: "collateral",
    tint: "#4da3ff",
    defaultAmount: 5,
  },
];

export const EQUITY_TOKENS: TokenDef[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    kind: "equity",
    tint: "#2775ca",
  },
  {
    symbol: "SPYx",
    name: "S&P 500",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    kind: "equity",
    tint: "#4da3ff",
  },
  {
    symbol: "AAPLx",
    name: "Apple",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    kind: "equity",
    tint: "#dce4ed",
  },
  {
    symbol: "NVDAx",
    name: "NVIDIA",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    kind: "equity",
    tint: "#76b900",
  },
  {
    symbol: "TSLAx",
    name: "Tesla",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    kind: "equity",
    tint: "#ff4d4d",
  },
  {
    symbol: "MSTRx",
    name: "Strategy",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
    kind: "equity",
    tint: "#ffb000",
  },
  {
    symbol: "GOOGLx",
    name: "Alphabet",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    kind: "equity",
    tint: "#9b7cf6",
  },
  {
    symbol: "MSFTx",
    name: "Microsoft",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    kind: "equity",
    tint: "#00d4ff",
  },
];

export const ALL_TOKENS = [...COLLATERAL_TOKENS, ...EQUITY_TOKENS];

/**
 * Kamino's primary lending market. Its reserves are the source of the live
 * supply/borrow rates and max-LTV parameters shown on the site.
 */
export const KAMINO_MAIN_MARKET = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

/** Builds a real Jupiter swap deep link for a pair. */
export function jupiterSwapUrl(inputMint: string, outputMint: string): string {
  return `https://jup.ag/swap/${inputMint}-${outputMint}`;
}
