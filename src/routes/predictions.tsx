import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { predictions, opportunities } from "@/lib/family-data";
import { PremiumRoute } from "@/components/PremiumRoute";

export const Route = createFileRoute("/predictions")({
  head: () => ({ meta: [{ title: "Predictions & Opportunities — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <PremiumRoute min="max" feature="Predictive Planning">
    <AppShell>
      <PageHeader
        back
        eyebrow="Looking ahead, calmly"
        title="What's likely coming — and what you might enjoy."
        subtitle="Suggestions, not facts. Based on your family's history. You always decide."
      />

      <section className="px-6 mb-8">
        <SectionLabel>Predicted needs</SectionLabel>
        <div className="space-y-2">
          {predictions.map((p) => (
            <Card key={p.id}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.when}</p>
              <p className="mt-1 text-[14px] leading-snug">{p.text}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                  Watch for it
                </button>
                <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest">
                  Not relevant
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <SectionLabel>Nice opportunities</SectionLabel>
        <div className="space-y-2">
          {opportunities.map((o) => (
            <div key={o.id} className="rounded-2xl border border-hairline bg-surface p-4 text-[14px] leading-snug">
              {o.text}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
      </PremiumRoute>
  );
}
