import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { agents, agentWorkflowExample, capabilityLevels } from "@/lib/family-data";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "AI Agents — Family COO" },
      { name: "description", content: "Ten specialist AI agents for school, sports, travel, health, and household — one coordinated operations team quietly working for your family." },
      { property: "og:title", content: "AI Agents — Family COO" },
      { property: "og:description", content: "Ten specialist agents. One family. A coordinated AI operations team, not ten disconnected bots." },
      { property: "og:url", content: "https://familycoo.lovable.app/agents" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/agents" }],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Your quiet operations team"
        title="Ten agents. One family."
        subtitle="Each agent understands its area and shares what it learns with the others. You experience one workflow — not ten bots."
      />

      <section className="px-6 mb-8">
        <SectionLabel>Five levels of help</SectionLabel>
        <Card>
          <ol className="space-y-3">
            {capabilityLevels.map((l, i) => (
              <li key={l.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium">
                    {l.level} <span className="text-muted-foreground font-normal">— {l.title}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{l.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-hairline pt-3 text-[11px] text-muted-foreground">
            You stay in control of anything meaningful. Nothing sensitive happens without your yes.
          </p>
        </Card>
      </section>

      <section className="px-6 mb-8">
        <SectionLabel>Active agents</SectionLabel>
        <div className="grid grid-cols-1 gap-2">
          {agents.map((a) => (
            <div key={a.id} className="rounded-2xl border border-hairline bg-surface p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-[17px] italic leading-tight">{a.name}</p>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${
                    a.status === "active" ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      a.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {a.status}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-foreground/80">{a.summary}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{a.lastAction}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mb-10">
        <SectionLabel>One workflow, many agents</SectionLabel>
        <Card>
          <p className="font-serif text-[18px] italic leading-tight">{agentWorkflowExample.title}</p>
          <ol className="mt-3 space-y-2.5">
            {agentWorkflowExample.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline text-[10px]">
                  {i + 1}
                </span>
                <p className="text-[13px] leading-snug">
                  <span className="uppercase tracking-widest text-[10px] text-muted-foreground mr-1.5">
                    {s.agent}
                  </span>
                  {s.did}
                </p>
              </li>
            ))}
          </ol>
          <Link
            to="/approvals"
            className="mt-4 block rounded-full bg-zinc-900 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-white"
          >
            Review before I act
          </Link>
        </Card>
      </section>
    </AppShell>
  );
}
