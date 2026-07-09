import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card, SectionLabel } from "@/components/app-shell";
import { family, memory } from "@/lib/family-data";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "Family — Family COO" }] }),
  component: FamilyPage,
});

function FamilyPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="People"
        title="The household."
        subtitle="Parents, kids, nanny, grandparents — each with permissions."
      />

      <section className="px-6 mb-8">
        <div className="space-y-2">
          {family.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4">
              <span className={`grid size-11 place-items-center rounded-full text-sm font-medium ${p.color}`}>
                {p.initials}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.detail}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {p.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6">
        <SectionLabel>Family memory</SectionLabel>
        <Card>
          <ul className="divide-y divide-hairline">
            {memory.map((m) => (
              <li key={m.label} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </p>
                <p className="text-sm text-right">{m.value}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
