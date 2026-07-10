import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { comparisons } from "@/lib/family-data";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Comparisons — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Comparison assistant"
        title="Fewer tabs. Clearer tradeoffs."
        subtitle="Camps, hotels, tutors, plans — summarized against your family's schedule and preferences."
      />
      <section className="px-6 space-y-4 pb-8">
        {comparisons.map((c) => (
          <Card key={c.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.kind}</p>
            <div className="mt-3 space-y-2">
              {c.options.map((o) => (
                <div key={o.name} className="rounded-2xl border border-hairline p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-serif text-[16px] italic">{o.name}</p>
                    <p className="text-[12px] text-muted-foreground">{o.price} · fit {o.fit}</p>
                  </div>
                  <p className="mt-1 text-[12.5px] text-foreground/80">{o.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-zinc-900 p-3 text-[13px] leading-snug text-white">
              <span className="text-[10px] uppercase tracking-widest text-white/60">Recommendation</span>
              <br />
              {c.recommend}
            </p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
