"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { MarketSnapshot } from "@/lib/market";

/**
 * Holds the market snapshot rendered on the server and refreshes it in the
 * background so the page stays live without a reload.
 */

const POLL_MS = 60_000;

type MarketState = {
  snapshot: MarketSnapshot;
  /** Wall-clock seconds since the snapshot was taken, ticking once a second. */
  ageSeconds: number;
  refreshing: boolean;
  /** Set when a background refresh fails; the last good snapshot stays on screen. */
  staleError: string | null;
};

const MarketContext = createContext<MarketState | null>(null);

export function useMarket(): MarketState {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>");
  return ctx;
}

export function MarketProvider({
  initial,
  children,
}: {
  initial: MarketSnapshot;
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [staleError, setStaleError] = useState<string | null>(null);
  const [ageSeconds, setAgeSeconds] = useState(0);

  // Poll for a fresh snapshot.
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (document.visibilityState === "hidden") return;
      setRefreshing(true);
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const next: MarketSnapshot = await res.json();
        if (cancelled) return;
        setSnapshot(next);
        setStaleError(null);
      } catch (err) {
        if (!cancelled) setStaleError(err instanceof Error ? err.message : "refresh failed");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }

    const id = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  // Tick the displayed age once a second.
  useEffect(() => {
    const taken = new Date(snapshot.fetchedAt).getTime();
    const tick = () => setAgeSeconds(Math.max(0, Math.round((Date.now() - taken) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [snapshot.fetchedAt]);

  return (
    <MarketContext.Provider value={{ snapshot, ageSeconds, refreshing, staleError }}>
      {children}
    </MarketContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Live status pill                                                    */
/* ------------------------------------------------------------------ */

export function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  const { snapshot, ageSeconds, refreshing, staleError } = useMarket();
  const degraded = !snapshot.sources.jupiter || !snapshot.sources.kamino || staleError !== null;

  const color = degraded ? "var(--amber)" : "var(--pos)";
  const text = degraded ? "Degraded feed" : label;

  return (
    <span
      className="inline-flex items-center gap-2 border px-3 py-1.5 text-[9.5px] tracking-[0.14em] uppercase"
      style={{ borderColor: color, color, background: "rgba(255,255,255,0.02)" }}
      title={
        degraded
          ? snapshot.errors.join(" · ") || staleError || "Some sources are unavailable"
          : "Prices from Jupiter, rates from Kamino"
      }
    >
      <span
        className={refreshing ? "pulse-dot h-1.5 w-1.5 rounded-full" : "h-1.5 w-1.5 rounded-full"}
        style={{ background: color }}
        aria-hidden="true"
      />
      {text} · updated {formatAge(ageSeconds)}
    </span>
  );
}
