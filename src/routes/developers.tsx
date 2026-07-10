import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { developerPlatform } from "@/lib/family-data";

export const Route = createFileRoute("/developers")({
  head: () => ({ meta: [{ title: "Developer Platform — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Developer platform · preview"
        title="Family COO as trusted infrastructure."
        subtitle="Approved partners integrate through narrow, scoped permissions. No partner sees more than needed."
      />
      <section className="px-6 space-y-2 pb-8">
        {developerPlatform.map((p) => (
          <Card key={p.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[17px] italic">{p.partner}</p>
              <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Scoped
              </span>
            </div>
            <p className="mt-2 text-[13px] text-foreground/80">{p.scope}</p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
