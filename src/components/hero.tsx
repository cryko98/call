"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { COLLATERAL, EQUITIES, STATS, type Stat } from "@/lib/data";
import { autoUsd, num, signedPct } from "@/lib/format";
import { ContractBar } from "./chrome";

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
  const feed = [...COLLATERAL, ...EQUITIES];
  const row = [...feed, ...feed];

  return (
    <div
      className="sticky top-0 z-[60] flex h-[34px] items-center overflow-hidden border-b border-line"
      style={{ background: "rgba(6, 8, 10, 0.94)", backdropFilter: "blur(8px)" }}
    >
      <div className="label flex h-full shrink-0 items-center gap-2 border-r border-line bg-panel px-3">
        <span
          className="pulse-dot h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--pos)", boxShadow: "0 0 8px var(--pos)" }}
          aria-hidden="true"
        />
        Demo feed
      </div>
      <div className="marquee-track flex w-max">
        {row.map((a, i) => (
          <span
            key={`${a.symbol}-${i}`}
            className="flex shrink-0 items-center gap-2 border-r border-line-soft px-4 text-[11.5px]"
          >
            <b className="font-semibold tracking-[0.04em]">{a.symbol}</b>
            <span className="text-muted">{autoUsd(a.price)}</span>
            <span style={{ color: a.change >= 0 ? "var(--pos)" : "var(--neg)" }}>
              {a.change >= 0 ? "▲" : "▼"} {signedPct(a.change)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal typewriter                                                 */
/* ------------------------------------------------------------------ */

type Tone = "cmd" | "ok" | "warn" | "dim";

const LINES: { text: string; tone: Tone }[] = [
  { text: "$ margin-call init --chain solana", tone: "cmd" },
  { text: "  ✓ wallet connected · 7xK…9mQ2", tone: "ok" },
  { text: "$ deposit 100 SOL --as collateral", tone: "cmd" },
  { text: "  ✓ collateral posted · $21,460.00", tone: "ok" },
  { text: "$ borrow 10730 USDC --ltv 0.50", tone: "cmd" },
  { text: "  ✓ funded · liquidation at $134.13", tone: "ok" },
  { text: "$ swap USDC → NVDAx", tone: "cmd" },
  { text: "  ✓ filled · 58.49 NVDAx · long equity", tone: "warn" },
  { text: "  ▸ crypto exposure: UNCHANGED", tone: "dim" },
];

const TONE_COLOR: Record<Tone, string> = {
  cmd: "var(--pos)",
  ok: "var(--pos)",
  warn: "var(--amber)",
  dim: "var(--muted)",
};

function Terminal() {
  const reduced = usePrefersReducedMotion();
  const [lines, setLines] = useState<{ text: string; tone: Tone }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) return;

    let lineIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (lineIdx >= LINES.length) {
        setDone(true);
        return;
      }
      const line = LINES[lineIdx];
      charIdx += 1;

      const partial = line.text.slice(0, charIdx);
      const at = lineIdx;
      setLines((prev) => {
        const next = prev.slice(0, at);
        next.push({ text: partial, tone: line.tone });
        return next;
      });

      if (charIdx >= line.text.length) {
        lineIdx += 1;
        charIdx = 0;
        timer = setTimeout(step, 230);
      } else {
        timer = setTimeout(step, line.tone === "cmd" ? 24 : 11);
      }
    };

    timer = setTimeout(step, 420);
    return () => clearTimeout(timer);
  }, [reduced]);

  // With motion reduced the whole session is shown at once, no typing.
  const shown = reduced ? LINES : lines;
  const showCaret = reduced || done;

  return (
    <div className="panel max-w-xl">
      <div className="label flex items-center gap-2 border-b border-line bg-panel-2 px-3 py-2">
        <span className="h-2 w-2 rounded-full" style={{ background: "#ff5f57" }} aria-hidden="true" />
        <span className="h-2 w-2 rounded-full" style={{ background: "#febc2e" }} aria-hidden="true" />
        <span className="h-2 w-2 rounded-full" style={{ background: "#28c840" }} aria-hidden="true" />
        <span className="ml-1.5 normal-case">margin-call — /bin/sh — 80×24</span>
      </div>
      <div
        className="px-4 py-3.5 text-[12px] leading-[1.95]"
        style={{ minHeight: 196 }}
        aria-label="Example terminal session"
      >
        {shown.map((l, i) => (
          <div key={i} style={{ color: TONE_COLOR[l.tone] }}>
            {l.text}
          </div>
        ))}
        {showCaret && <span className="caret" aria-hidden="true" />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced || target === 0) return;

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

  return reduced ? target : value;
}

function StatCell({ stat, delay }: { stat: Stat; delay: number }) {
  const v = useCountUp(stat.value);

  return (
    <div
      className="rise border-b border-line px-5 py-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="label">{stat.label}</div>
      <div className="mt-1.5 text-[24px] font-semibold tracking-tight sm:text-[27px]">
        {stat.prefix ?? ""}
        {num(v, 0)}
        {stat.suffix ? <span className="text-[0.62em] text-muted">{stat.suffix}</span> : null}
      </div>
      <div
        className="mt-1 text-[10.5px]"
        style={{ color: stat.noteTone === "pos" ? "var(--pos)" : "var(--dim)" }}
      >
        {stat.note}
      </div>
    </div>
  );
}

export function StatStrip() {
  return (
    <div className="border-y border-line bg-panel">
      <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCell key={s.label} stat={s} delay={220 + i * 70} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="glow-amber absolute inset-x-0 top-0 h-[520px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-16 pb-16 sm:px-6 sm:pt-20">
        <div className="rise label inline-flex items-center gap-2 border border-line bg-panel px-3 py-1.5">
          <span
            className="pulse-dot h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--pos)" }}
            aria-hidden="true"
          />
          Built on Solana · SPL token
        </div>

        <h1
          className="rise mt-6 max-w-3xl text-[34px] leading-[1.06] font-bold tracking-[-0.02em] sm:text-[58px]"
          style={{ animationDelay: "70ms" }}
        >
          Don&apos;t sell your bags.
          <br />
          <span style={{ color: "var(--amber)", textShadow: "0 0 34px rgba(255,176,0,0.28)" }}>
            Borrow against them.
          </span>
        </h1>

        <p
          className="rise mt-5 max-w-2xl text-[13.5px] leading-[1.8] text-muted sm:text-[15px]"
          style={{ animationDelay: "140ms" }}
        >
          Post SOL, BTC or ETH as collateral. Draw stablecoin liquidity against it. Buy tokenized
          equities — AAPL, NVDA, TSLA — without ever closing your crypto position. One margin
          account, two markets, zero paperwork.
        </p>

        <div className="rise mt-8" style={{ animationDelay: "210ms" }}>
          <Terminal />
        </div>

        <div
          id="buy"
          className="rise mt-8 flex scroll-mt-28 flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "280ms" }}
        >
          <a
            href="#borrow"
            className="px-6 py-3.5 text-center text-[12px] font-semibold tracking-[0.11em] transition-opacity hover:opacity-90"
            style={{ background: "var(--amber)", color: "var(--bg)" }}
          >
            RUN THE NUMBERS →
          </a>
          <a
            href="#how"
            className="border border-line bg-panel px-6 py-3.5 text-center text-[12px] font-semibold tracking-[0.11em] transition-colors hover:border-muted"
          >
            SEE HOW IT WORKS
          </a>
        </div>

        <div className="rise mt-6" style={{ animationDelay: "350ms" }}>
          <ContractBar />
        </div>
      </div>
    </section>
  );
}
