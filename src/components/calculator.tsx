"use client";

import { useMemo, useState } from "react";
import {
  COLLATERAL,
  EQUITIES,
  healthBand,
  type CollateralAsset,
  type EquityAsset,
} from "@/lib/data";
import { autoUsd, num, pct, usd } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Asset chip                                                          */
/* ------------------------------------------------------------------ */

function AssetChip({
  asset,
  active,
  onSelect,
}: {
  asset: CollateralAsset | EquityAsset;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="flex items-center gap-2 border px-3 py-2 text-[11.5px] font-medium transition-colors"
      style={{
        borderColor: active ? "var(--amber)" : "var(--line)",
        background: active ? "rgba(255, 176, 0, 0.09)" : "var(--bg)",
        color: active ? "var(--text)" : "var(--muted)",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0"
        style={{ background: asset.tint }}
        aria-hidden="true"
      />
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
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className="text-right">
        <span className="text-[14px] font-semibold" style={color ? { color } : undefined}>
          {value}
        </span>
        {hint ? <span className="ml-2 text-[11px] text-dim">{hint}</span> : null}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

export function BorrowCalculator() {
  const [collateralIdx, setCollateralIdx] = useState(0);
  const [borrowIdx, setBorrowIdx] = useState(0);
  const [amountInput, setAmountInput] = useState(String(COLLATERAL[0].defaultAmount));
  const [ltvPct, setLtvPct] = useState(50);

  const collateral = COLLATERAL[collateralIdx];
  const borrow = EQUITIES[borrowIdx];
  const maxLtvPct = Math.round(collateral.maxLtv * 100);

  function selectCollateral(i: number) {
    const next = COLLATERAL[i];
    setCollateralIdx(i);
    setAmountInput(String(next.defaultAmount));
    setLtvPct((v) => Math.min(v, Math.round(next.maxLtv * 100)));
  }

  const result = useMemo(() => {
    const amount = Math.max(0, Number.parseFloat(amountInput) || 0);
    const ltv = ltvPct / 100;

    const collateralValue = amount * collateral.price;
    const debtValue = collateralValue * ltv;
    const borrowUnits = borrow.price > 0 ? debtValue / borrow.price : 0;

    // Liquidation triggers when debt === collateralAmount * price * liqThreshold.
    const liqPrice = amount > 0 ? debtValue / (amount * collateral.liqThreshold) : 0;
    const dropToLiq = collateral.price > 0 ? (1 - liqPrice / collateral.price) * 100 : 0;

    const healthFactor =
      debtValue > 0
        ? (collateralValue * collateral.liqThreshold) / debtValue
        : Number.POSITIVE_INFINITY;

    const supplyIncome = collateralValue * (collateral.supplyApy / 100);
    const borrowCost = debtValue * (borrow.borrowApr / 100);

    return {
      amount,
      collateralValue,
      debtValue,
      borrowUnits,
      liqPrice,
      dropToLiq,
      healthFactor,
      netAnnual: supplyIncome - borrowCost,
    };
  }, [amountInput, ltvPct, collateral, borrow]);

  const band = healthBand(result.healthFactor);

  // Map HF onto a 0–100 bar: 1.0 → empty, 2.5+ → full.
  const barPct = Number.isFinite(result.healthFactor)
    ? Math.max(0, Math.min(100, ((result.healthFactor - 1) / 1.5) * 100))
    : 100;

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
              {COLLATERAL.map((a, i) => (
                <AssetChip
                  key={a.symbol}
                  asset={a}
                  active={i === collateralIdx}
                  onSelect={() => selectCollateral(i)}
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
                {collateral.symbol}
              </span>
            </div>
            <p className="mt-2 text-[11.5px] text-dim">
              {autoUsd(collateral.price)} per {collateral.symbol} · earning{" "}
              <span style={{ color: "var(--pos)" }}>{pct(collateral.supplyApy)}</span> supply APY
            </p>
          </div>

          <div className="mt-7">
            <span className="label">Borrow asset</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {EQUITIES.map((a, i) => (
                <AssetChip
                  key={a.symbol}
                  asset={a}
                  active={i === borrowIdx}
                  onSelect={() => setBorrowIdx(i)}
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
                {ltvPct}%
              </span>
            </div>
            <input
              id="calc-ltv"
              type="range"
              min={5}
              max={maxLtvPct}
              step={1}
              value={ltvPct}
              onChange={(e) => setLtvPct(Number(e.target.value))}
              className="mt-3.5"
            />
            <div className="mt-2 flex justify-between text-[10.5px] text-dim">
              <span>5%</span>
              <span>
                Max {maxLtvPct}% for {collateral.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- outputs ---------------- */}
        <div className="bg-panel-2 p-6 sm:p-7">
          <div className="label">You can borrow</div>
          <div className="mt-2 text-[32px] leading-none font-bold tracking-tight sm:text-[38px]">
            <span style={{ color: "var(--pos)", textShadow: "0 0 30px rgba(0,230,118,0.22)" }}>
              {num(result.borrowUnits, result.borrowUnits >= 1000 ? 0 : 2)}
            </span>{" "}
            <span className="text-[19px] text-muted sm:text-[21px]">{borrow.symbol}</span>
          </div>
          <div className="mt-2 text-[12.5px] text-muted">{usd(result.debtValue)}</div>

          <div className="mt-6">
            <Row label="Collateral value" value={usd(result.collateralValue)} />
            <Row
              label="Liquidation price"
              value={autoUsd(result.liqPrice)}
              hint={result.amount > 0 ? `−${num(result.dropToLiq, 0)}%` : undefined}
              color="var(--neg)"
            />
            <Row label="Borrow APR" value={pct(borrow.borrowApr)} color="var(--amber)" />
            <Row
              label="Net annual carry"
              value={`${result.netAnnual >= 0 ? "+" : "−"}${usd(Math.abs(result.netAnnual))}`}
              hint="supply yield − interest"
              color={result.netAnnual >= 0 ? "var(--pos)" : "var(--neg)"}
            />
          </div>

          {/* health factor */}
          <div className="mt-6 border border-line bg-bg p-4">
            <div className="flex items-baseline justify-between">
              <span className="label">Health factor</span>
              <span className="text-[15px] font-semibold" style={{ color: band.color }}>
                {Number.isFinite(result.healthFactor) ? num(result.healthFactor, 2) : "∞"}
                <span className="ml-2 text-[11.5px] font-normal">{band.label}</span>
              </span>
            </div>
            <div className="mt-3 h-[5px] bg-line">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${barPct}%`, background: band.color }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              {band.note(`${num(result.dropToLiq, 0)}%`, collateral.symbol)}
            </p>
          </div>

          <p className="mt-4 text-[10.5px] leading-relaxed text-dim">
            Illustrative only. Figures use the simulated prices above, exclude gas and liquidation
            penalties, and assume rates hold constant — real rates move with pool utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
