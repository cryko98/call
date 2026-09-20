import {
  FAQ,
  GUARANTEES,
  PILLARS,
  ROADMAP,
  STEPS,
  TOKEN_UTILITY,
  TOKENOMICS,
  type RoadmapStatus,
} from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Shared section shell                                                */
/* ------------------------------------------------------------------ */

export function SectionHead({
  tag,
  title,
  sub,
  demo,
}: {
  tag: string;
  title: React.ReactNode;
  sub?: string;
  demo?: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="label" style={{ color: "var(--amber)" }}>
        {tag}
      </span>
      <h2 className="mt-3 text-[26px] leading-[1.15] font-bold tracking-[-0.02em] sm:text-[36px]">
        {title}
      </h2>
      {sub ? <p className="mt-3 text-[13px] leading-[1.8] text-muted">{sub}</p> : null}
      {demo ? (
        <div
          className="mt-5 inline-flex items-center gap-2 border px-3 py-1.5 text-[9.5px] tracking-[0.14em] uppercase"
          style={{
            borderColor: "var(--amber)",
            color: "var(--amber)",
            background: "rgba(255,176,0,0.06)",
          }}
        >
          ⚠ {demo}
        </div>
      ) : null}
    </div>
  );
}

function Section({
  id,
  children,
  bordered = true,
}: {
  id?: string;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-18 sm:py-24 ${bordered ? "border-t border-line" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHead
        tag="// 01 — Mechanics"
        title="Three steps. No intermediary."
        sub="Every position is an on-chain account you control. No custodian holds your keys and no broker approves your trade."
      />
      <div className="panel mt-9 grid lg:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="panel-hover border-b border-line p-7 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className="label" style={{ color: "var(--amber)" }}>
              Step {s.n}
            </div>
            <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
            <p className="mt-2.5 text-[12.5px] leading-[1.8] text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Architecture                                                        */
/* ------------------------------------------------------------------ */

export function Architecture() {
  return (
    <Section>
      <SectionHead
        tag="// 02 — Risk engine"
        title="Boring where it matters."
        sub="Lending protocols fail in predictable ways: bad oracles, shared bad debt, and liquidations that punish more than they need to. Each of those has a specific answer here."
      />
      <div className="mt-9 grid gap-px bg-line sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="panel-hover bg-panel p-7">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0" style={{ background: p.tint }} aria-hidden="true" />
              <h3 className="text-[14.5px] font-semibold">{p.title}</h3>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.8] text-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Tokenomics                                                          */
/* ------------------------------------------------------------------ */

export function Tokenomics() {
  return (
    <Section id="token">
      <SectionHead
        tag="// 05 — The token"
        title="$CALL"
        sub="A fixed-supply SPL token. Protocol fees route to stakers, and governance controls collateral onboarding and risk parameters."
      />

      <div className="panel mt-9 grid lg:grid-cols-2">
        <div className="border-b border-line p-7 lg:border-b-0 lg:border-r">
          <div className="label">Supply distribution — 1,000,000,000 $CALL</div>
          <div className="mt-6 flex flex-col gap-5">
            {TOKENOMICS.map((t) => (
              <div key={t.label}>
                <div className="flex items-baseline justify-between gap-4 text-[12.5px]">
                  <span>
                    {t.label}
                    {t.sub ? <span className="ml-2 text-[11px] text-dim">· {t.sub}</span> : null}
                  </span>
                  <b className="font-semibold">{t.pct}%</b>
                </div>
                <div className="mt-2 h-1 bg-line">
                  <div className="h-full" style={{ width: `${t.pct}%`, background: t.tint }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <div className="label">What it does</div>
            <div className="mt-4 flex flex-col gap-4">
              {TOKEN_UTILITY.map((u) => (
                <div key={u.title}>
                  <h4 className="text-[12.5px] font-semibold">{u.title}</h4>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{u.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-panel-2 p-7">
          <div className="label">Safety guarantees</div>
          <ul className="mt-4">
            {GUARANTEES.map((g) => (
              <li
                key={g.title}
                className="flex gap-3 border-b border-line-soft py-3.5 last:border-b-0"
              >
                <span className="shrink-0 font-bold" style={{ color: "var(--pos)" }} aria-hidden="true">
                  ✓
                </span>
                <div>
                  <h4 className="text-[12.5px] font-semibold">{g.title}</h4>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{g.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap                                                             */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  done: "Complete",
  active: "In progress",
  next: "Planned",
};

const STATUS_COLOR: Record<RoadmapStatus, string> = {
  done: "var(--pos)",
  active: "var(--amber)",
  next: "var(--dim)",
};

export function Roadmap() {
  return (
    <Section id="roadmap">
      <SectionHead
        tag="// 06 — Roadmap"
        title="Shipping order."
        sub="Dates are targets, not promises. Scope moves before deadlines do."
      />
      <div className="panel mt-9">
        {ROADMAP.map((p) => (
          <div key={p.phase} className="grid border-b border-line last:border-b-0 lg:grid-cols-[190px_1fr]">
            <div className="flex items-baseline gap-3 border-b border-line bg-panel-2 px-6 py-4 lg:flex-col lg:gap-1.5 lg:border-r lg:border-b-0 lg:py-6">
              <div className="label" style={{ color: STATUS_COLOR[p.status] }}>
                {p.phase}
              </div>
              <div className="label">{STATUS_LABEL[p.status]}</div>
            </div>
            <div className="px-6 py-6">
              <h3 className="text-[15px] font-semibold">{p.title}</h3>
              <ul className="mt-3 flex flex-col gap-1.5">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-2.5 text-[12.5px] text-muted">
                    <span
                      className="shrink-0"
                      style={{ color: p.status === "done" ? "var(--pos)" : "var(--line)" }}
                      aria-hidden="true"
                    >
                      {p.status === "done" ? "✓" : "▸"}
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function Faq() {
  return (
    <Section id="faq">
      <SectionHead tag="// 07 — FAQ" title="Questions worth asking." />
      <div className="panel mt-9">
        {FAQ.map((f, i) => (
          <details key={f.q} open={i === 0} className="group border-b border-line last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4.5 text-[13.5px] font-medium transition-colors hover:text-amber [&::-webkit-details-marker]:hidden">
              {f.q}
              <span
                className="shrink-0 text-[17px] transition-transform group-open:rotate-45"
                style={{ color: "var(--amber)" }}
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="max-w-3xl px-6 pb-5 text-[12.5px] leading-[1.85] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

export function ClosingCta() {
  return (
    <div className="border-t border-line bg-panel py-16 text-center sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <h2 className="text-[26px] leading-[1.2] font-bold tracking-[-0.02em] sm:text-[34px]">
          Your collateral is already working.
          <br />
          <span style={{ color: "var(--amber)" }}>Make it work twice.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-muted">
          Join the community before the token generation event.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#borrow"
            className="px-6 py-3.5 text-[12px] font-semibold tracking-[0.11em] transition-opacity hover:opacity-90"
            style={{ background: "var(--amber)", color: "var(--bg)" }}
          >
            MODEL A POSITION
          </a>
          <a
            href="#"
            className="border border-line bg-bg px-6 py-3.5 text-[12px] font-semibold tracking-[0.11em] transition-colors hover:border-muted"
          >
            JOIN TELEGRAM
          </a>
        </div>
      </div>
    </div>
  );
}
