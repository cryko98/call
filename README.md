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

## ⚠ All market data on this site is simulated

Every price, APY, APR and 24h change rendered on the page is a **hardcoded
placeholder** living in `src/lib/data.ts`. Nothing is fetched. The page marks
this in three places — the `DEMO FEED` label on the ticker, the amber flags on
the calculator and markets sections, and the FAQ — and those markers should stay
until real feeds are wired in. Shipping fake numbers without them would be
misleading to anyone reading the page as live data.

The contract address is deliberately empty (`BRAND.contract = ""`), which renders
as *"Not yet deployed"* and disables the copy button. Fill it in at TGE and the
bar starts working on its own.

## Layout

```
src/
  app/
    layout.tsx      fonts, metadata, OG tags
    globals.css     design tokens + terminal/CRT styling
    page.tsx        section order
  components/
    chrome.tsx      logo, nav, contract bar, footer
    hero.tsx        ticker tape, typewriter terminal, stat strip
    calculator.tsx  position builder (the interactive piece)
    markets.tsx     collateral / borrow market tables
    sections.tsx    how it works, risk engine, tokenomics, roadmap, FAQ
  lib/
    data.ts         all copy + market data + risk bands
    format.ts       currency / percent formatting
```

Nearly all copy lives in `data.ts`. Editing the roadmap, FAQ, tokenomics split or
market list should not require touching a component.

## Calculator maths

Given collateral amount `A` at price `P`, threshold `T` and chosen LTV `L`:

```
collateralValue = A × P
debt            = collateralValue × L
liquidationPx   = debt / (A × T)
healthFactor    = (collateralValue × T) / debt
netAnnualCarry  = collateralValue × supplyApy − debt × borrowApr
```

Health factor drives the colour band in `healthBand()`: ≥1.8 safe, ≥1.35
moderate, ≥1.0 at risk, below that liquidatable. The hero terminal narrates the
same example the calculator produces at its defaults (100 SOL, 50% LTV →
10,730 USDC, liquidation at $134.13), so if you change the default prices,
update the terminal lines in `hero.tsx` to match.

The model excludes gas, liquidation penalties and rate drift — it is a
sizing tool, not a risk system.

## Going live

1. **Prices** — replace the static `price` / `change` fields with Pyth
   (`@pythnetwork/hermes-client`) or Birdeye. The components already read from
   `data.ts`, so a loader that returns the same shapes drops straight in.
2. **Token stats** — DexScreener's public endpoint
   (`api.dexscreener.com/latest/dex/tokens/<mint>`) covers price, market cap,
   liquidity and volume with no API key. That fills the `STATS` strip.
3. **Pool rates** — supply/borrow APY come from the lending program's own
   utilisation curve; until that exists on devnet they stay placeholders.
4. **Remove the DEMO flags** only once 1–3 are actually live.

## Legal

The footer carries a risk disclaimer. If this is promoted to EU users, that
disclaimer and the "not financial advice" framing are a MiCA requirement, not a
nicety — keep them.
