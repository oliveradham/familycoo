import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { expenses } from "@/lib/family-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Family COO" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const max = Math.max(...expenses.map((e) => e.amount));
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Household spend"
        title="Where the month went."
        subtitle="Trends, not transactions. Categorized automatically."
      />

      <section className="px-6 mb-6">
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            October to date
          </p>
          <p className="mt-2 font-serif text-4xl italic leading-none">
            ${total.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">+6% vs. September</p>
        </Card>
      </section>

      <section className="px-6">
        <div className="space-y-2">
          {expenses.map((e) => {
            const pct = Math.round((e.amount / max) * 100);
            const negative = e.delta.startsWith("−");
            return (
              <Card key={e.category} className="!p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="text-sm font-medium">{e.category}</p>
                  <p className="font-serif text-lg italic">${e.amount.toLocaleString()}</p>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-zinc-900" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{e.note}</span>
                  <span className={negative ? "text-emerald-600" : "text-foreground"}>{e.delta}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
