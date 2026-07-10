import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { departures } from "@/lib/family-data";

export const Route = createFileRoute("/departure")({
  head: () => ({ meta: [{ title: "Departure — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Departure intelligence"
        title="When to actually leave."
        subtitle="Not the event start time. The real time — with traffic, parking, check-in, and how long the kids take."
      />
      <section className="px-6 space-y-4">
        {departures.map((d) => (
          <Card key={d.id}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{d.event}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Get ready</p>
                <p className="mt-1 font-serif text-3xl italic">{d.getReadyAt}</p>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/60">Leave</p>
                <p className="mt-1 font-serif text-3xl italic">{d.leaveAt}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {d.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
