"use client";

import { useEffect, useState } from "react";
import { BRAND, SOCIALS } from "@/lib/data";
import { PixelCloud } from "./pixel-art";

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle cx="20" cy="20" r="18" fill="var(--lemon)" stroke="var(--ink)" strokeWidth="3" />
      {/* a falling candle — the margin call itself */}
      <path
        d="M14 11v18M26 15v14"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="10" y="16" width="8" height="9" rx="2" fill="var(--coral)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="22" y="19" width="8" height="7" rx="2" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#borrow", label: "Calculator" },
  { href: "#swap", label: "Swap" },
  { href: "#markets", label: "Markets" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-[42px] z-50 px-4 pt-4 sm:px-6">
      <nav
        className="pop mx-auto flex max-w-6xl items-center justify-between py-2.5 pr-2.5 pl-4 transition-shadow"
        style={{ boxShadow: scrolled ? "6px 6px 0 var(--ink)" : "4px 4px 0 var(--ink)" }}
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
          <Logo />
          <span className="text-[17px] font-extrabold tracking-[-0.03em]">Margin Call</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[14.5px] font-semibold transition-colors hover:text-orange"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#swap" className="btn btn-primary hidden !px-5 !py-2.5 !text-[14px] sm:inline-flex">
            Trade now
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="pop-flat !rounded-full p-2.5 lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
              ) : (
                <path d="M2 5h14M2 13h14" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="pop mx-auto mt-2 max-w-6xl overflow-hidden lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="border-b-2 border-ink/10 last:border-b-0">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3.5 text-[15px] font-bold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Contract address                                                    */
/* ------------------------------------------------------------------ */

export function ContractBar() {
  const [copied, setCopied] = useState(false);
  const hasAddress = BRAND.contract.length > 0;

  async function copy() {
    if (!hasAddress) return;
    try {
      await navigator.clipboard.writeText(BRAND.contract);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the address stays visible on screen */
    }
  }

  return (
    <div className="pop flex max-w-lg items-center gap-3 py-2 pr-2 pl-4">
      <span className="label shrink-0">CA</span>
      <span
        className="min-w-0 flex-1 truncate text-[13.5px] font-semibold"
        style={{ color: hasAddress ? "var(--ink)" : "var(--ink-faint)" }}
      >
        {hasAddress ? BRAND.contract : "Not deployed yet"}
      </span>
      <button
        type="button"
        onClick={copy}
        disabled={!hasAddress}
        aria-label="Copy contract address"
        className="btn !px-4 !py-1.5 !text-[13px] !shadow-none"
        style={{ background: copied ? "var(--lime)" : "var(--mist)" }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="band-edge band-peri relative overflow-hidden px-4 pt-16 pb-10 sm:px-6">
      <PixelCloud
        size={150}
        className="absolute -top-2 right-6 text-white/70"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[19px] font-extrabold tracking-[-0.03em]">Margin Call</span>
            </div>
            <p className="mt-3 max-w-xs text-[14.5px] font-medium text-ink-soft">
              Borrow against your crypto. Buy tokenized stocks. All on Solana.
            </p>
            <div className="mt-5">
              <ContractBar />
            </div>
          </div>

          <div className="flex h-fit flex-wrap gap-2.5">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} className="btn pop-hover !px-4 !py-2 !text-[13.5px]">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pop mt-10 bg-white/80 p-5">
          <p className="text-[12.5px] leading-relaxed font-medium text-ink-soft">
            <strong className="text-neg">Risk disclaimer —</strong> {BRAND.ticker} is a crypto-asset
            with no intrinsic value and no guarantee of value retention. Nothing here is investment,
            financial, legal or tax advice, and no part of it is an offer to buy any asset.
            Borrowing against volatile collateral carries liquidation risk: you can lose your entire
            deposit. Smart contracts may contain vulnerabilities, and the protocol described here is
            pre-launch and unaudited. Tokenized equities are issued by independent third parties and
            are unavailable in several jurisdictions, including the United States. Swaps executed on
            this page are real, irreversible mainnet transactions. Never commit capital you cannot
            afford to lose entirely, and do your own research.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2 text-[13px] font-semibold text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Margin Call</span>
          <span className="flex items-center gap-2">
            <span className="blink h-2 w-2 rounded-full" style={{ background: "var(--pos)" }} />
            Live on Solana mainnet
          </span>
        </div>
      </div>
    </footer>
  );
}
