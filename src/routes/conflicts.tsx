import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { conflicts } from "@/lib/family-data";
import { AlertTriangle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/conflicts")({
  head: () => ({ meta: [{ title: "Conflicts — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family conflict detector"
        title="The five snags I found."
        subtitle="Conflicts beyond overlapping events — impossible logistics, hidden dependencies, quiet risks. Each one has a proposal."
      />
      <section className="px-6 space-y-3">
        {conflicts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="font-serif text-[18px] italic leading-tight">{c.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{c.detail}</p>
                <div className="mt-3 rounded-2xl bg-secondary/60 p-3">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-emerald-700">
                    <Sparkles className="size-3" /> Proposal
                  </p>
                  <p className="mt-1 text-[13px] leading-snug">{c.proposal}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                    Accept
                  </button>
                  <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    Adjust
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
