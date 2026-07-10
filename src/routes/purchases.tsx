import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { purchases } from "@/lib/family-data";

export const Route = createFileRoute("/purchases")({
  head: () => ({ meta: [{ title: "Purchase Memory — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Purchase memory"
        title="Sizes, brands, and the things that didn't work."
        subtitle="So you don't buy the wrong sunscreen twice, or forget which brand of racquet strings the coach recommends."
      />
      <section className="px-6 space-y-2">
        {purchases.map((p) => (
          <Card key={p.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</p>
            <p className="mt-1 font-serif text-[18px] italic leading-tight">{p.value}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{p.note}</p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
