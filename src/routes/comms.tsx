import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { commsIntake } from "@/lib/family-data";

export const Route = createFileRoute("/comms")({
  head: () => ({
    meta: [
      { title: "Communication Hub — Family COO" },
      { name: "description", content: "Texts, emails, flyers, and coach notes turned into structured events, checklists, and tasks — you confirm, the family AI handles the rest." },
      { property: "og:title", content: "Communication Hub — Family COO" },
      { property: "og:description", content: "Messy family messages, structured meaning. Parsed into actions you can approve in seconds." },
      { property: "og:url", content: "https://familycoo.lovable.app/comms" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/comms" }],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Communication hub"
        title="Messy messages, structured meaning."
        subtitle="Texts, emails, flyers, coach notes — turned into events, checklists, and tasks. You confirm; I do the rest."
      />
      <section className="px-6 space-y-3 pb-8">
        {commsIntake.map((c) => (
          <Card key={c.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.source}</p>
            <p className="mt-2 rounded-xl border border-dashed border-hairline bg-secondary/40 p-3 font-serif text-[15px] italic leading-snug">
              &ldquo;{c.raw}&rdquo;
            </p>
            <div className="mt-3 divide-y divide-hairline rounded-2xl bg-secondary/30 px-3">
              {c.parsed.map((p) => (
                <div key={p.label} className="flex items-baseline justify-between gap-4 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</p>
                  <p className="text-[13px] text-right">{p.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px]">{c.ask}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                Yes, do it
              </button>
              <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest">
                Edit
              </button>
              <button className="ml-auto text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4">
                Ignore
              </button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
