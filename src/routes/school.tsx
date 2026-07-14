import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import {
  listSchoolItems,
  createSchoolItem,
  setSchoolItemStatus,
  deleteSchoolItem,
} from "@/lib/school.functions";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/school")({
  head: () => ({ meta: [{ title: "School Hub — Family COO" }] }),
  component: SchoolPage,
});

type Kind = "tuition" | "homework" | "event" | "email_summary" | "permission_slip" | "other";

const KIND_LABELS: Record<Kind, string> = {
  tuition: "Tuition",
  homework: "Homework",
  event: "Event",
  email_summary: "Email",
  permission_slip: "Permission",
  other: "Other",
};

function SchoolPage() {
  const list = useServerFn(listSchoolItems);
  const create = useServerFn(createSchoolItem);
  const setStatus = useServerFn(setSchoolItemStatus);
  const remove = useServerFn(deleteSchoolItem);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["school_items"],
    queryFn: () => list({}),
    enabled: !authLoading && Boolean(session),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["school_items"] });
  const addMut = useMutation({
    mutationFn: (v: { title: string; kind: Kind; amount_cents?: number | null; due_at?: string | null }) =>
      create({ data: v }),
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
  const [kind, setKind] = useState<Kind>("event");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");

  const active = items.filter((i: any) => i.status !== "done" && i.status !== "archived");
  const tuitionTotal = active
    .filter((i: any) => i.kind === "tuition")
    .reduce((s: number, i: any) => s + (i.amount_cents ?? 0), 0);
  const homeworkCount = active.filter((i: any) => i.kind === "homework").length;
  const eventsCount = active.filter((i: any) => i.kind === "event").length;

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="School hub"
        title="School, translated."
        subtitle="Tuition, homework, permission slips, events — all in one place."
      />

      <section className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tuition</p>
            <p className="mt-2 font-serif text-2xl italic">
              ${(tuitionTotal / 100).toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Outstanding</p>
          </Card>
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Homework</p>
            <p className="mt-2 font-serif text-2xl italic">{homeworkCount}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Open</p>
          </Card>
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Events</p>
            <p className="mt-2 font-serif text-2xl italic">{eventsCount}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Upcoming</p>
          </Card>
        </div>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Add item</SectionLabel>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addMut.mutate({
              title: title.trim(),
              kind,
              amount_cents: amount ? Math.round(parseFloat(amount) * 100) : null,
              due_at: due ? new Date(due).toISOString() : null,
            });
            setTitle("");
            setAmount("");
            setDue("");
          }}
          className="space-y-2 rounded-2xl border border-hairline bg-surface p-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fall tuition, Book report, Spirit day"
            className="w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="rounded-xl border border-hairline bg-transparent px-3 py-2 text-xs"
            >
              {Object.entries(KIND_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="rounded-xl border border-hairline bg-transparent px-3 py-2 text-xs"
            />
            {kind === "tuition" && (
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-28 rounded-xl border border-hairline bg-transparent px-3 py-2 text-xs"
              />
            )}
            <button
              type="submit"
              disabled={!title.trim() || addMut.isPending}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>
        </form>
      </section>

      {isLoading && <p className="px-6 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="px-6 text-sm text-red-600">Couldn't load school items.</p>}

      <section className="px-6 mb-8">
        <SectionLabel>Open · {active.length}</SectionLabel>
        {active.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">Nothing due. All clear.</p>
        ) : (
          <div className="space-y-2">
            {active.map((i: any) => (
              <Card key={i.id} className="!p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleMut.mutate({ id: i.id, status: "done" })}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline hover:bg-secondary"
                    aria-label="Mark done"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {KIND_LABELS[i.kind as Kind] ?? i.kind}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{i.title}</p>
                    {i.detail && <p className="mt-0.5 text-xs text-muted-foreground">{i.detail}</p>}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {i.due_at && <span>Due {new Date(i.due_at).toLocaleDateString()}</span>}
                      {i.amount_cents ? (
                        <>
                          {i.due_at && <span>·</span>}
                          <span>${(i.amount_cents / 100).toLocaleString()}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={() => delMut.mutate(i.id)}
                    aria-label="Delete"
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {items.some((i: any) => i.status === "done") && (
        <section className="px-6">
          <SectionLabel>Completed</SectionLabel>
          <div className="space-y-2">
            {items
              .filter((i: any) => i.status === "done")
              .map((i: any) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-2xl border border-hairline bg-secondary/40 p-4 opacity-70"
                >
                  <button
                    onClick={() => toggleMut.mutate({ id: i.id, status: "open" })}
                    className="grid size-5 place-items-center rounded-full bg-zinc-900 text-white"
                    aria-label="Reopen"
                  >
                    <Check className="size-3" strokeWidth={2.5} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm line-through decoration-1">{i.title}</p>
                  </div>
                  <button
                    onClick={() => delMut.mutate(i.id)}
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
