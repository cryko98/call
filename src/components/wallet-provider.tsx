"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Wallet plumbing.
 *
 * No adapters are listed explicitly: Phantom, Solflare, Backpack and the rest
 * register themselves through the Wallet Standard, so the provider discovers
 * whatever the visitor actually has installed. Private keys never reach this
 * site — the wallet signs and hands back a signed transaction.
 */

/**
 * The public endpoint is rate-limited and will fail under any real traffic.
 * Set NEXT_PUBLIC_SOLANA_RPC to a dedicated endpoint (Helius, Triton, QuickNode)
 * before putting this in front of users.
 */
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/** True when the app is pointed at the shared public RPC. */
export const USING_PUBLIC_RPC = !process.env.NEXT_PUBLIC_SOLANA_RPC;
