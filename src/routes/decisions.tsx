import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { decisions } from "@/lib/family-data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/decisions")({
  head: () => ({ meta: [{ title: "Decisions — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family decision assistant"
        title="The tradeoffs, clearly."
        subtitle="I'll never make a major decision without you. But I can lay out the options in one calm view."
      />
      <section className="px-6 space-y-4">
        {decisions.map((d) => (
          <Card key={d.id}>
            <p className="font-serif text-[20px] italic leading-tight">{d.question}</p>
            <div className="mt-4 space-y-2">
              {d.options.map((o, i) => (
                <div key={i} className="rounded-2xl border border-hairline p-3">
                  <p className="text-[14px] font-medium">{o.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{o.tradeoff}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-zinc-900 p-4 text-white">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 opacity-70" />
              <div className="flex-1 text-[13px] leading-snug">{d.recommendation}</div>
              <button className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-zinc-900">
                Go with this
              </button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
