import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { plans } from "@/lib/family-data";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/plans")({
  head: () => ({ meta: [{ title: "Plans — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Plans"
        title="Room to grow with your family."
        subtitle="Start free. Upgrade when the calm becomes something you'd pay to keep."
      />

      <section className="px-6 space-y-4">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={
              p.featured
                ? "border-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.03),0_10px_30px_-15px_rgba(0,0,0,0.15)]"
                : ""
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.best}
                </p>
                <p className="mt-1 font-serif text-[22px] italic leading-tight">{p.name}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.tagline}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-[26px] italic leading-none">{p.price}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.cadence}
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {p.includes.map((i, k) => (
                <li key={k} className="flex items-start gap-2.5 text-[14px] leading-snug">
                  <Check className="mt-1 size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            {p.limits && (
              <div className="mt-4 rounded-2xl bg-secondary/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Fair-use limits
                </p>
                <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
                  {p.limits.map((l, k) => (
                    <li key={k}>· {l}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className={`mt-5 w-full rounded-full px-4 py-3 text-[12px] font-medium uppercase tracking-widest ${
                p.featured
                  ? "bg-zinc-900 text-white"
                  : "border border-hairline bg-surface text-foreground"
              }`}
            >
              {p.cta}
            </button>
          </Card>
        ))}
      </section>

      <section className="px-6 mt-10">
        <SectionLabel>How upgrading feels here</SectionLabel>
        <Card>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[14px] leading-relaxed text-foreground/85">
              Premium features are visible everywhere in the app, quietly labeled. Nothing is hidden or dark-patterned. You'll always see <em className="font-serif italic">why</em> a feature helps before we ever ask you to upgrade.
            </p>
          </div>
        </Card>
      </section>

      <section className="px-6 mt-6 pb-10">
        <Link
          to="/marketplace"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Also available
            </p>
            <p className="mt-1 font-serif text-xl italic">Family Marketplace</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              One-time templates, itineraries, and installable AI workflows.
            </p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
      </section>
    </AppShell>
  );
}
