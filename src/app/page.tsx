import { Footer, Nav } from "@/components/chrome";
import { Hero, StatStrip, TickerTape } from "@/components/hero";
import { BorrowCalculator } from "@/components/calculator";
import { Markets } from "@/components/markets";
import { MarketProvider } from "@/components/market-context";
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
      </div>
    </section>
  );
}

function MarketsSection() {
  return (
    <section id="markets" className="scroll-mt-24 border-t border-line py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead
          tag="// 04 — Markets"
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
    <MarketProvider initial={snapshot}>
      <TickerTape />
      <Nav />
      <main>
        <Hero />
        <StatStrip />
        <HowItWorks />
        <Architecture />
        <CalculatorSection />
        <MarketsSection />
        <Tokenomics />
        <Roadmap />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </MarketProvider>
  );
}
