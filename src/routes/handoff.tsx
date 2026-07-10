import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { handoffs, family } from "@/lib/family-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/handoff")({
  head: () => ({ meta: [{ title: "Handoff — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Smart caregiver handoff"
        title="Everything the next adult needs — nothing more."
        subtitle="Only the information they're authorized to see. The receiving caregiver taps 'Got it' to confirm."
      />
      <section className="px-6 space-y-4">
        {handoffs.map((h) => {
          const from = family.find((f) => f.id === h.from);
          const to = family.find((f) => f.id === h.to);
          return (
            <Card key={h.id}>
              <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span>{h.when}</span>
                <div className="h-px flex-1 bg-hairline" />
                <span>{from?.name.split(" ")[0]} → {to?.name.split(" ")[0]}</span>
              </div>
              <p className="font-serif text-2xl italic tracking-tight">{h.child}'s handoff</p>
              <ul className="mt-4 space-y-2.5">
                {h.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] leading-snug">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-white">
                <Check className="size-4" /> <span className="text-sm font-medium">Got it</span>
              </button>
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}
