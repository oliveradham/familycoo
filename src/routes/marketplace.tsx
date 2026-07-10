import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { marketCategories, marketItems, marketRecommendations } from "@/lib/family-data";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Family COO" }] }),
  component: Page,
});

function Page() {
  const [cat, setCat] = useState("All");
  const items = cat === "All" ? marketItems : marketItems.filter((i) => i.category === cat);

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family Marketplace"
        title="Curated tools for the household."
        subtitle="Templates, itineraries, and playbooks made by people who've done this before. Every item is reviewed before it appears here."
      />

      {/* Recommendations */}
      <section className="px-6 mb-8">
        <SectionLabel>Suggested for the Thompsons</SectionLabel>
        <div className="space-y-2">
          {marketRecommendations.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-hairline bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {r.trigger}
                  </p>
                  <p className="mt-1 font-serif text-[17px] italic leading-tight">{r.pack}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{r.why}</p>
                </div>
                <button className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {marketCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors ${
                cat === c
                  ? "bg-zinc-900 text-white"
                  : "border border-hairline bg-surface text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 space-y-3 pb-6">
        {items.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {m.category}
                  </span>
                  {m.badge && (
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[9px] uppercase tracking-widest text-foreground/80">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-serif text-[18px] italic leading-tight">{m.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{m.creator}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">{m.blurb}</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.format}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-serif text-[20px] italic leading-none">{m.price}</p>
                <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white">
                  Get
                </button>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Cross-link */}
      <section className="px-6 pb-10 space-y-2">
        <Link
          to="/workflows"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              AI Workflow Store
            </p>
            <p className="mt-1 font-serif text-xl italic">Install a workflow with one tap.</p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
        <Link
          to="/creators"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Creator Program
            </p>
            <p className="mt-1 font-serif text-xl italic">Sell your family expertise.</p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
      </section>
    </AppShell>
  );
}
