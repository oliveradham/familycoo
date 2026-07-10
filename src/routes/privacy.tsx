import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { privacy } from "@/lib/family-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Center — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Privacy control center"
        title="You can see everything I see."
        subtitle="Connected accounts, active agents, recent actions, and one-tap pause. Privacy is a feature here, not a settings page."
      />

      <section className="px-6 mb-6">
        <SectionLabel>Connected sources</SectionLabel>
        <div className="space-y-2">
          {privacy.connected.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface p-4">
              <div>
                <p className="text-[14px] font-medium">{c.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.status}</p>
              </div>
              <button className="rounded-full border border-hairline px-3 py-1.5 text-[10px] uppercase tracking-widest">
                Pause
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Recent AI actions</SectionLabel>
        <Card>
          <ul className="space-y-2 text-[13px]">
            {privacy.recentActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-zinc-900" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-6 pb-8">
        <Card className="bg-zinc-900 text-white">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Data deletion</p>
          <p className="mt-1 font-serif text-[16px] italic leading-snug">{privacy.deletions}</p>
        </Card>
      </section>
    </AppShell>
  );
}
