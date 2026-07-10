import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { scenarios } from "@/lib/family-data";

export const Route = createFileRoute("/scenarios")({
  head: () => ({ meta: [{ title: "Scenarios — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Scenario planning"
        title='"What if…"'
        subtitle="Ask a hypothetical. I use your family's real calendar, budget, and habits to answer with a workable plan."
      />

      <section className="px-6 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5">
          <span className="text-[13px] text-muted-foreground flex-1">Ask a scenario…</span>
          <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
            Try
          </button>
        </div>
      </section>

      <section className="px-6 space-y-3">
        {scenarios.map((s) => (
          <Card key={s.id}>
            <p className="font-serif text-[18px] italic leading-snug">{s.q}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{s.a}</p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
