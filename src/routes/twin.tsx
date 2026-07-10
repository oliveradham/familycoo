import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { twin } from "@/lib/family-data";

export const Route = createFileRoute("/twin")({
  head: () => ({ meta: [{ title: "Family Digital Twin — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Your family, structured"
        title="A private model of how you actually operate."
        subtitle="Editable. Transparent. Never shared. This is what lets me simulate before I act."
      />
      <section className="px-6 mb-6">
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Household</p>
          <p className="mt-1 font-serif text-[18px] italic">{twin.household}</p>
        </Card>
      </section>

      <Group title="Routines" items={twin.routines} />
      <Group title="Preferences" items={twin.preferences} />
      <Group title="Trusted circle" items={twin.trusted} />

      <section className="px-6 pb-8">
        <SectionLabel>Simulate before you commit</SectionLabel>
        <Card className="bg-zinc-900 text-white">
          <p className="font-serif text-[17px] italic leading-snug">{twin.simulate}</p>
          <p className="mt-3 text-[11px] uppercase tracking-widest text-white/60">
            Try more in Scenarios →
          </p>
        </Card>
      </section>
    </AppShell>
  );
}

function Group({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="px-6 mb-6">
      <SectionLabel>{title}</SectionLabel>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="rounded-2xl border border-hairline bg-surface p-4 text-[14px] leading-snug">
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}
