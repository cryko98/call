import { Footer, Nav } from "@/components/chrome";
import { Hero, StatStrip, TickerTape } from "@/components/hero";
import { BorrowCalculator } from "@/components/calculator";
import { Markets } from "@/components/markets";
import { MarketProvider } from "@/components/market-context";
import { SolanaProviders } from "@/components/wallet-provider";
import { SwapPanel } from "@/components/swap-panel";
import { Mascot, Sparkle } from "@/components/pixel-art";
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
    <div className="pop mt-7 flex flex-wrap items-start gap-5 p-6" style={{ background: "var(--gold)" }}>
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-white text-[21px] font-black"
        aria-hidden="true"
      >
        !
      </span>
      <div className="min-w-[260px] flex-1">
        <h3 className="text-[19px] font-extrabold tracking-[-0.03em]">
          Deposit and borrow aren&apos;t live yet
        </h3>
        <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed font-medium text-ink/75">
          The Margin Call lending program has not been deployed to devnet or mainnet, so there is
          nothing on-chain to deposit into. The calculator above models a position against live
          prices and live Kamino parameters, but it cannot open one. What you <em>can</em> do on
          this page today is swap — through Jupiter, signed by your own wallet, settling on
          mainnet.
        </p>
        <a href="#swap" className="btn mt-4 !py-2.5 !text-[14px]">
          Go to the swap ↓
        </a>
      </div>
    </div>
  );
}

function CalculatorSection() {
  return (
    <section id="borrow" className="band-edge band-paper scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          tag="Calculator"
          title="See your borrowing power."
          note="live numbers"
          sub="Adjust collateral and leverage to model borrowing capacity, liquidation price and carry cost before you commit capital."
        />
        <div className="mt-10">
          <BorrowCalculator />
        </div>
        <LendingNotice />
      </div>
    </section>
  );
}

function SwapSection() {
  return (
    <section className="band-edge band-peri scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          tag="Trade"
          title="Trade it, right here."
          sub="Connect a wallet and swap between crypto and tokenized stocks without leaving the page. Routes and prices come from Jupiter; your wallet signs the transaction and it settles on Solana mainnet."
        />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <SwapPanel />

          <aside className="relative hidden lg:block">
            <Sparkle size={26} className="absolute top-6 left-0" />
            <Mascot size={210} className="bob mx-auto" />
            <p className="hand mt-2 rotate-3 text-center text-[21px] font-bold text-ink/60">
              your keys, your call
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function MarketsSection() {
  return (
    <section id="markets" className="band-edge band-paper scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          tag="Markets"
          title="Crypto in. Stocks out."
          sub="Blue-chip crypto on the supply side, real tokenized equities on the borrow side — both trading on Solana today, priced from the same routes a swap would take."
        />
        <div className="mt-10">
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
