import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { waitingOn } from "@/lib/family-data";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/waiting")({
  head: () => ({ meta: [{ title: "Waiting on — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Waiting on someone"
        title="Nothing important is disappearing."
        subtitle="I'm tracking every request you've sent. If someone goes quiet, I'll suggest a gentle follow-up."
      />
      <section className="px-6 space-y-3">
        {waitingOn.map((w) => (
          <Card key={w.id}>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[15px] font-medium leading-snug">{w.task}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {w.person} · sent {w.sent}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                    {w.suggest}
                  </button>
                  <button className="text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4">
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
