# Margin Call — $CALL

Landing page for a Solana lending protocol: post crypto as collateral, draw
stablecoin liquidity against it, and buy tokenized equities without closing the
crypto position.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · IBM Plex Mono.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Where the numbers come from

Everything on the page that can be real, is real. Two public, key-less sources,
fetched server-side and refreshed about once a minute:

| Data | Source | Notes |
| --- | --- | --- |
| Price, 24h change, liquidity, 24h volume, holders | **Jupiter** (`lite-api.jup.ag`) | One bulk query for every mint |
| Supply APY, borrow APY, max LTV | **Kamino** main lending market | Live on-chain reserve parameters |
| Liquidation threshold | *protocol parameter* | max LTV + 5pp, capped at 95% — set by us, labelled as such |
| $CALL price / market cap | *none* | The token is not minted; the page says so instead of inventing figures |

The tokenized equities (SPYx, AAPLx, NVDAx, TSLAx, MSTRx, GOOGLx, MSFTx) are
real Backed Finance xStocks trading on Solana today, which is what makes live
pricing possible at all. Every mint in `src/lib/tokens.ts` was resolved through
the Jupiter API and cross-checked on issuer name, liquidity and holder count —
re-verify any of them with:

```bash
curl "https://lite-api.jup.ag/tokens/v2/search?query=AAPLx"
```

### No invented fallbacks

If a source fails, the affected fields come back `null` and the UI renders `—`
with a "Degraded feed" badge. It never substitutes a plausible-looking number. A
wrong figure on a lending page is worse than a missing one.

## Executing transactions

The page can execute a **real swap** on Solana mainnet. Connect a wallet
(Phantom, Solflare, Backpack — anything implementing the Wallet Standard; no
adapters are hardcoded), pick a pair, and the transaction is built by Jupiter,
signed by the wallet, and confirmed on-chain. Private keys never reach the site
and it cannot move funds on its own.

What it cannot do is **deposit or borrow**: the Margin Call lending program is
not deployed, so there is no on-chain account to call. The page says this plainly
next to the calculator rather than offering a button that does nothing.

### RPC

`NEXT_PUBLIC_SOLANA_RPC` sets the endpoint. Without it the app falls back to
`api.mainnet-beta.solana.com`, which is heavily rate-limited and will fail under
real traffic — wallet balances are usually the first thing to break. Set a
dedicated endpoint (Helius, Triton, QuickNode) before launch:

```bash
# .env.local
NEXT_PUBLIC_SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=...
```

### Guardrails

`/api/swap` proxies Jupiter rather than letting the browser call it directly,
which is what makes these checks enforceable:

- Both mints must be in the registry — on the quote **and again** on the POST
  that returns a signable transaction, since the client could alter the quote in
  between
- Slippage is clamped to 1–500 bps
- Amounts must be positive integers in base units; the decimal → base-unit
  conversion uses `BigInt`, never a float
- Quotes re-fetch every 20s, so a stale price is never what gets signed
- The UI shows minimum received, price impact and route before the user commits

### Known dependency advisory

`npm audit` reports a moderate DoS advisory in `stream-json`, reached through
`jayson` inside `@solana/web3.js` v1. There is no upstream fix, and the whole
wallet-adapter ecosystem currently sits on that version. It affects JSON-RPC
response parsing, so exposure is limited to a malicious RPC endpoint — another
reason to point `NEXT_PUBLIC_SOLANA_RPC` at a provider you trust.

## Data flow

```
src/lib/tokens.ts      verified mint registry + Jupiter deep-link helper
src/lib/market.ts      fetches Jupiter + Kamino, builds MarketSnapshot
src/app/page.tsx       server component: awaits the snapshot (ISR, 60s)
src/app/api/market/    same snapshot as JSON, for the client poller
src/app/api/swap/      Jupiter quote + swap proxy, with mint allowlisting
src/components/
  market-context.tsx   holds the snapshot, polls /api/market, LiveBadge
  wallet-provider.tsx  connection + Wallet Standard discovery
  swap-panel.tsx       the executable part: quote, sign, confirm
  hero.tsx             ticker tape, terminal, headline stats
  calculator.tsx       position builder
  markets.tsx          collateral + equity tables
  sections.tsx         how it works, risk engine, tokenomics, roadmap, FAQ
  chrome.tsx           logo, nav, contract bar, footer
src/lib/data.ts        editorial copy + risk bands only — no market data
```

The client refetches on an interval and when the tab regains focus, skipping the
request while the tab is hidden. A failed background refresh keeps the last good
snapshot on screen and flips the badge rather than blanking the page.

`revalidate` is exported as a literal `60` in both `page.tsx` and the market API
route — Next.js analyses that export statically, so it cannot be an imported
constant. Keep it in step with `REVALIDATE_SECONDS`.

## Calculator maths

Given collateral amount `A` at live price `P`, threshold `T` and chosen LTV `L`:

```
collateralValue = A × P
debt            = collateralValue × L
liquidationPx   = debt / (A × T)
healthFactor    = (collateralValue × T) / debt
netAnnualCarry  = collateralValue × supplyApy − debt × borrowApy
```

Health factor drives the colour band in `healthBand()`: ≥1.8 safe, ≥1.35
moderate, ≥1.0 at risk, below that liquidatable. The LTV slider is capped at the
live max LTV for the selected collateral, and assets without a live price are
disabled rather than guessed at.

The hero terminal narrates a position built from the same live inputs, so it can
never contradict the calculator below it.

The model excludes gas, liquidation penalties and rate drift — it is a sizing
tool, not a risk system.

## At token launch

Set `BRAND.contract` in `src/lib/data.ts` to the $CALL mint. The contract bar
switches from "Not yet deployed" to a working copy button on its own. To show
live $CALL market data and make it swappable, add the mint to
`src/lib/tokens.ts` — it then flows through the market pipeline and the swap
allowlist with no other changes.

## Legal

The footer carries a risk disclaimer. If this is promoted to EU users, that
disclaimer and the "not financial advice" framing are a MiCA requirement, not a
nicety — keep them.

Note that the site describes a lending protocol that does not exist yet: the
roadmap marks devnet and mainnet as unshipped, the FAQ states plainly that
nothing has been audited, and the calculator carries a notice that deposit and
borrow cannot execute. Keep all three honest as the project moves.
