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
      className="flex items-center gap-2 border px-3 py-2 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        borderColor: active ? "var(--amber)" : "var(--line)",
        background: active ? "rgba(255, 176, 0, 0.09)" : "var(--bg)",
        color: active ? "var(--text)" : "var(--muted)",
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0" style={{ background: asset.tint }} aria-hidden="true" />
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
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className="text-right">
        <span
          className="text-[14px] font-semibold"
          style={missing ? { color: "var(--dim)" } : color ? { color } : undefined}
        >
          {value}
        </span>
        {hint && !missing ? <span className="ml-2 text-[11px] text-dim">{hint}</span> : null}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

/** Used only when Kamino has no reserve for the selected collateral. */
const FALLBACK_MAX_LTV = 0.5;

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

    if (price === null) {
      return { amount, unavailable: true } as const;
    }

    const collateralValue = amount * price;
    const debtValue = collateralValue * ltv;
    const borrowUnits = borrowPrice ? debtValue / borrowPrice : null;

    // Liquidation triggers when debt === collateralAmount * price * threshold.
    const liqPrice =
      threshold !== null && amount > 0 ? debtValue / (amount * threshold) : null;
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

  const dropLabel = !result.unavailable && result.dropToLiq !== null
    ? `${num(result.dropToLiq, 0)}%`
    : NO_DATA;

  return (
    <div className="panel">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* ---------------- inputs ---------------- */}
        <div className="border-b border-line p-6 sm:p-7 lg:border-b-0 lg:border-r">
          <div>
            <label className="label" htmlFor="calc-amount">
              Collateral asset
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
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

            <div className="mt-3.5 flex items-center border border-line bg-bg focus-within:border-muted">
              <input
                id="calc-amount"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-[19px] font-semibold outline-none"
              />
              <span className="shrink-0 border-l border-line px-4 py-3 text-[12px] tracking-[0.06em] text-muted">
                {collateral?.symbol ?? NO_DATA}
              </span>
            </div>
            <p className="mt-2 text-[11.5px] text-dim">
              {fmt(collateral?.price ?? null, autoUsd)} per {collateral?.symbol} ·{" "}
              {collateral?.supplyApy !== null && collateral?.supplyApy !== undefined ? (
                <>
                  earning <span style={{ color: "var(--pos)" }}>{pct(collateral.supplyApy)}</span>{" "}
                  supply APY
                </>
              ) : (
                <>supply rate unavailable</>
              )}
            </p>
          </div>

          <div className="mt-7">
            <span className="label">Borrow asset</span>
            <div className="mt-3 flex flex-wrap gap-2">
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
                Loan-to-value
              </label>
              <span className="text-[16px] font-semibold" style={{ color: "var(--amber)" }}>
                {effectiveLtv}%
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
              className="mt-3.5"
            />
            <div className="mt-2 flex justify-between text-[10.5px] text-dim">
              <span>5%</span>
              <span title={ltvIsLive ? "Live from Kamino's main market" : "No live reserve — using a conservative default"}>
                Max {maxLtvPct}% for {collateral?.symbol}
                {ltvIsLive ? " · live" : " · default"}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- outputs ---------------- */}
        <div className="bg-panel-2 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="label">You can borrow</div>
            <LiveBadge />
          </div>

          <div className="mt-2 text-[32px] leading-none font-bold tracking-tight sm:text-[38px]">
            {result.unavailable || result.borrowUnits === null ? (
              <span className="text-dim">{NO_DATA}</span>
            ) : (
              <span style={{ color: "var(--pos)", textShadow: "0 0 30px rgba(0,230,118,0.22)" }}>
                {num(result.borrowUnits, result.borrowUnits >= 1000 ? 0 : 2)}
              </span>
            )}{" "}
            <span className="text-[19px] text-muted sm:text-[21px]">{borrow?.symbol}</span>
          </div>
          <div className="mt-2 text-[12.5px] text-muted">
            {result.unavailable ? NO_DATA : usd(result.debtValue)}
          </div>

          <div className="mt-6">
            <Row
              label="Collateral value"
              value={result.unavailable ? NO_DATA : usd(result.collateralValue)}
            />
            <Row
              label="Liquidation price"
              value={result.unavailable ? NO_DATA : fmt(result.liqPrice, autoUsd)}
              hint={dropLabel === NO_DATA ? undefined : `−${dropLabel}`}
              color="var(--neg)"
            />
            <Row
              label="Borrow APY"
              value={fmt(borrow?.borrowApy ?? null, (v) => pct(v))}
              hint="Kamino"
              color="var(--amber)"
            />
            <Row
              label="Net annual carry"
              value={
                result.unavailable || result.netAnnual === null
                  ? NO_DATA
                  : `${result.netAnnual >= 0 ? "+" : "−"}${usd(Math.abs(result.netAnnual))}`
              }
              hint="supply yield − interest"
              color={
                !result.unavailable && result.netAnnual !== null && result.netAnnual >= 0
                  ? "var(--pos)"
                  : "var(--neg)"
              }
            />
          </div>

          {/* health factor */}
          <div className="mt-6 border border-line bg-bg p-4">
            <div className="flex items-baseline justify-between">
              <span className="label">Health factor</span>
              <span
                className="text-[15px] font-semibold"
                style={{ color: hf === null ? "var(--dim)" : band.color }}
              >
                {hf === null ? NO_DATA : Number.isFinite(hf) ? num(hf, 2) : "∞"}
                {hf !== null && <span className="ml-2 text-[11.5px] font-normal">{band.label}</span>}
              </span>
            </div>
            <div className="mt-3 h-[5px] bg-line">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${barPct}%`, background: hf === null ? "var(--dim)" : band.color }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
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
              className="mt-4 block border border-line bg-bg px-4 py-3 text-center text-[11.5px] font-semibold tracking-[0.1em] transition-colors hover:border-amber hover:text-amber"
            >
              SWAP {collateral.symbol} → {borrow.symbol} ON JUPITER ↗
            </a>
          )}

          <p className="mt-4 text-[10.5px] leading-relaxed text-dim">
            Prices from Jupiter, rates and max LTV from Kamino&apos;s main market. Liquidation
            thresholds are protocol parameters set 5pp above max LTV. Excludes gas, liquidation
            penalties and rate drift — this is a sizing tool, not a risk system.
          </p>
        </div>
      </div>
    </div>
  );
}
