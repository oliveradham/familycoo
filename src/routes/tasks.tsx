import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { tasks, family } from "@/lib/family-data";
import { useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Family COO" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [list, setList] = useState(tasks);
  const open = list.filter((t) => !t.done);
  const done = list.filter((t) => t.done);

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Household"
        title="Tasks, delegated."
        subtitle="I've assigned each task to whoever has the bandwidth. Tap a name to reassign."
      />

      <section className="px-6 mb-8">
        <SectionLabel>Open · {open.length}</SectionLabel>
        <div className="space-y-2">
          {open.map((t) => {
            const p = family.find((f) => f.id === t.assignee);
            return (
              <div key={t.id} className="rounded-2xl border border-hairline bg-surface p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setList((ls) => ls.map((x) => (x.id === t.id ? { ...x, done: true } : x)))}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline hover:bg-secondary"
                    aria-label="Complete"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t.category}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${p?.color ?? "bg-secondary"}`}
                      >
                        <span className="grid size-3.5 place-items-center rounded-full bg-black/10 text-[8px]">
                          {p?.initials}
                        </span>
                        {p?.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {done.length > 0 && (
        <section className="px-6">
          <SectionLabel>Completed</SectionLabel>
          <div className="space-y-2">
            {done.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-hairline bg-secondary/40 p-4 opacity-70"
              >
                <span className="grid size-5 place-items-center rounded-full bg-zinc-900 text-white">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                <div className="flex-1">
                  <p className="text-sm line-through decoration-1">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
