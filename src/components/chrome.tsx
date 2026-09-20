"use client";

import { useEffect, useState } from "react";
import { BRAND, SOCIALS } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center border font-bold"
      style={{
        width: size,
        height: size,
        borderColor: "var(--amber)",
        color: "var(--amber)",
        fontSize: size * 0.5,
        boxShadow: "inset 0 0 14px rgba(255,176,0,0.18)",
      }}
      aria-hidden="true"
    >
      M
    </span>
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
  { href: "#token", label: "$CALL" },
  { href: "#roadmap", label: "Roadmap" },
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
    <header
      className="sticky z-50 transition-colors duration-300"
      style={{
        top: "var(--tape-h, 34px)",
        background: scrolled ? "rgba(6, 8, 10, 0.88)" : "rgba(6, 8, 10, 0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
      }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
          <Logo />
          <span className="text-[14px] font-bold tracking-[0.04em]">MARGIN CALL</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[11.5px] tracking-[0.06em] text-muted uppercase transition-colors hover:text-amber"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <a
            href="#swap"
            className="hidden border px-4 py-2 text-[11px] font-semibold tracking-[0.1em] transition-colors sm:block"
            style={{ borderColor: "var(--amber)", color: "var(--amber)" }}
          >
            OPEN SWAP
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="border border-line p-2 lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {open ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 4.5h12M2 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-panel px-5 py-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line-soft py-3 text-[12.5px] tracking-[0.06em] text-muted uppercase transition-colors last:border-b-0 hover:text-amber"
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

const NOT_DEPLOYED = "Not yet deployed — address published at launch";

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
    <div className="panel flex max-w-xl items-stretch text-[11.5px]">
      <span className="label shrink-0 border-r border-line bg-panel-2 px-3.5 py-3">CA</span>
      <span
        className="min-w-0 flex-1 truncate px-3.5 py-3"
        style={{ color: hasAddress ? "var(--text)" : "var(--dim)" }}
      >
        {hasAddress ? BRAND.contract : NOT_DEPLOYED}
      </span>
      <button
        type="button"
        onClick={copy}
        disabled={!hasAddress}
        aria-label="Copy contract address"
        className="shrink-0 border-l border-line bg-panel-2 px-4 py-3 tracking-[0.1em] transition-colors enabled:hover:bg-amber enabled:hover:text-bg disabled:cursor-not-allowed"
        style={{ color: hasAddress ? "var(--amber)" : "var(--dim)" }}
      >
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="flex flex-wrap justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[14px] font-bold tracking-[0.04em]">MARGIN CALL</span>
            </div>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
              Borrow against your crypto. Buy tokenized equities. Settled on Solana.
            </p>
          </div>

          <div className="flex h-fit flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="border border-line px-4 py-2 text-[10.5px] tracking-[0.1em] text-muted uppercase transition-colors hover:border-amber hover:text-amber"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="panel mt-10 p-5">
          <p className="text-[11px] leading-[1.85] text-muted">
            <strong style={{ color: "var(--neg)", letterSpacing: "0.1em" }}>RISK DISCLAIMER —</strong>{" "}
            {BRAND.ticker} is a crypto-asset with no intrinsic value and no guarantee of value
            retention. Nothing on this page is investment, financial, legal or tax advice, and no
            part of it constitutes an offer or solicitation to buy any asset. Borrowing against
            volatile collateral carries liquidation risk: you can lose your entire deposit. Smart
            contracts may contain vulnerabilities, and the protocol described here is pre-launch and
            unaudited. All prices, rates and yields displayed on this site are simulated
            placeholders, not live market data. Tokenized equities are issued by independent third
            parties and are unavailable in several jurisdictions. Never commit capital you cannot
            afford to lose entirely, and do your own research.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2.5 text-[10.5px] tracking-[0.06em] text-dim uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Margin Call · All rights reserved</span>
          <span>
            Solana mainnet-beta ·{" "}
            <span style={{ color: "var(--pos)" }}>● System nominal</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
