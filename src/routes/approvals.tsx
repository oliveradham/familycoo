import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import {
  listApprovals,
  approveAction,
  rejectApproval,
  undoApproval,
} from "@/lib/approvals.functions";
import { Check, Info, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Family COO" }] }),
  component: Page,
});

type Approval = Awaited<ReturnType<typeof listApprovals>>["items"][number];

function Page() {
  const list = useServerFn(listApprovals);
  const { data } = useQuery({ queryKey: ["approvals"], queryFn: () => list() });
  const [tab, setTab] = useState<"pending" | "executed" | "rejected">("pending");

  const items = data?.items ?? [];
  const filtered = useMemo(() => {
    if (tab === "pending") return items.filter((a) => a.status === "pending");
    if (tab === "executed") return items.filter((a) => a.status === "executed");
    return items.filter((a) => a.status === "rejected" || a.status === "failed");
  }, [items, tab]);

  const counts = useMemo(
    () => ({
      pending: items.filter((a) => a.status === "pending").length,
      executed: items.filter((a) => a.status === "executed").length,
      rejected: items.filter((a) => a.status === "rejected" || a.status === "failed").length,
    }),
    [items],
  );

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Ready for your approval"
        title="Here's exactly what will happen."
        subtitle="Nothing runs without your yes. Every action is reversible for 24 hours."
      />
      <div className="px-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-secondary/40 p-1 text-[11px] uppercase tracking-widest">
          {(["pending", "executed", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              {t} · {counts[t]}
            </button>
          ))}
        </div>
      </div>
      <section className="space-y-3 px-6 pb-8 pt-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-[13px] text-muted-foreground">
              {tab === "pending"
                ? "No pending approvals. Agents will draft actions here as they detect them."
                : `No ${tab} approvals yet.`}
            </p>
          </Card>
        ) : (
          filtered.map((a) => <ApprovalCard key={a.id} a={a} />)
        )}
      </section>
    </AppShell>
  );
}

function ApprovalCard({ a }: { a: Approval }) {
  const qc = useQueryClient();
  const approve = useServerFn(approveAction);
  const reject = useServerFn(rejectApproval);
  const undo = useServerFn(undoApproval);
  const [showWhy, setShowWhy] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["approvals"] });
  const approveMut = useMutation({
    mutationFn: () => approve({ data: { id: a.id } }),
    onSuccess: invalidate,
  });
  const rejectMut = useMutation({
    mutationFn: () => reject({ data: { id: a.id } }),
    onSuccess: invalidate,
  });
  const undoMut = useMutation({
    mutationFn: () => undo({ data: { id: a.id } }),
    onSuccess: invalidate,
  });

  const steps = Array.isArray(a.steps) ? (a.steps as string[]) : [];
  const canUndo =
    a.status === "executed" &&
    a.undo_expires_at &&
    new Date(a.undo_expires_at).getTime() > Date.now();

  return (
    <Card
      className={
        a.status === "executed"
          ? "border-emerald-200 bg-emerald-50/60"
          : a.status === "rejected" || a.status === "failed"
            ? "opacity-60"
            : ""
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {a.created_by_agent ? `Agent · ${a.created_by_agent}` : "Family COO will"}
        </p>
        {a.status !== "pending" && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {a.status}
          </span>
        )}
      </div>
      <p className="mt-1 font-serif text-[19px] italic leading-tight">{a.title}</p>

      {steps.length > 0 && (
        <ol className="mt-3 divide-y divide-hairline rounded-2xl bg-secondary/40 px-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 py-2.5 text-[13px]">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline text-[10px]">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}

      {a.why && (
        <>
          <button
            onClick={() => setShowWhy((s) => !s)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground underline underline-offset-4"
          >
            <Info className="size-3" /> Why?
          </button>
          {showWhy && (
            <p className="mt-2 rounded-xl border border-dashed border-hairline p-3 text-[12px] leading-relaxed text-muted-foreground">
              {a.why} · Reversible: {a.reversible ? "yes" : "no"}
            </p>
          )}
        </>
      )}

      {a.error && (
        <p className="mt-2 rounded-xl bg-red-50 p-2 text-[12px] text-red-700">Error: {a.error}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        {a.status === "pending" && (
          <>
            <button
              onClick={() => approveMut.mutate()}
              disabled={approveMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-white disabled:opacity-50"
            >
              <Check className="size-3" strokeWidth={2.5} />
              {approveMut.isPending ? "Running…" : "Approve"}
            </button>
            <button
              onClick={() => rejectMut.mutate()}
              disabled={rejectMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 text-[11px] uppercase tracking-widest"
            >
              <X className="size-3" /> Reject
            </button>
          </>
        )}
        {canUndo && (
          <button
            onClick={() => undoMut.mutate()}
            disabled={undoMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-2 text-[11px] uppercase tracking-widest text-emerald-800"
          >
            <RotateCcw className="size-3" /> {undoMut.isPending ? "Undoing…" : "Undo"}
          </button>
        )}
        {a.executed_at && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            Done · {new Date(a.executed_at).toLocaleString()}
          </span>
        )}
      </div>
    </Card>
  );
}
