import { Footer, Nav } from "@/components/chrome";
import { Hero, StatStrip, TickerTape } from "@/components/hero";
import { BorrowCalculator } from "@/components/calculator";
import { Markets } from "@/components/markets";
import { MarketProvider } from "@/components/market-context";
import { SolanaProviders } from "@/components/wallet-provider";
import { SwapPanel } from "@/components/swap-panel";
import {
  Architecture,
  ClosingCta,
  Faq,
  HowItWorks,
  Roadmap,
  SectionHead,
  Tokenomics,
} from "@/components/sections";
import { getMarketSnapshot } from "@/lib/market";

/**
 * Rebuild on the same cadence the upstream feeds are cached at. Next.js
 * statically analyses this export, so it has to be a literal — keep it in step
 * with REVALIDATE_SECONDS in src/lib/market.ts.
 */
export const revalidate = 60;

/**
 * The lending program is not deployed, so deposit and borrow cannot execute.
 * Say that where someone would otherwise reach for a button.
 */
function LendingNotice() {
  return (
    <div
      className="mt-6 border p-5"
      style={{ borderColor: "var(--amber)", background: "rgba(255,176,0,0.04)" }}
    >
      <h3 className="text-[13px] font-semibold" style={{ color: "var(--amber)" }}>
        Deposit and borrow are not live yet
      </h3>
      <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-muted">
        The Margin Call lending program has not been deployed to devnet or mainnet, so there is
        nothing on-chain to deposit into. The calculator above models a position against live
        prices and live Kamino parameters, but it cannot open one. What you{" "}
        <em>can</em> do on this page today is swap — through Jupiter, signed by your own wallet,
        settling on mainnet.{" "}
        <a href="#swap" className="underline" style={{ color: "var(--amber)" }}>
          Jump to the swap panel ↓
        </a>
      </p>
    </div>
  );
}

function CalculatorSection() {
  return (
    <section id="borrow" className="scroll-mt-24 border-t border-line py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead
          tag="// 03 — Position builder"
          title="See your borrowing power."
          sub="Live prices and live lending parameters. Adjust collateral and leverage to model borrowing capacity, liquidation price and carry cost before you commit capital."
        />
        <div className="mt-9">
          <BorrowCalculator />
        </div>
        <LendingNotice />
      </div>
    </section>
  );
}

function SwapSection() {
  return (
    <section className="scroll-mt-24 border-t border-line py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead
          tag="// 04 — Execute"
          title="Trade it, here."
          sub="Connect a wallet and swap between crypto and tokenized equities without leaving the page. Routes and prices come from Jupiter; your wallet signs the transaction and it settles on Solana mainnet."
        />
        <div className="mt-9 max-w-2xl">
          <SwapPanel />
        </div>
      </div>
    </section>
  );
}

function MarketsSection() {
  return (
    <section id="markets" className="scroll-mt-24 border-t border-line py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead
          tag="// 05 — Markets"
          title="Crypto collateral. Equity exposure."
          sub="Blue-chip crypto on the supply side, real tokenized equities on the borrow side — both trading on Solana today, priced from the same routes a swap would take."
        />
        <div className="mt-9">
          <Markets />
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const snapshot = await getMarketSnapshot();

  return (
    <SolanaProviders>
      <MarketProvider initial={snapshot}>
        <TickerTape />
        <Nav />
        <main>
          <Hero />
          <StatStrip />
          <HowItWorks />
          <Architecture />
          <CalculatorSection />
          <SwapSection />
          <MarketsSection />
          <Tokenomics />
          <Roadmap />
          <Faq />
          <ClosingCta />
        </main>
        <Footer />
      </MarketProvider>
    </SolanaProviders>
  );
}
