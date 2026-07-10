import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { listTasks, createTask, setTaskStatus, deleteTask } from "@/lib/tasks.functions";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Family COO" }] }),
  component: TasksPage,
});

function TasksPage() {
  const list = useServerFn(listTasks);
  const create = useServerFn(createTask);
  const setStatus = useServerFn(setTaskStatus);
  const remove = useServerFn(deleteTask);
  const qc = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => list({}),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const addMut = useMutation({
    mutationFn: (title: string) => create({ data: { title } }),
    onSuccess: invalidate,
  });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; status: "open" | "done" }) => setStatus({ data: v }),
    onSuccess: invalidate,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

  const [title, setTitle] = useState("");
  const open = tasks.filter((t: any) => t.status !== "done");
  const done = tasks.filter((t: any) => t.status === "done");

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Household"
        title="Tasks, delegated."
        subtitle="Everything the household owes itself, in one calm list."
      />

      <section className="px-6 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              addMut.mutate(title.trim());
              setTitle("");
            }
          }}
          className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface p-2"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            aria-label="New task"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!title.trim() || addMut.isPending}
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Add
          </button>
        </form>
      </section>

      {isLoading && <p className="px-6 text-sm text-muted-foreground">Loading…</p>}
      {error && (
        <p className="px-6 text-sm text-red-600">Couldn't load tasks. Please refresh.</p>
      )}

      <section className="px-6 mb-8">
        <SectionLabel>Open · {open.length}</SectionLabel>
        {open.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">Nothing on the list. Enjoy the calm.</p>
        ) : (
          <div className="space-y-2">
            {open.map((t: any) => (
              <div key={t.id} className="rounded-2xl border border-hairline bg-surface p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleMut.mutate({ id: t.id, status: "done" })}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline hover:bg-secondary"
                    aria-label="Complete"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.notes && <p className="mt-0.5 text-xs text-muted-foreground">{t.notes}</p>}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {t.category && <span className="uppercase tracking-widest">{t.category}</span>}
                      {t.due_at && (
                        <>
                          <span>·</span>
                          <span>Due {new Date(t.due_at).toLocaleDateString()}</span>
                        </>
                      )}
                      {t.priority === "high" && (
                        <>
                          <span>·</span>
                          <span className="text-red-600">High</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => delMut.mutate(t.id)}
                    aria-label="Delete"
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {done.length > 0 && (
        <section className="px-6">
          <SectionLabel>Completed</SectionLabel>
          <div className="space-y-2">
            {done.map((t: any) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-hairline bg-secondary/40 p-4 opacity-70"
              >
                <button
                  onClick={() => toggleMut.mutate({ id: t.id, status: "open" })}
                  className="grid size-5 place-items-center rounded-full bg-zinc-900 text-white"
                  aria-label="Reopen"
                >
                  <Check className="size-3" strokeWidth={2.5} />
                </button>
                <div className="flex-1">
                  <p className="text-sm line-through decoration-1">{t.title}</p>
                  {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                </div>
                <button
                  onClick={() => delMut.mutate(t.id)}
                  aria-label="Delete"
                  className="text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
