"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import type { MarketAsset } from "@/lib/market";
import { num, usd } from "@/lib/format";
import { useMarket } from "./market-context";
import { USING_PUBLIC_RPC } from "./wallet-provider";

/* ------------------------------------------------------------------ */
/* Units                                                               */
/* ------------------------------------------------------------------ */

/** Decimal string → integer base units, without ever touching a float. */
function toBaseUnits(amount: string, decimals: number): bigint | null {
  if (!/^\d*\.?\d*$/.test(amount)) return null;
  const [whole = "", frac = ""] = amount.split(".");
  if (whole === "" && frac === "") return null;
  const truncated = frac.slice(0, decimals).padEnd(decimals, "0");
  try {
    return BigInt((whole || "0") + truncated);
  } catch {
    return null;
  }
}

function fromBaseUnits(raw: string | number, decimals: number): number {
  return Number(raw) / 10 ** decimals;
}

/** base64 → bytes without depending on a Buffer polyfill. */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";
/** Left unswapped so the wallet can still pay fees and rent. */
const SOL_FEE_BUFFER = 0.02;

/**
 * Reads a wallet balance without touching component state, so the caller's
 * effect stays free of synchronous setState.
 */
async function readBalance(
  connection: Connection,
  owner: PublicKey | null,
  mint: string | null,
): Promise<number | null> {
  if (!owner || !mint) return null;
  try {
    if (mint === SOL_MINT) {
      return (await connection.getBalance(owner)) / 1e9;
    }
    const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
      mint: new PublicKey(mint),
    });
    return accounts.value.reduce((sum, { account }) => {
      const parsed = account.data.parsed as {
        info?: { tokenAmount?: { uiAmount?: number | null } };
      };
      return sum + (parsed.info?.tokenAmount?.uiAmount ?? 0);
    }, 0);
  } catch {
    // Usually a rate-limited RPC; the swap itself can still go through.
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Quote = {
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan?: { swapInfo?: { label?: string } }[];
  [key: string]: unknown;
};

type Status =
  | { kind: "idle" }
  | { kind: "building" }
  | { kind: "signing" }
  | { kind: "sending"; signature?: string }
  | { kind: "done"; signature: string }
  | { kind: "error"; message: string };

/* ------------------------------------------------------------------ */
/* Token select                                                        */
/* ------------------------------------------------------------------ */

function TokenSelect({
  label,
  assets,
  value,
  exclude,
  onChange,
}: {
  label: string;
  assets: MarketAsset[];
  value: string;
  exclude: string;
  onChange: (mint: string) => void;
}) {
  const selected = assets.find((a) => a.mint === value);

  return (
    <label className="block">
      <span className="label">{label}</span>
      <div
        className="pop-flat mt-2 flex items-center gap-2.5 overflow-hidden pl-3 !shadow-none"
        style={{ background: selected?.tint ?? "var(--paper)" }}
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white text-[10.5px] font-extrabold"
          aria-hidden="true"
        >
          {selected?.symbol.replace(/x$/, "").slice(0, 4) ?? "—"}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent py-3 pr-3 text-[15px] font-extrabold outline-none"
        >
          {assets
            .filter((a) => a.mint !== exclude && a.decimals !== null)
            .map((a) => (
              <option key={a.mint} value={a.mint}>
                {a.symbol} — {a.name}
              </option>
            ))}
        </select>
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Swap panel                                                          */
/* ------------------------------------------------------------------ */

export function SwapPanel() {
  const { snapshot } = useMarket();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const assets = useMemo(() => [...snapshot.collateral, ...snapshot.equities], [snapshot]);

  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(
    () =>
      snapshot.equities.find((e) => e.symbol === "NVDAx")?.mint ??
      snapshot.equities[0]?.mint ??
      "",
  );
  const [amount, setAmount] = useState("0.1");
  const [slippageBps, setSlippageBps] = useState(50);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [balance, setBalance] = useState<number | null>(null);

  const input = assets.find((a) => a.mint === inputMint);
  const output = assets.find((a) => a.mint === outputMint);

  const baseAmount = input?.decimals != null ? toBaseUnits(amount, input.decimals) : null;

  /* ---------------- balance ---------------- */

  // Bumped after a swap settles, and on the re-quote tick, to force a refetch.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await readBalance(connection, publicKey, input?.mint ?? null);
      if (!cancelled) setBalance(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, input?.mint, refreshKey]);

  /* ---------------- quote ---------------- */

  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    // Everything — including clearing a stale quote — happens inside the timer
    // so the effect body itself never sets state.
    const timer = setTimeout(async () => {
      if (!input || !output || baseAmount === null || baseAmount <= 0n) {
        if (id === requestId.current) {
          setQuote(null);
          setQuoteError(null);
          setQuoting(false);
        }
        return;
      }

      setQuoting(true);
      setQuoteError(null);
      try {
        const res = await fetch(
          `/api/swap?inputMint=${inputMint}&outputMint=${outputMint}` +
            `&amount=${baseAmount.toString()}&slippageBps=${slippageBps}`,
          { cache: "no-store" },
        );
        const body = await res.json();
        if (id !== requestId.current) return;
        if (!res.ok) throw new Error(body?.error ?? "Quote failed");
        setQuote(body as Quote);
      } catch (err) {
        if (id !== requestId.current) return;
        setQuote(null);
        setQuoteError(err instanceof Error ? err.message : "Quote failed");
      } finally {
        if (id === requestId.current) setQuoting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputMint, outputMint, baseAmount, slippageBps, input, output, refreshKey]);

  // Re-quote periodically so a stale price is never what gets signed.
  useEffect(() => {
    const id = setInterval(() => setRefreshKey((k) => k + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  /* ---------------- swap ---------------- */

  async function executeSwap() {
    if (!publicKey || !quote || !input || !output) return;

    try {
      setStatus({ kind: "building" });
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteResponse: quote, userPublicKey: publicKey.toBase58() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Could not build the transaction");

      const { swapTransaction, lastValidBlockHeight } = body as {
        swapTransaction: string;
        lastValidBlockHeight: number;
      };

      const transaction = VersionedTransaction.deserialize(base64ToBytes(swapTransaction));

      setStatus({ kind: "signing" });
      const signature = await sendTransaction(transaction, connection, { maxRetries: 3 });

      setStatus({ kind: "sending", signature });
      const result = await connection.confirmTransaction(
        { signature, blockhash: transaction.message.recentBlockhash, lastValidBlockHeight },
        "confirmed",
      );
      if (result.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(result.value.err)}`);
      }

      setStatus({ kind: "done", signature });
      setQuote(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Swap failed";
      setStatus({
        kind: "error",
        message: /user rejected|reject/i.test(message)
          ? "You rejected the request in your wallet."
          : message,
      });
    }
  }

  /* ---------------- derived ---------------- */

  const outUi =
    quote && output?.decimals != null ? fromBaseUnits(quote.outAmount, output.decimals) : null;
  const minOutUi =
    quote && output?.decimals != null
      ? fromBaseUnits(quote.otherAmountThreshold, output.decimals)
      : null;
  const impact = quote ? Number(quote.priceImpactPct) * 100 : null;
  const route =
    quote?.routePlan?.map((p) => p.swapInfo?.label).filter(Boolean).join(" → ") ?? null;

  const inUsd =
    input?.price != null && baseAmount !== null && input.decimals != null
      ? fromBaseUnits(baseAmount.toString(), input.decimals) * input.price
      : null;
  const outUsd = output?.price != null && outUi != null ? outUi * output.price : null;

  const busy =
    status.kind === "building" || status.kind === "signing" || status.kind === "sending";
  const overBalance =
    balance !== null && input?.decimals != null && baseAmount !== null
      ? fromBaseUnits(baseAmount.toString(), input.decimals) > balance
      : false;

  function setMax() {
    if (balance === null) return;
    const usable = input?.mint === SOL_MINT ? Math.max(0, balance - SOL_FEE_BUFFER) : balance;
    setAmount(usable.toFixed(Math.min(input?.decimals ?? 6, 9)));
  }

  return (
    <div className="pop-lg scroll-mt-28 overflow-hidden" id="swap">
      {/* header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-5"
        style={{ background: "var(--lemon)" }}
      >
        <div>
          <span className="pill" style={{ background: "var(--paper)" }}>
            Real transaction
          </span>
          <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em]">Swap on Jupiter</h3>
        </div>
        <WalletMultiButton
          style={{
            background: connected ? "var(--paper)" : "var(--orange)",
            color: "var(--ink)",
            border: "2.5px solid var(--ink)",
            borderRadius: 999,
            boxShadow: "4px 4px 0 var(--ink)",
            fontFamily: "var(--font-outfit)",
            fontWeight: 800,
            fontSize: 14.5,
            height: 46,
            padding: "0 22px",
          }}
        />
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TokenSelect
            label="You pay"
            assets={assets}
            value={inputMint}
            exclude={outputMint}
            onChange={setInputMint}
          />
          <TokenSelect
            label="You get"
            assets={assets}
            value={outputMint}
            exclude={inputMint}
            onChange={setOutputMint}
          />
        </div>

        {/* amount */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="label">Amount</span>
            <span className="text-[12.5px] font-semibold text-ink/55">
              {balance === null ? (
                connected ? (
                  "balance unavailable"
                ) : (
                  "connect to see balance"
                )
              ) : (
                <>
                  Balance: {num(balance, 4)} {input?.symbol}
                  <button
                    type="button"
                    onClick={setMax}
                    className="ml-2 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-extrabold"
                    style={{ background: "var(--lemon)" }}
                  >
                    MAX
                  </button>
                </>
              )}
            </span>
          </div>
          <div className="pop-flat mt-2 flex items-center overflow-hidden !shadow-none">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-full bg-transparent px-4 py-3.5 text-[24px] font-extrabold outline-none"
            />
            <span className="shrink-0 border-l-[2.5px] border-ink px-4 py-3.5 text-[14px] font-extrabold">
              {input?.symbol}
            </span>
          </div>
          <div className="mt-1.5 flex justify-between text-[12.5px] font-semibold text-ink/55">
            <span>{inUsd !== null ? `≈ ${usd(inUsd)}` : ""}</span>
            {overBalance && (
              <span className="font-bold" style={{ color: "var(--neg)" }}>
                More than you have
              </span>
            )}
          </div>
        </div>

        {/* slippage */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Max slippage</span>
          {[10, 50, 100, 300].map((bps) => (
            <button
              key={bps}
              type="button"
              onClick={() => setSlippageBps(bps)}
              className="rounded-full border-[2.5px] border-ink px-3 py-1 text-[12.5px] font-extrabold"
              style={{ background: slippageBps === bps ? "var(--lemon)" : "var(--paper)" }}
            >
              {bps / 100}%
            </button>
          ))}
        </div>

        {/* quote */}
        <div className="pop-flat mt-5 p-4 !shadow-none" style={{ background: "var(--mist)" }}>
          {quoteError ? (
            <p className="text-[13px] font-bold" style={{ color: "var(--neg)" }}>
              {quoteError}
            </p>
          ) : !quote ? (
            <p className="text-[13px] font-semibold text-ink/55">
              {quoting ? "Finding the best route…" : "Enter an amount to see a live route."}
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="label">You get</span>
                <span className="text-[12px] font-bold text-ink/50">
                  {quoting ? "refreshing…" : route}
                </span>
              </div>
              <div className="mt-1.5 text-[32px] font-black tracking-[-0.035em]">
                {outUi !== null ? num(outUi, outUi >= 1000 ? 2 : 6) : "—"}{" "}
                <span className="text-[18px] font-extrabold text-ink/50">{output?.symbol}</span>
              </div>
              {outUsd !== null && (
                <div className="mt-1 text-[13px] font-bold text-ink/55">≈ {usd(outUsd)}</div>
              )}

              <div className="mt-3 flex flex-col gap-2 border-t-2 border-ink/15 pt-3 text-[13px] font-semibold">
                <div className="flex justify-between">
                  <span className="text-ink/55">You get at least</span>
                  <span className="font-bold">
                    {minOutUi !== null ? num(minOutUi, 6) : "—"} {output?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/55">Price impact</span>
                  <span
                    className="font-bold"
                    style={{
                      color: impact === null ? undefined : impact > 1 ? "var(--neg)" : "var(--pos)",
                    }}
                  >
                    {impact !== null ? `${impact.toFixed(3)}%` : "—"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* action */}
        {!connected ? (
          <p className="mt-5 text-center text-[14px] font-bold text-ink/60">
            Connect a wallet to make this swap.
          </p>
        ) : (
          <button
            type="button"
            onClick={executeSwap}
            disabled={!quote || busy || overBalance}
            className="btn btn-orange mt-5 w-full !text-[16px]"
          >
            {status.kind === "building"
              ? "Building transaction…"
              : status.kind === "signing"
                ? "Approve in your wallet…"
                : status.kind === "sending"
                  ? "Confirming on-chain…"
                  : `Swap ${input?.symbol} → ${output?.symbol}`}
          </button>
        )}

        {/* result */}
        {status.kind === "done" && (
          <div
            className="pop-flat mt-4 p-3.5 text-[13.5px] font-bold !shadow-none"
            style={{ background: "var(--lime)" }}
          >
            Swap confirmed!{" "}
            <a
              href={`https://solscan.io/tx/${status.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Solscan ↗
            </a>
          </div>
        )}
        {status.kind === "error" && (
          <div
            className="pop-flat mt-4 p-3.5 text-[13.5px] font-bold break-words !shadow-none"
            style={{ background: "var(--coral)" }}
          >
            {status.message}
          </div>
        )}

        <p className="mt-4 text-[11.5px] leading-relaxed font-medium text-ink/55">
          This executes a real swap through Jupiter on Solana mainnet, signed by your own wallet.
          Your keys never leave your wallet and this site cannot move funds on its own. It is a
          swap — not a Margin Call deposit or loan.
          {USING_PUBLIC_RPC && " Running on a shared public RPC, which is rate-limited."}
        </p>
      </div>
    </div>
  );
}
