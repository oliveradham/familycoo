import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { subscriptions, rewards } from "@/lib/family-data";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions & Rewards — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Money in the background"
        title="What you're paying for. What you've already earned."
        subtitle="Renewals, duplicates, unused memberships — plus miles, points, and credits before they expire."
      />

      <section className="px-6 mb-8">
        <SectionLabel>Subscriptions</SectionLabel>
        <div className="space-y-2">
          {subscriptions.map((s) => (
            <Card key={s.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-[16px] italic">{s.label}</p>
                <p className="text-[12px] text-muted-foreground">{s.cost}</p>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Renews {s.renews} · {s.note}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <SectionLabel>Rewards & credits</SectionLabel>
        <div className="space-y-2">
          {rewards.map((r) => (
            <div key={r.id} className="rounded-2xl border border-hairline bg-surface p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-[16px] italic">{r.label}</p>
                <p className="text-[12px] text-muted-foreground">{r.balance}</p>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
