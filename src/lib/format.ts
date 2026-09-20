/** Number formatting helpers shared across the site. */

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
