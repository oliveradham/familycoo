import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { responsibilities, family } from "@/lib/family-data";
import { AlertTriangle, UserPlus } from "lucide-react";

export const Route = createFileRoute("/responsibilities")({
  head: () => ({ meta: [{ title: "Who's Doing What — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Live responsibility map"
        title="Who's doing what?"
        subtitle="Every task has an owner — or a flag that says it doesn't yet."
      />
      <section className="px-6 space-y-2">
        {responsibilities.map((r) => {
          const owner = r.owner ? family.find((f) => f.id === r.owner) : null;
          const unassigned = r.status === "unassigned";
          return (
            <Card key={r.id} className={unassigned ? "border-amber-200 bg-amber-50/50" : ""}>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-[15px] leading-snug">{r.task}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {r.when}
                    {r.status === "waiting" && " · waiting"}
                  </p>
                </div>
                {unassigned ? (
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                    <UserPlus className="size-3" /> Assign
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`grid size-7 place-items-center rounded-full text-[11px] font-medium ${owner?.color}`}>
                      {owner?.initials}
                    </span>
                    <span className="text-xs text-muted-foreground">{owner?.name.split(" ")[0]}</span>
                  </div>
                )}
              </div>
              {unassigned && (
                <p className="mt-3 flex items-start gap-2 text-[12px] text-amber-800">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  No one has taken this yet. One tap to assign.
                </p>
              )}
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}
