import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { followUps } from "@/lib/family-data";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/followups")({
  head: () => ({ meta: [{ title: "Follow-ups — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Autonomous follow-up"
        title="Nothing quietly slips."
        subtitle="I know when a request was sent, what a reasonable reply window is, and when it's time for a gentle nudge — drafted, waiting on your yes."
      />
      <section className="px-6 space-y-3 pb-8">
        {followUps.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[15px] font-medium leading-snug">{f.about}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {f.who} · sent {f.sent} · {f.window}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                    {f.suggest.startsWith("Prepared") ? "Send follow-up" : "Hold"}
                  </button>
                  <span className="text-[11px] text-muted-foreground">{f.suggest}</span>
                  <button className="ml-auto text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4">
                    Mark resolved
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
