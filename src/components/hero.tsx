"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MarketAsset } from "@/lib/market";
import { autoUsd, compactNum, compactUsd, fmt, NO_DATA, signedPct } from "@/lib/format";
import { ContractBar } from "./chrome";
import { LiveBadge, useMarket } from "./market-context";
import { HandArrow, Mascot, PixelCloud, PixelCoin, Sparkle } from "./pixel-art";

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Read the media query as an external store rather than mirroring it into
 * state from an effect — that keeps the server render deterministic and
 * avoids a cascading re-render on mount.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* Ticker tape                                                         */
/* ------------------------------------------------------------------ */

export function TickerTape() {
  const { snapshot } = useMarket();
  const feed = [...snapshot.collateral, ...snapshot.equities].filter((a) => a.price !== null);
  const row = feed.length ? [...feed, ...feed] : [];

  return (
    <div
      className="sticky top-0 z-[60] flex h-[42px] items-center overflow-hidden border-b-[3px] border-ink"
      style={{ background: "var(--lemon)" }}
    >
      {row.length ? (
        <div className="marquee-track flex w-max items-center">
          {row.map((a, i) => (
            <span key={`${a.symbol}-${i}`} className="flex shrink-0 items-center gap-2 px-5">
              <span className="text-[14px] font-extrabold">{a.symbol}</span>
              <span className="text-[14px] font-semibold">{fmt(a.price, autoUsd)}</span>
              {a.change24h !== null && (
                <span
                  className="text-[13.5px] font-bold"
                  style={{ color: a.change24h >= 0 ? "var(--pos)" : "var(--neg)" }}
                >
                  {a.change24h >= 0 ? "↑" : "↓"} {signedPct(a.change24h)}
                </span>
              )}
              <span className="ml-3 text-ink/30">★</span>
            </span>
          ))}
        </div>
      ) : (
        <span className="px-5 text-[13.5px] font-bold">
          Price feed unavailable — retrying automatically
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked price cards                                                 */
/* ------------------------------------------------------------------ */

const TILTS = ["rotate(-4deg)", "rotate(2.2deg)", "rotate(-1.6deg)", "rotate(3.4deg)", "rotate(-2.6deg)"];

function PriceCard({
  asset,
  index,
  reduced,
}: {
  asset: MarketAsset;
  index: number;
  reduced: boolean;
}) {
  return (
    <div
      className="pop pop-hover pop-in relative flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
      style={{
        background: asset.tint,
        transform: reduced ? undefined : TILTS[index % TILTS.length],
        marginTop: index === 0 ? 0 : -10,
        zIndex: index,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-white text-[12px] font-extrabold sm:h-11 sm:w-11"
        aria-hidden="true"
      >
        {asset.symbol.replace(/x$/, "").slice(0, 4)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-extrabold tracking-[-0.02em] sm:text-[17px]">
            {asset.symbol}/USD
          </span>
          <span className="pill pill-new">new!</span>
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-ink/60">
          {asset.name}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block text-[16px] font-extrabold sm:text-[19px]">
          {fmt(asset.price, autoUsd)}
        </span>
        {asset.change24h !== null && (
          <span
            className="block text-[13px] font-bold"
            style={{ color: asset.change24h >= 0 ? "var(--pos)" : "var(--neg)" }}
          >
            {signedPct(asset.change24h)}
          </span>
        )}
      </span>
    </div>
  );
}

function StackedCards() {
  const { snapshot } = useMarket();
  const reduced = usePrefersReducedMotion();

  const cards = snapshot.equities
    .filter((a) => a.symbol !== "USDC" && a.price !== null)
    .slice(0, 5);

  if (!cards.length) {
    return (
      <div className="pop p-6 text-center text-[14px] font-bold">
        Live prices are unavailable right now.
      </div>
    );
  }

  return (
    <div className="relative">
      <Sparkle size={34} className="absolute -top-5 -left-4 z-20 hidden sm:block" />
      <Sparkle size={24} className="absolute -right-3 bottom-8 z-20 hidden sm:block" />
      <div className="flex flex-col">
        {cards.map((a, i) => (
          <PriceCard key={a.symbol} asset={a} index={i} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

function useCountUp(target: number | null, duration = 1200) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced || target === null || target === 0) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, reduced]);

  if (target === null) return null;
  return reduced ? target : value;
}

function StatCard({
  label,
  target,
  format,
  note,
  tint,
  delay,
}: {
  label: string;
  target: number | null;
  format: (v: number) => string;
  note: string;
  tint: string;
  delay: number;
}) {
  const v = useCountUp(target);

  return (
    <div
      className="pop pop-in pop-hover p-5"
      style={{ background: tint, animationDelay: `${delay}ms` }}
    >
      <div className="label">{label}</div>
      <div className="mt-1.5 text-[28px] font-extrabold tracking-[-0.035em] sm:text-[32px]">
        {v === null ? <span className="text-ink/35">{NO_DATA}</span> : format(v)}
      </div>
      <div className="mt-0.5 text-[12.5px] font-semibold text-ink/55">
        {v === null ? "source unavailable" : note}
      </div>
    </div>
  );
}

export function StatStrip() {
  const { snapshot } = useMarket();
  const { totals } = snapshot;
  const solBorrow = snapshot.collateral.find((a) => a.symbol === "SOL")?.borrowApy ?? null;

  return (
    <section className="band-edge band-paper px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="xStock liquidity"
          target={totals.equityLiquidityUsd}
          format={compactUsd}
          note="across tracked pools"
          tint="var(--periwinkle)"
          delay={0}
        />
        <StatCard
          label="24h volume"
          target={totals.equityVolume24h}
          format={compactUsd}
          note="real DEX turnover"
          tint="var(--lime)"
          delay={70}
        />
        <StatCard
          label="Live stock markets"
          target={totals.equityMarkets}
          format={(v) => compactNum(v)}
          note="priced this minute"
          tint="var(--gold)"
          delay={140}
        />
        <StatCard
          label="SOL borrow rate"
          target={solBorrow}
          format={(v) => `${v.toFixed(2)}%`}
          note="Kamino main market"
          tint="var(--coral)"
          delay={210}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section id="top" className="sunburst band-sky relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      {/* ornaments */}
      <PixelCloud size={140} className="absolute top-10 left-2 text-white/80" />
      <PixelCloud size={110} className="absolute top-40 right-4 text-white/65" />
      <PixelCloud size={90} className="absolute bottom-10 left-1/4 text-white/55 hidden lg:block" />
      <PixelCoin size={46} className="bob absolute top-24 right-[12%] hidden lg:block" />
      <PixelCoin size={34} className="bob absolute bottom-24 left-[6%] hidden lg:block" style={{ animationDelay: "1.2s" }} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* ---------------- copy ---------------- */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="pill" style={{ background: "var(--lemon)" }}>
              Built on Solana
            </span>
            <LiveBadge />
          </div>

          <h1 className="mt-5 text-[42px] leading-[0.96] font-black tracking-[-0.04em] sm:text-[62px]">
            Don&apos;t sell
            <br />
            your bags.
            <br />
            {/* Highlight is painted first and the text sits above it — no
                negative z-index, which would fall behind the band colour. */}
            <span className="relative inline-block">
              <span
                className="absolute inset-x-[-10px] inset-y-[2px] -rotate-1 rounded-xl border-[2.5px] border-ink"
                style={{ background: "var(--lemon)" }}
                aria-hidden="true"
              />
              <span className="relative">Borrow!</span>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[16px] leading-relaxed font-medium text-ink/75 sm:text-[17.5px]">
            Post SOL or BTC as collateral, draw stablecoins against it, and buy tokenized stocks —
            AAPL, NVDA, TSLA — without ever closing your crypto position.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#swap" className="btn btn-orange">
              Trade now
            </a>
            <a href="#borrow" className="btn">
              Run the numbers
            </a>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <ContractBar />
            <span className="hand hidden shrink-0 -rotate-6 pb-2 text-[19px] text-ink/60 sm:block">
              coming at launch!
            </span>
          </div>
        </div>

        {/* ---------------- stacked live cards ---------------- */}
        <div className="relative">
          <div className="relative z-10">
            <StackedCards />
          </div>

          <div className="relative mt-8 hidden justify-end sm:flex">
            <span className="hand absolute top-4 left-2 -rotate-6 text-[22px] text-ink/70">
              real prices, live
            </span>
            <HandArrow size={64} className="absolute top-2 left-[150px] rotate-12 text-ink/45" />
            <Mascot size={150} className="bob" />
          </div>
        </div>
      </div>
    </section>
  );
}
