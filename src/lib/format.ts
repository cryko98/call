/** Number formatting helpers shared across the site. */

/** Rendered wherever a live value is genuinely unavailable. */
export const NO_DATA = "—";

export function usd(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Large prices read better without cents; small ones need them. */
export function autoUsd(n: number): string {
  return usd(n, Math.abs(n) >= 1000 ? 0 : 2);
}

export function compactUsd(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return usd(n, 0);
}

export function compactNum(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString("en-US");
}

export function num(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function pct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function signedPct(n: number, decimals = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

/** Applies a formatter only when the value is actually present. */
export function fmt<T>(value: T | null | undefined, format: (v: T) => string): string {
  return value === null || value === undefined ? NO_DATA : format(value);
}
