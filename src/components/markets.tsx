"use client";

import { Fragment, useState } from "react";
import type { MarketAsset } from "@/lib/market";
import { jupiterSwapUrl } from "@/lib/tokens";
import { autoUsd, compactNum, compactUsd, fmt, NO_DATA, pct, signedPct } from "@/lib/format";
import { LiveBadge, useMarket } from "./market-context";

type Tab = "collateral" | "borrow";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function AssetCell({ asset }: { asset: MarketAsset }) {
  return (
    <a
      href={`https://jup.ag/tokens/${asset.mint}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3"
      title={`${asset.name} · ${asset.mint}`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink text-[11px] font-extrabold"
        style={{ background: asset.tint }}
        aria-hidden="true"
      >
        {asset.symbol.replace(/x$/, "").slice(0, 4)}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-extrabold tracking-[-0.02em]">{asset.symbol}</span>
        <span className="block truncate text-[12.5px] font-semibold text-ink/50">
          {asset.name}
        </span>
      </span>
    </a>
  );
}

const TH = "label px-5 py-3.5 text-right whitespace-nowrap";
const TD = "px-5 py-4 text-right text-[14.5px] font-bold whitespace-nowrap";

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink/30">{NO_DATA}</span>;
  return (
    <span style={{ color: value >= 0 ? "var(--pos)" : "var(--neg)" }}>
      {value >= 0 ? "↑" : "↓"} {signedPct(value)}
    </span>
  );
}

export function Markets() {
  const { snapshot } = useMarket();
  const [tab, setTab] = useState<Tab>("collateral");

  const tabs: { id: Tab; label: string }[] = [
    { id: "collateral", label: "Crypto collateral" },
    { id: "borrow", label: "Tokenized stocks" },
  ];

  const rows = tab === "collateral" ? snapshot.collateral : snapshot.equities;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2.5" role="tablist" aria-label="Market type">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className="rounded-full border-[2.5px] border-ink px-5 py-2.5 text-[14.5px] font-extrabold transition-all"
              style={{
                background: tab === t.id ? "var(--lemon)" : "var(--paper)",
                boxShadow: tab === t.id ? "4px 4px 0 var(--ink)" : "none",
                transform: tab === t.id ? "translate(-1px, -1px)" : undefined,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <LiveBadge />
      </div>

      <div className="pop-lg mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b-[3px] border-ink" style={{ background: "var(--mist)" }}>
              <th className="label px-5 py-3.5 text-left">Market</th>
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
            {rows.map((a, i) => (
              <Fragment key={a.symbol}>
                {/* A header row each time the sector changes. */}
                {a.group && a.group !== rows[i - 1]?.group && (
                  <tr>
                    <td
                      colSpan={7}
                      className="label border-y-2 border-ink/15 px-5 py-2"
                      style={{ background: "var(--mist)" }}
                    >
                      {a.group}
                    </td>
                  </tr>
                )}
                <tr className="border-b-2 border-ink/10 transition-colors last:border-b-0 hover:bg-mist/40">
                <td className="px-5 py-4">
                  <AssetCell asset={a} />
                </td>
                <td className={TD}>{fmt(a.price, autoUsd)}</td>
                <td className={TD}>
                  <Change value={a.change24h} />
                </td>
                <td className={`${TD} text-ink/60`}>{fmt(a.liquidityUsd, compactUsd)}</td>

                {tab === "collateral" ? (
                  <>
                    <td className={TD} style={{ color: "var(--pos)" }}>
                      {fmt(a.supplyApy, (v) => pct(v, 2))}
                    </td>
                    <td className={TD}>{fmt(a.borrowApy, (v) => pct(v, 2))}</td>
                    <td className={TD}>
                      <span className="pill" style={{ background: a.tint }}>
                        {fmt(a.maxLtv, (v) => pct(v * 100, 0))}
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={`${TD} text-ink/60`}>{fmt(a.volume24h, compactUsd)}</td>
                    <td className={`${TD} text-ink/60`}>{fmt(a.holders, compactNum)}</td>
                    <td className={TD}>
                      <a
                        href={jupiterSwapUrl(USDC_MINT, a.mint)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn !px-3.5 !py-1.5 !text-[12.5px] !shadow-[2px_2px_0_var(--ink)]"
                      >
                        Buy ↗
                      </a>
                    </td>
                  </>
                )}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-[13px] leading-relaxed font-medium text-ink/60">
        {tab === "collateral"
          ? "Prices and liquidity from Jupiter. Supply/borrow APY and max LTV are live reserve parameters from Kamino's main lending market on Solana."
          : "Live figures from Jupiter for the Backed Finance xStocks trading on Solana today. Symbols link to the token page; Buy opens a real Jupiter swap route."}
      </p>

      {snapshot.errors.length > 0 && (
        <p className="mt-2 text-[13px] font-bold" style={{ color: "var(--neg)" }}>
          {snapshot.errors.join(" · ")}
        </p>
      )}
    </div>
  );
}
