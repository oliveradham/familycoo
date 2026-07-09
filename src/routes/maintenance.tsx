import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { maintenance } from "@/lib/family-data";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Home Maintenance — Family COO" }] }),
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Household"
        title="Home, on schedule."
        subtitle="Recurring tasks predicted, warranties tracked, filters replaced before you notice."
      />

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {maintenance.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{m.item}</p>
                  <p className="text-xs text-muted-foreground">Due · {m.due}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                    m.status === "attention"
                      ? "bg-zinc-900 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
