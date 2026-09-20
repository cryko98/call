import { NextResponse } from "next/server";
import { ALL_TOKENS } from "@/lib/tokens";

/**
 * Jupiter swap proxy.
 *
 * GET  /api/swap?inputMint&outputMint&amount&slippageBps  → quote
 * POST /api/swap  { quoteResponse, userPublicKey }        → unsigned transaction
 *
 * Proxying keeps CORS out of the picture and, more importantly, lets us pin
 * both mints to the registry. A quote is harmless, but the POST returns a
 * transaction the user is about to sign — it must never be built for a mint
 * this site did not vet.
 */

const JUPITER = "https://lite-api.jup.ag/swap/v1";

const KNOWN_MINTS = new Set(ALL_TOKENS.map((t) => t.mint));

/** Solana addresses are base58 and never contain 0, O, I or l. */
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const MAX_SLIPPAGE_BPS = 500; // 5% — past this a user is very likely being sandwiched.

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const inputMint = params.get("inputMint") ?? "";
  const outputMint = params.get("outputMint") ?? "";
  const amount = params.get("amount") ?? "";
  const slippageBps = Number(params.get("slippageBps") ?? "50");

  if (!KNOWN_MINTS.has(inputMint) || !KNOWN_MINTS.has(outputMint)) {
    return bad("Unsupported token pair");
  }
  if (inputMint === outputMint) return bad("Input and output must differ");
  if (!/^\d+$/.test(amount) || amount === "0") return bad("Amount must be a positive integer");
  if (!Number.isFinite(slippageBps) || slippageBps < 1 || slippageBps > MAX_SLIPPAGE_BPS) {
    return bad(`Slippage must be between 1 and ${MAX_SLIPPAGE_BPS} bps`);
  }

  const url =
    `${JUPITER}/quote?inputMint=${inputMint}&outputMint=${outputMint}` +
    `&amount=${amount}&slippageBps=${slippageBps}&restrictIntermediateTokens=true`;

  try {
    const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
    const body = await res.json();
    if (!res.ok) return bad(body?.error ?? `Jupiter responded ${res.status}`, 502);
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return bad("Could not reach Jupiter", 502);
  }
}

export async function POST(request: Request) {
  let payload: { quoteResponse?: Record<string, unknown>; userPublicKey?: string };
  try {
    payload = await request.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const { quoteResponse, userPublicKey } = payload;

  if (!quoteResponse || typeof quoteResponse !== "object") return bad("Missing quoteResponse");
  if (!userPublicKey || !BASE58.test(userPublicKey)) return bad("Invalid wallet address");

  // Re-check the quote's own mints: the client could have altered them after
  // the quote came back, and this response is a signable transaction.
  const inputMint = quoteResponse.inputMint;
  const outputMint = quoteResponse.outputMint;
  if (typeof inputMint !== "string" || !KNOWN_MINTS.has(inputMint)) {
    return bad("Quote references an unsupported input mint");
  }
  if (typeof outputMint !== "string" || !KNOWN_MINTS.has(outputMint)) {
    return bad("Quote references an unsupported output mint");
  }

  try {
    const res = await fetch(`${JUPITER}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: { priorityLevelWithMaxLamports: { priorityLevel: "medium", maxLamports: 4_000_000 } },
      }),
    });
    const body = await res.json();
    if (!res.ok) return bad(body?.error ?? `Jupiter responded ${res.status}`, 502);
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return bad("Could not reach Jupiter", 502);
  }
}
