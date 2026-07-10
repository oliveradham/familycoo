import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { checklists } from "@/lib/family-data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/checklists")({
  head: () => ({ meta: [{ title: "Checklists — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Bag & equipment checklists"
        title="Learned lists, adjusted for today."
        subtitle="Family COO adapts each list to weather, event length, and what your family typically forgets."
      />
      <section className="px-6 space-y-4">
        {checklists.map((c) => (
          <Card key={c.id}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.activity}</p>
            <p className="mt-1 font-serif text-2xl italic tracking-tight">{c.title}</p>
            <p className="mt-2 text-[12px] text-muted-foreground">{c.context}</p>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((it, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]">
                  <input type="checkbox" defaultChecked={it.learned} className="mt-1 size-4 accent-zinc-900" />
                  <div className="flex-1">
                    <span>{it.label}</span>
                    {it.reason && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-700">
                        <Sparkles className="size-3" /> Added — {it.reason}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
