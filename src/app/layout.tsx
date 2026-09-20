import type { Metadata, Viewport } from "next";
import { Caveat, Outfit } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/data";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/** Used only for the hand-drawn marginalia. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const description =
  "Margin Call is a non-custodial Solana lending market. Post SOL or BTC as collateral, borrow stablecoins against it, and buy tokenized equities without ever closing your crypto position.";

export const metadata: Metadata = {
  metadataBase: new URL("https://margincall.xyz"),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description,
  keywords: [
    "Solana",
    "DeFi",
    "lending",
    "borrowing",
    "tokenized equities",
    "xStocks",
    "collateral",
    "Margin Call",
    "$CALL",
  ],
  openGraph: {
    type: "website",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description,
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#bcc8fb",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
