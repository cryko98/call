"use client";

import { useMemo, useState } from "react";
import { healthBand } from "@/lib/data";
import type { MarketAsset } from "@/lib/market";
import { jupiterSwapUrl } from "@/lib/tokens";
import { autoUsd, fmt, NO_DATA, num, pct, usd } from "@/lib/format";
import { LiveBadge, useMarket } from "./market-context";

/* ------------------------------------------------------------------ */
/* Asset chip                                                          */
/* ------------------------------------------------------------------ */

function AssetChip({
  asset,
  active,
  disabled,
  onSelect,
}: {
  asset: MarketAsset;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={active}
      title={disabled ? `${asset.symbol} has no live price right now` : asset.name}
      className="rounded-full border-[2.5px] border-ink px-3.5 py-2 text-[13.5px] font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-35"
      style={{
        background: active ? asset.tint : "var(--paper)",
        boxShadow: active ? "3px 3px 0 var(--ink)" : "none",
        transform: active ? "translate(-1px, -1px)" : undefined,
      }}
    >
      {asset.symbol}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Output row                                                          */
/* ------------------------------------------------------------------ */

function Row({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  const missing = value === NO_DATA;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 py-3 last:border-b-0">
      <span className="text-[13.5px] font-semibold text-ink/65">{label}</span>
      <span className="text-right">
        <span
          className="text-[16px] font-extrabold"
          style={missing ? { color: "var(--ink-faint)" } : color ? { color } : undefined}
        >
          {value}
        </span>
        {hint && !missing ? (
          <span className="ml-2 text-[12.5px] font-semibold text-ink/45">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

/** Used only when Kamino has no reserve for the selected collateral. */
const FALLBACK_MAX_LTV = 0.5;

const BAND_TINT: Record<string, string> = {
  Safe: "var(--lime)",
  Moderate: "var(--gold)",
  "At risk": "var(--coral)",
  Liquidatable: "var(--coral)",
  "No debt": "var(--mist)",
};

export function BorrowCalculator() {
  const { snapshot } = useMarket();
  const collateralList = snapshot.collateral;
  const borrowList = snapshot.equities;

  const [collateralSymbol, setCollateralSymbol] = useState("SOL");
  const [borrowSymbol, setBorrowSymbol] = useState("USDC");
  const [amountInput, setAmountInput] = useState("100");
  const [ltvPct, setLtvPct] = useState(50);

  const collateral =
    collateralList.find((c) => c.symbol === collateralSymbol) ?? collateralList[0];
  const borrow = borrowList.find((b) => b.symbol === borrowSymbol) ?? borrowList[0];

  const maxLtvPct = Math.round((collateral?.maxLtv ?? FALLBACK_MAX_LTV) * 100);
  const effectiveLtv = Math.min(ltvPct, maxLtvPct);
  const ltvIsLive = collateral?.maxLtv !== null && collateral?.maxLtv !== undefined;

  function selectCollateral(next: MarketAsset) {
    setCollateralSymbol(next.symbol);
    setAmountInput(String(next.defaultAmount ?? 1));
    setLtvPct((v) => Math.min(v, Math.round((next.maxLtv ?? FALLBACK_MAX_LTV) * 100)));
  }

  const result = useMemo(() => {
    const amount = Math.max(0, Number.parseFloat(amountInput) || 0);
    const ltv = effectiveLtv / 100;

    const price = collateral?.price ?? null;
    const borrowPrice = borrow?.price ?? null;
    const threshold = collateral?.liqThreshold ?? null;

    if (price === null) return { amount, unavailable: true } as const;

    const collateralValue = amount * price;
    const debtValue = collateralValue * ltv;
    const borrowUnits = borrowPrice ? debtValue / borrowPrice : null;

    // Liquidation triggers when debt === collateralAmount * price * threshold.
    const liqPrice = threshold !== null && amount > 0 ? debtValue / (amount * threshold) : null;
    const dropToLiq = liqPrice !== null ? (1 - liqPrice / price) * 100 : null;

    const healthFactor =
      threshold === null
        ? null
        : debtValue > 0
          ? (collateralValue * threshold) / debtValue
          : Number.POSITIVE_INFINITY;

    const supplyApy = collateral?.supplyApy ?? null;
    const borrowApy = borrow?.borrowApy ?? null;
    const netAnnual =
      supplyApy !== null && borrowApy !== null
        ? collateralValue * (supplyApy / 100) - debtValue * (borrowApy / 100)
        : null;

    return {
      amount,
      unavailable: false,
      collateralValue,
      debtValue,
      borrowUnits,
      liqPrice,
      dropToLiq,
      healthFactor,
      netAnnual,
    } as const;
  }, [amountInput, effectiveLtv, collateral, borrow]);

  const hf = result.unavailable ? null : result.healthFactor;
  const band = healthBand(hf ?? Number.NaN);
  const barPct =
    hf !== null && Number.isFinite(hf)
      ? Math.max(0, Math.min(100, ((hf - 1) / 1.5) * 100))
      : hf === null
        ? 0
        : 100;

  const dropLabel =
    !result.unavailable && result.dropToLiq !== null ? `${num(result.dropToLiq, 0)}%` : NO_DATA;

  return (
    <div className="pop-lg overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* ---------------- inputs ---------------- */}
        <div className="border-b-[3px] border-ink p-6 sm:p-8 lg:border-r-[3px] lg:border-b-0">
          <div>
            <label className="label" htmlFor="calc-amount">
              I have
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {collateralList.map((a) => (
                <AssetChip
                  key={a.symbol}
                  asset={a}
                  active={a.symbol === collateral?.symbol}
                  disabled={a.price === null}
                  onSelect={() => selectCollateral(a)}
                />
              ))}
            </div>

            <div className="pop-flat mt-3.5 flex items-center overflow-hidden !shadow-none">
              <input
                id="calc-amount"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-transparent px-4 py-3.5 text-[24px] font-extrabold outline-none"
              />
              <span className="shrink-0 border-l-[2.5px] border-ink px-4 py-3.5 text-[14px] font-extrabold">
                {collateral?.symbol ?? NO_DATA}
              </span>
            </div>
            <p className="mt-2 text-[13px] font-semibold text-ink/55">
              {fmt(collateral?.price ?? null, autoUsd)} each ·{" "}
              {collateral?.supplyApy !== null && collateral?.supplyApy !== undefined ? (
                <>
                  earns <b style={{ color: "var(--pos)" }}>{pct(collateral.supplyApy)}</b> while it
                  sits
                </>
              ) : (
                <>supply rate unavailable</>
              )}
            </p>
          </div>

          <div className="mt-7">
            <span className="label">I want to borrow</span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {borrowList.map((a) => (
                <AssetChip
                  key={a.symbol}
                  asset={a}
                  active={a.symbol === borrow?.symbol}
                  disabled={a.price === null}
                  onSelect={() => setBorrowSymbol(a.symbol)}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <label className="label" htmlFor="calc-ltv">
                How much of it?
              </label>
              <span className="pill" style={{ background: "var(--lemon)" }}>
                {effectiveLtv}% LTV
              </span>
            </div>
            <input
              id="calc-ltv"
              type="range"
              min={5}
              max={maxLtvPct}
              step={1}
              value={effectiveLtv}
              onChange={(e) => setLtvPct(Number(e.target.value))}
              className="mt-4"
            />
            <div className="mt-2 flex justify-between text-[12.5px] font-semibold text-ink/50">
              <span>Careful</span>
              <span
                title={
                  ltvIsLive
                    ? "Live from Kamino's main market"
                    : "No live reserve — using a conservative default"
                }
              >
                Max {maxLtvPct}%{ltvIsLive ? " (live)" : " (default)"}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- outputs ---------------- */}
        <div className="p-6 sm:p-8" style={{ background: "var(--mist)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="label">You could borrow</div>
            <LiveBadge />
          </div>

          <div className="mt-2 text-[38px] leading-none font-black tracking-[-0.04em] sm:text-[46px]">
            {result.unavailable || result.borrowUnits === null ? (
              <span className="text-ink/30">{NO_DATA}</span>
            ) : (
              num(result.borrowUnits, result.borrowUnits >= 1000 ? 0 : 2)
            )}{" "}
            <span className="text-[22px] font-extrabold text-ink/50 sm:text-[26px]">
              {borrow?.symbol}
            </span>
          </div>
          <div className="mt-1.5 text-[14px] font-bold text-ink/55">
            {result.unavailable ? NO_DATA : usd(result.debtValue)}
          </div>

          <div className="mt-5">
            <Row
              label="Collateral value"
              value={result.unavailable ? NO_DATA : usd(result.collateralValue)}
            />
            <Row
              label="Liquidated at"
              value={result.unavailable ? NO_DATA : fmt(result.liqPrice, autoUsd)}
              hint={dropLabel === NO_DATA ? undefined : `−${dropLabel}`}
              color="var(--neg)"
            />
            <Row label="Borrow rate" value={fmt(borrow?.borrowApy ?? null, (v) => pct(v))} hint="Kamino" />
            <Row
              label="Net per year"
              value={
                result.unavailable || result.netAnnual === null
                  ? NO_DATA
                  : `${result.netAnnual >= 0 ? "+" : "−"}${usd(Math.abs(result.netAnnual))}`
              }
              hint="yield − interest"
              color={
                !result.unavailable && result.netAnnual !== null && result.netAnnual >= 0
                  ? "var(--pos)"
                  : "var(--neg)"
              }
            />
          </div>

          {/* health factor */}
          <div
            className="pop-flat mt-5 p-4 !shadow-none"
            style={{ background: hf === null ? "var(--paper)" : BAND_TINT[band.label] }}
          >
            <div className="flex items-baseline justify-between">
              <span className="label">Health factor</span>
              <span className="text-[19px] font-extrabold">
                {hf === null ? NO_DATA : Number.isFinite(hf) ? num(hf, 2) : "∞"}
                {hf !== null && (
                  <span className="ml-2 text-[13px] font-bold text-ink/60">{band.label}</span>
                )}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border-[2.5px] border-ink bg-white">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${barPct}%`, background: "var(--ink)" }}
              />
            </div>
            <p className="mt-2.5 text-[12.5px] leading-snug font-semibold text-ink/70">
              {hf === null
                ? "Live risk parameters for this asset are unavailable right now."
                : band.note(dropLabel, collateral?.symbol ?? "collateral")}
            </p>
          </div>

          {borrow && collateral && (
            <a
              href={jupiterSwapUrl(collateral.mint, borrow.mint)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 w-full !text-[14px]"
            >
              Open this pair on Jupiter ↗
            </a>
          )}

          <p className="mt-4 text-[11.5px] leading-relaxed font-medium text-ink/50">
            Prices from Jupiter, rates and max LTV from Kamino. Liquidation thresholds are protocol
            parameters set 5pp above max LTV. Excludes gas, liquidation penalties and rate drift —
            a sizing tool, not a risk system.
          </p>
        </div>
      </div>
    </div>
  );
}
