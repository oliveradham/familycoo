import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { healthPrep } from "@/lib/family-data";

export const Route = createFileRoute("/health-prep")({
  head: () => ({ meta: [{ title: "Health Prep — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Health preparation"
        title="Walk in with everything you need."
        subtitle="I don't diagnose. I organize the logistics — insurance card, forms, questions, and what to remember afterward."
      />
      <section className="px-6 space-y-4">
        {healthPrep.map((h) => (
          <Card key={h.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{h.who}</p>
            <p className="mt-1 font-serif text-[18px] italic leading-tight">{h.appointment}</p>

            <Block label="Bring" items={h.bring} />
            <Block label="Ask" items={h.ask} />
            {h.forms.length > 0 && <Block label="Forms" items={h.forms} />}
          </Card>
        ))}
      </section>
    </AppShell>
  );
}

function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <ul className="mt-1 space-y-1.5">
        {items.map((i, k) => (
          <li key={k} className="flex items-start gap-3 text-[14px]">
            <input type="checkbox" className="mt-1 size-4 accent-zinc-900" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
