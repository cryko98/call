import { Footer, Nav } from "@/components/chrome";
import { Hero, StatStrip, TickerTape } from "@/components/hero";
import { BorrowCalculator } from "@/components/calculator";
import { Markets } from "@/components/markets";
import {
  Architecture,
  ClosingCta,
  Faq,
  HowItWorks,
  Roadmap,
  SectionHead,
  Tokenomics,
} from "@/components/sections";

function CalculatorSection() {
  return (
    <section id="borrow" className="scroll-mt-24 border-t border-line py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead
          tag="// 03 — Position builder"
          title="See your borrowing power."
          sub="Adjust collateral and leverage to model borrowing capacity, liquidation price and carry cost before you commit capital."
          demo="Simulated prices — illustrative only"
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
          sub="Blue-chip crypto on the supply side, tokenized equities on the borrow side — settled on the same ledger, in the same block."
          demo="Simulated rates — not live market data"
        />
        <div className="mt-9">
          <Markets />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
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
    </>
  );
}
