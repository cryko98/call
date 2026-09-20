"use client";

import { useState } from "react";
import type { MarketAsset } from "@/lib/market";
import { jupiterSwapUrl } from "@/lib/tokens";
import { autoUsd, compactNum, compactUsd, fmt, NO_DATA, pct, signedPct } from "@/lib/format";
import { LiveBadge, useMarket } from "./market-context";

type Tab = "collateral" | "borrow";

function AssetCell({ asset }: { asset: MarketAsset }) {
  return (
    <a
      href={`https://jup.ag/tokens/${asset.mint}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 transition-opacity hover:opacity-80"
      title={`${asset.name} · ${asset.mint}`}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center border text-[9px] font-bold"
        style={{ borderColor: asset.tint, color: asset.tint }}
        aria-hidden="true"
      >
        {asset.symbol.slice(0, 4).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{asset.symbol}</span>
        <span className="block truncate text-[10.5px] text-dim">{asset.name}</span>
      </span>
    </a>
  );
}

const TH = "label px-5 py-3 text-right font-normal whitespace-nowrap";
const TD = "px-5 py-3.5 text-right text-[12.5px] whitespace-nowrap";

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-dim">{NO_DATA}</span>;
  return (
    <span style={{ color: value >= 0 ? "var(--pos)" : "var(--neg)" }}>{signedPct(value)}</span>
  );
}

export function Markets() {
  const { snapshot } = useMarket();
  const [tab, setTab] = useState<Tab>("collateral");

  const tabs: { id: Tab; label: string }[] = [
    { id: "collateral", label: "Crypto collateral" },
    { id: "borrow", label: "Tokenized equities" },
  ];

  const rows = tab === "collateral" ? snapshot.collateral : snapshot.equities;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex border border-line bg-panel p-1"
          role="tablist"
          aria-label="Market type"
        >
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
        <LiveBadge />
      </div>

      <div className="panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-panel-2">
              <th className="label px-5 py-3 text-left font-normal">Market</th>
              <th className={TH}>Price</th>
              <th className={TH}>24h</th>
              <th className={TH}>Liquidity</th>
              {tab === "collateral" ? (
                <>
                  <th className={TH}>Supply APY</th>
                  <th className={TH}>Borrow APY</th>
                  <th className={TH}>Max LTV</th>
                </>
              ) : (
                <>
                  <th className={TH}>24h volume</th>
                  <th className={TH}>Holders</th>
                  <th className={TH}>Trade</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.symbol} className="panel-hover border-b border-line-soft last:border-b-0">
                <td className="px-5 py-3.5">
                  <AssetCell asset={a} />
                </td>
                <td className={TD}>{fmt(a.price, autoUsd)}</td>
                <td className={TD}>
                  <Change value={a.change24h} />
                </td>
                <td className={`${TD} text-muted`}>{fmt(a.liquidityUsd, compactUsd)}</td>

                {tab === "collateral" ? (
                  <>
                    <td className={TD} style={{ color: "var(--pos)" }}>
                      {fmt(a.supplyApy, (v) => pct(v, 2))}
                    </td>
                    <td className={TD} style={{ color: "var(--amber)" }}>
                      {fmt(a.borrowApy, (v) => pct(v, 2))}
                    </td>
                    <td className={`${TD} text-muted`}>
                      {fmt(a.maxLtv, (v) => pct(v * 100, 0))}
                    </td>
                  </>
                ) : (
                  <>
                    <td className={`${TD} text-muted`}>{fmt(a.volume24h, compactUsd)}</td>
                    <td className={`${TD} text-muted`}>{fmt(a.holders, compactNum)}</td>
                    <td className={TD}>
                      <a
                        href={jupiterSwapUrl(
                          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                          a.mint,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-line px-2.5 py-1 text-[10px] tracking-[0.08em] transition-colors hover:border-amber hover:text-amber"
                      >
                        JUPITER ↗
                      </a>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-dim">
        {tab === "collateral"
          ? "Prices and liquidity from Jupiter. Supply/borrow APY and max LTV are live reserve parameters from Kamino's main lending market on Solana."
          : "Live figures from Jupiter for the Backed Finance xStocks trading on Solana today. Symbols link to the token page; the trade button opens a real Jupiter swap route."}
      </p>

      {snapshot.errors.length > 0 && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--amber)" }}>
          {snapshot.errors.join(" · ")}
        </p>
      )}
    </div>
  );
}
