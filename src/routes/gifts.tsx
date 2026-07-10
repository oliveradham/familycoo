import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { gifts } from "@/lib/family-data";

export const Route = createFileRoute("/gifts")({
  head: () => ({ meta: [{ title: "Gifts — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Gift & birthday intelligence"
        title="Never repeat a gift. Never miss a thank-you."
        subtitle="When an invitation arrives, I add the event, suggest a gift the recipient will actually like, and remind you the day before."
      />
      <section className="px-6 space-y-4">
        {gifts.map((g) => (
          <Card key={g.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.when}</p>
            <p className="mt-1 font-serif text-[20px] italic leading-tight">{g.event}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">For {g.for}</p>

            <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Ideas</p>
            <ul className="mt-1 space-y-1">
              {g.ideas.map((i, k) => (
                <li key={k} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-500" />
                  {i}
                </li>
              ))}
            </ul>

            {g.pastGifts.length > 0 && (
              <p className="mt-3 text-[11px] text-muted-foreground italic">
                Previously given: {g.pastGifts.join(" · ")}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-secondary/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {g.status}
              </span>
              <button className="text-[11px] uppercase tracking-widest text-zinc-900 underline underline-offset-4">
                Pick & schedule
              </button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
