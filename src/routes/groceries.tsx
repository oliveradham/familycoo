import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import { pantry } from "@/lib/family-data";

export const Route = createFileRoute("/groceries")({
  head: () => ({ meta: [{ title: "Groceries & Pantry — Family COO" }] }),
  component: GroceriesPage,
});

function GroceriesPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Household inventory"
        title="Groceries & pantry."
        subtitle="Lists rebuild themselves from meals, consumption, guests, and travel."
      />

      <section className="px-6 mb-8">
        <SectionLabel action={<button>Order all</button>}>Running low</SectionLabel>
        <Card>
          <ul className="divide-y divide-hairline">
            {pantry.low.map((p) => (
              <li key={p.item} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{p.item}</p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </div>
                <button className="rounded-full border border-hairline px-3 py-1 text-[10px] uppercase tracking-widest">
                  Add
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-6">
        <SectionLabel>AI suggestions</SectionLabel>
        <div className="space-y-2">
          {pantry.suggestions.map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-hairline bg-surface p-4 text-sm leading-relaxed"
            >
              {s}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
