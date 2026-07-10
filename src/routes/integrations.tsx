import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { integrations } from "@/lib/family-data";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Ambient signals"
        title="The house, the car, the family — quietly aware."
        subtitle="Smart home, vehicle, wearables, and location — used only where they meaningfully reduce work. Never surveillance."
      />
      <Block title="Smart home" items={integrations.smartHome} />
      <Block title="Vehicle" items={integrations.vehicle} />
      <Block title="Health & wearables" items={integrations.wearables} />
      <Block title="Location · with permission" items={integrations.location} />

      <section className="px-6 pb-8">
        <Card className="bg-zinc-900 text-white">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Principle</p>
          <p className="mt-1 font-serif text-lg italic leading-snug">
            Never unrestricted access. Every signal is scoped, revocable, and visible in your Privacy Center.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}

function Block({ title, items }: { title: string; items: { id: string; label: string; state: string }[] }) {
  return (
    <section className="px-6 mb-6">
      <SectionLabel>{title}</SectionLabel>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="rounded-2xl border border-hairline bg-surface p-4">
            <p className="text-[13px] font-medium">{i.label}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{i.state}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
