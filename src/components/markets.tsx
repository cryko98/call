"use client";

import { useState } from "react";
import { COLLATERAL, EQUITIES } from "@/lib/data";
import { autoUsd, pct, signedPct } from "@/lib/format";

type Tab = "collateral" | "borrow";

function AssetCell({ symbol, name, tint }: { symbol: string; name: string; tint: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center border text-[9px] font-bold"
        style={{ borderColor: tint, color: tint }}
        aria-hidden="true"
      >
        {symbol.slice(0, 4).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{symbol}</span>
        <span className="block truncate text-[10.5px] text-dim">{name}</span>
      </span>
    </div>
  );
}

const TH = "label px-5 py-3 text-right font-normal whitespace-nowrap";
const TD = "px-5 py-3.5 text-right text-[12.5px] whitespace-nowrap";

export function Markets() {
  const [tab, setTab] = useState<Tab>("collateral");

  const tabs: { id: Tab; label: string }[] = [
    { id: "collateral", label: "Crypto collateral" },
    { id: "borrow", label: "Borrow markets" },
  ];

  return (
    <div>
      <div className="inline-flex border border-line bg-panel p-1" role="tablist" aria-label="Market type">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-[11.5px] font-medium tracking-[0.06em] transition-colors"
            style={{
              background: tab === t.id ? "var(--amber)" : "transparent",
              color: tab === t.id ? "var(--bg)" : "var(--muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-panel-2">
              <th className="label px-5 py-3 text-left font-normal">Market</th>
              <th className={TH}>Price</th>
              <th className={TH}>24h</th>
              {tab === "collateral" ? (
                <>
                  <th className={TH}>Supply APY</th>
                  <th className={TH}>Max LTV</th>
                  <th className={TH}>Liq. threshold</th>
                </>
              ) : (
                <>
                  <th className={TH}>Borrow APR</th>
                  <th className={TH}>Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === "collateral"
              ? COLLATERAL.map((a) => (
                  <tr key={a.symbol} className="panel-hover border-b border-line-soft last:border-b-0">
                    <td className="px-5 py-3.5">
                      <AssetCell symbol={a.symbol} name={a.name} tint={a.tint} />
                    </td>
                    <td className={TD}>{autoUsd(a.price)}</td>
                    <td className={TD} style={{ color: a.change >= 0 ? "var(--pos)" : "var(--neg)" }}>
                      {signedPct(a.change)}
                    </td>
                    <td className={TD} style={{ color: "var(--pos)" }}>
                      {pct(a.supplyApy)}
                    </td>
                    <td className={`${TD} text-muted`}>{pct(a.maxLtv * 100, 0)}</td>
                    <td className={`${TD} text-muted`}>{pct(a.liqThreshold * 100, 0)}</td>
                  </tr>
                ))
              : EQUITIES.map((a) => (
                  <tr key={a.symbol} className="panel-hover border-b border-line-soft last:border-b-0">
                    <td className="px-5 py-3.5">
                      <AssetCell symbol={a.symbol} name={a.name} tint={a.tint} />
                    </td>
                    <td className={TD}>{autoUsd(a.price)}</td>
                    <td className={TD} style={{ color: a.change >= 0 ? "var(--pos)" : "var(--neg)" }}>
                      {signedPct(a.change)}
                    </td>
                    <td className={TD} style={{ color: "var(--amber)" }}>
                      {pct(a.borrowApr)}
                    </td>
                    <td className={TD}>
                      <span
                        className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] tracking-[0.08em]"
                        style={{ borderColor: "var(--line)", color: "var(--dim)" }}
                      >
                        <span className="h-1.5 w-1.5" style={{ background: "var(--dim)" }} aria-hidden="true" />
                        PRE-LAUNCH
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
