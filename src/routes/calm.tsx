import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { calm } from "@/lib/family-data";

export const Route = createFileRoute("/calm")({
  head: () => ({ meta: [{ title: "Calm Mode — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Calm mode"
        title="Right now."
        subtitle="Only what needs to happen. Everything else is safely held for tomorrow."
      />

      <section className="px-6 mb-6">
        <Card>
          <ul className="space-y-4">
            {calm.now.map((n) => (
              <li key={n.id} className="flex items-start gap-4">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-zinc-900" />
                <div className="flex-1">
                  <p className="font-serif text-[19px] italic leading-snug">{n.text}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{n.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-6 mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Later tonight</p>
        <Card><ul className="space-y-1.5 text-[13px] text-muted-foreground">{calm.laterTonight.map((t, i) => <li key={i}>· {t}</li>)}</ul></Card>
      </section>

      <section className="px-6 mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tomorrow</p>
        <Card><ul className="space-y-1.5 text-[13px] text-muted-foreground">{calm.tomorrow.map((t, i) => <li key={i}>· {t}</li>)}</ul></Card>
      </section>

      <section className="px-6">
        <p className="text-center text-[13px] italic text-muted-foreground">{calm.everythingElseNote}</p>
      </section>
    </AppShell>
  );
}
