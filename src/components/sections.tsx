import { FAQ, PILLARS, ROADMAP, STEPS, type RoadmapStatus } from "@/lib/data";
import { HandArrow, PixelCloud, Sparkle } from "./pixel-art";

/* ------------------------------------------------------------------ */
/* Shared section shell                                                */
/* ------------------------------------------------------------------ */

export function SectionHead({
  tag,
  title,
  sub,
  note,
}: {
  tag: string;
  title: React.ReactNode;
  sub?: string;
  /** Hand-written marginalia set beside the heading. */
  note?: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="pill" style={{ background: "var(--lemon)" }}>
        {tag}
      </span>
      <h2 className="mt-4 text-[32px] leading-[1.02] font-black tracking-[-0.04em] sm:text-[44px]">
        {title}
        {note ? (
          <span className="hand ml-3 inline-block -rotate-3 align-middle text-[22px] font-bold text-ink/50">
            {note}
          </span>
        ) : null}
      </h2>
      {sub ? (
        <p className="mt-4 text-[16px] leading-relaxed font-medium text-ink/70">{sub}</p>
      ) : null}
    </div>
  );
}

function Section({
  id,
  children,
  band = "band-paper",
}: {
  id?: string;
  children: React.ReactNode;
  band?: string;
}) {
  return (
    <section id={id} className={`band-edge ${band} scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const STEP_TINTS = ["var(--coral)", "var(--lime)", "var(--gold)"];

export function HowItWorks() {
  return (
    <Section id="how" band="band-peri">
      <SectionHead
        tag="How it works"
        title="Three steps."
        note="that's it"
        sub="Every position is an on-chain account you control. No custodian holds your keys and no broker approves your trade."
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className="pop pop-hover p-6"
            style={{ background: STEP_TINTS[i % STEP_TINTS.length] }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border-[2.5px] border-ink bg-white text-[17px] font-black">
              {s.n}
            </span>
            <h3 className="mt-4 text-[21px] font-extrabold tracking-[-0.03em]">{s.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed font-medium text-ink/75">{s.body}</p>
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
        tag="Risk engine"
        title="Boring where it matters."
        sub="Lending protocols fail in predictable ways: bad oracles, shared bad debt, and liquidations that punish more than they need to. Each of those has a specific answer here."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {PILLARS.map((p, i) => (
          <div key={p.title} className="pop pop-hover p-6" style={{ background: "var(--mist)" }}>
            <div className="flex items-center gap-3">
              <span
                className="h-5 w-5 shrink-0 rounded-md border-[2.5px] border-ink"
                style={{ background: p.tint }}
                aria-hidden="true"
              />
              <h3 className="text-[19px] font-extrabold tracking-[-0.03em]">{p.title}</h3>
              {i === 0 && <Sparkle size={20} className="ml-auto" />}
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed font-medium text-ink/75">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap                                                             */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  done: "Done",
  active: "In progress",
  next: "Planned",
};

const STATUS_TINT: Record<RoadmapStatus, string> = {
  done: "var(--lime)",
  active: "var(--gold)",
  next: "var(--paper)",
};

export function Roadmap() {
  return (
    <Section id="roadmap" band="band-sky">
      <SectionHead
        tag="Roadmap"
        title="Shipping order."
        note="dates are targets"
        sub="Scope moves before deadlines do."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {ROADMAP.map((p) => (
          <div
            key={p.phase}
            className="pop pop-hover p-6"
            style={{ background: STATUS_TINT[p.status] }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="label">{p.phase}</span>
              <span className="pill" style={{ background: "var(--paper)" }}>
                {STATUS_LABEL[p.status]}
              </span>
            </div>
            <h3 className="mt-3 text-[21px] font-extrabold tracking-[-0.03em]">{p.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {p.items.map((it) => (
                <li key={it} className="flex gap-2.5 text-[14px] font-medium text-ink/75">
                  <span className="shrink-0 font-black" aria-hidden="true">
                    {p.status === "done" ? "✓" : "→"}
                  </span>
                  {it}
                </li>
              ))}
            </ul>
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
      <SectionHead tag="FAQ" title="Questions worth asking." />
      <div className="mt-10 flex flex-col gap-4">
        {FAQ.map((f, i) => (
          <details key={f.q} open={i === 0} className="pop group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 text-[17px] font-extrabold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
              {f.q}
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[2.5px] border-ink text-[19px] font-black transition-transform group-open:rotate-45"
                style={{ background: "var(--lemon)" }}
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="border-t-2 border-ink/10 px-6 py-5 text-[14.5px] leading-relaxed font-medium text-ink/75">
              {f.a}
            </p>
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
    <section className="sunburst band-edge band-orange relative overflow-hidden px-4 py-20 text-center sm:px-6">
      <PixelCloud size={120} className="absolute top-6 left-6 text-white/45" />
      <PixelCloud size={90} className="absolute right-8 bottom-8 text-white/35" />
      <Sparkle size={30} className="absolute top-14 right-[18%] hidden sm:block" />
      <HandArrow
        size={70}
        className="absolute bottom-16 left-[14%] hidden -rotate-12 text-ink/30 lg:block"
      />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-[36px] leading-[1.02] font-black tracking-[-0.04em] sm:text-[52px]">
          Your collateral is already working.
          <br />
          <span className="relative inline-block">
            <span
              className="absolute inset-x-[-12px] inset-y-[3px] rotate-1 rounded-xl border-[3px] border-ink"
              style={{ background: "var(--lemon)" }}
              aria-hidden="true"
            />
            <span className="relative">Make it work twice.</span>
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[16.5px] font-semibold text-ink/75">
          Swap into tokenized stocks right here, or model a loan before you commit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#swap" className="btn btn-primary !text-[17px]">
            Trade now
          </a>
          <a href="#borrow" className="btn !text-[17px]">
            Run the numbers
          </a>
        </div>
      </div>
    </section>
  );
}
