import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { returns } from "@/lib/family-data";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — Family COO" }] }),
  component: Page,
});

const options = ["Keep", "Return", "Exchange", "Waiting for refund"];

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Return & refund tracker"
        title="Nothing slips past the return window."
        subtitle="Extracted from your receipts and shipping emails. One tap to keep, return, or track a refund."
      />
      <section className="px-6 space-y-2">
        {returns.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[15px] font-medium leading-snug">{r.item}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {r.retailer} · closes in {r.deadline}
                </p>
              </div>
              <span className="rounded-full bg-secondary/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {r.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {options.map((o) => (
                <button
                  key={o}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-widest ${
                    o === r.status
                      ? "bg-zinc-900 text-white"
                      : "border border-hairline text-muted-foreground"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
