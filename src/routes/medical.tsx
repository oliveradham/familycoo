import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { medical } from "@/lib/family-data";

export const Route = createFileRoute("/medical")({
  head: () => ({ meta: [{ title: "Medical Hub — Family COO" }] }),
  component: MedicalPage,
});

const tone: Record<string, string> = {
  attention: "bg-zinc-900 text-white",
  scheduled: "bg-secondary text-foreground",
  reference: "bg-transparent text-muted-foreground border border-hairline",
};

function MedicalPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Health"
        title="Medical, in one place."
        subtitle="Vaccinations, prescriptions, allergies, growth charts, insurance — for everyone."
      />

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {medical.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {m.who}
                  </p>
                  <p className="mt-0.5 text-sm">{m.detail}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${tone[m.status]}`}
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
