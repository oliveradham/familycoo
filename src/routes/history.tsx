import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { history, annualSummary } from "@/lib/family-data";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Family Memory — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family history & memory"
        title="Moments worth keeping."
        subtitle="You choose what becomes lasting. I don't archive everything — that would be surveillance, not memory."
      />

      <section className="px-6 mb-8">
        <Card className="bg-zinc-900 text-white">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Annual family summary · {annualSummary.year}</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat n={annualSummary.moments} label="Moments" />
            <Stat n={annualSummary.trips} label="Trips" />
            <Stat n={annualSummary.milestones} label="Milestones" />
          </div>
          <ul className="mt-5 space-y-2 text-[13px] text-white/85">
            {annualSummary.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-white/70" />
                {h}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-6">
        <SectionLabel>Saved moments</SectionLabel>
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4">
              <p className="w-20 text-[11px] uppercase tracking-widest text-muted-foreground">{h.when}</p>
              <p className="flex-1 font-serif text-[16px] italic">{h.label}</p>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{h.tag}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl italic leading-none">{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-white/60">{label}</p>
    </div>
  );
}
