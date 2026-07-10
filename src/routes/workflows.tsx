import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { workflows } from "@/lib/family-data";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "AI Workflow Store — One-Tap Family Automations | Family COO" },
      {
        name: "description",
        content:
          "Install AI workflows like New School Year, Trip Prep, and Sports Season in one tap. Your family COO coordinates the specialists for you.",
      },
      { property: "og:title", content: "AI Workflow Store — Family COO" },
      {
        property: "og:description",
        content: "One-tap installs that coordinate your AI agents around the moments that usually cost a weekend of mental load.",
      },
      { property: "og:url", content: "https://familycoo.lovable.app/workflows" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/workflows" }],
  }),
  component: Page,
});

const tierLabel = { free: "Free", pro: "Pro", max: "Pro Max" } as const;

function Page() {
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="AI Workflow Store"
        title="Install a workflow. Life gets quieter."
        subtitle="Each workflow coordinates your agents around a moment that usually costs a weekend of mental load."
      />

      <section className="px-6 space-y-3 pb-6">
        {workflows.map((w) => {
          const on = !!installed[w.id];
          return (
            <Card key={w.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {tierLabel[w.tier]}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      · {w.installs}
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-[19px] italic leading-tight">{w.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">By {w.by}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">{w.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {w.price && (
                    <p className="font-serif text-[18px] italic leading-none">{w.price}</p>
                  )}
                  <button
                    onClick={() => setInstalled((s) => ({ ...s, [w.id]: !on }))}
                    className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                      on ? "bg-emerald-600 text-white" : "bg-zinc-900 text-white"
                    }`}
                  >
                    {on ? "Installed" : "Install"}
                  </button>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 rounded-2xl bg-secondary/40 p-3">
                {w.steps.map((s) => (
                  <li key={s.id} className="flex items-start gap-2 text-[13px] leading-snug">
                    <Check
                      className={`mt-1 size-3 shrink-0 ${
                        on ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                      strokeWidth={2}
                    />
                    <span className={on ? "" : "text-foreground/80"}>{s.text}</span>
                  </li>
                ))}
              </ul>

              {w.tier !== "free" && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3" strokeWidth={1.5} />
                  Included with {tierLabel[w.tier]}.
                </p>
              )}
            </Card>
          );
        })}
      </section>

      <section className="px-6 pb-10">
        <Link
          to="/plans"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-zinc-900 p-5 text-white"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/60">
              Unlock unlimited workflows
            </p>
            <p className="mt-1 font-serif text-xl italic">See plans</p>
          </div>
          <span className="text-lg opacity-70">→</span>
        </Link>
      </section>

      <SectionLabel>How workflows are chosen</SectionLabel>
      <section className="px-6 pb-10">
        <Card>
          <p className="text-[13px] leading-relaxed text-foreground/85">
            Every workflow is reviewed by our team and at least three families before it appears in
            the store. If a workflow makes life more complicated instead of simpler, it doesn't ship.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
