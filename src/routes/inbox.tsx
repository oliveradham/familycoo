import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { listInbox, createInboxItem, setInboxStatus } from "@/lib/inbox.functions";
import { LANES } from "@/lib/inbox-lanes";
import { useAuth } from "@/lib/auth-context";
import { Check, Plus } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Family Inbox — Family COO" }] }),
  component: InboxPage,
});

const LANE_LABELS: Record<string, string> = {
  needs_signature: "Needs Signature",
  needs_payment: "Needs Payment",
  needs_response: "Needs Response",
  needs_scheduling: "Needs Scheduling",
  waiting: "Waiting on Others",
  upcoming_travel: "Upcoming Travel",
  renewals: "Renewals",
  fyi: "FYI",
};

function InboxPage() {
  const list = useServerFn(listInbox);
  const create = useServerFn(createInboxItem);
  const setStatus = useServerFn(setInboxStatus);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => list({}),
    enabled: !authLoading && Boolean(session),
  });

  const inv = () => qc.invalidateQueries({ queryKey: ["inbox"] });
  const addMut = useMutation({
    mutationFn: (v: { subject: string; lane: any }) => create({ data: v }),
    onSuccess: inv,
  });
  const doneMut = useMutation({
    mutationFn: (id: string) => setStatus({ data: { id, status: "done" as const } }),
    onSuccess: inv,
  });

  const open = useMemo(() => (items as any[]).filter((i) => i.status !== "done"), [items]);
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const i of open) (map[i.lane] ||= []).push(i);
    return map;
  }, [open]);

  const [active, setActive] = useState<string>("All");
  const [subject, setSubject] = useState("");
  const [lane, setLane] = useState<(typeof LANES)[number]>("fyi");

  const visibleLanes = active === "All" ? [...LANES] : [active];

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="One inbox for the family"
        title="Sorted, so you don't have to."
        subtitle="Every actionable message — organized by what it needs from you."
      />

      <section className="px-6 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject.trim()) return;
            addMut.mutate({ subject: subject.trim(), lane });
            setSubject("");
          }}
          className="rounded-2xl border border-hairline bg-surface p-2 flex gap-2 items-center"
        >
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Add an item to sort…"
            aria-label="New inbox item"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value as any)}
            aria-label="Lane"
            className="rounded-lg border border-hairline bg-background px-2 py-1.5 text-xs"
          >
            {LANES.map((l) => (
              <option key={l} value={l}>{LANE_LABELS[l]}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!subject.trim() || addMut.isPending}
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Add
          </button>
        </form>
      </section>

      <section className="px-6 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip label="All" active={active === "All"} onClick={() => setActive("All")} count={open.length} />
          {LANES.map((l) => (
            <Chip
              key={l}
              label={LANE_LABELS[l]}
              active={active === l}
              onClick={() => setActive(l)}
              count={(grouped[l] ?? []).length}
            />
          ))}
        </div>
      </section>

      {isLoading && <p className="px-6 text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && open.length === 0 && (
        <p className="px-6 text-sm text-muted-foreground">Inbox zero. Enjoy the calm.</p>
      )}

      {visibleLanes.map((l) => {
        const bucket = grouped[l] ?? [];
        if (bucket.length === 0) return null;
        return (
          <section key={l} className="px-6 mb-8">
            <SectionLabel>{LANE_LABELS[l]} · {bucket.length}</SectionLabel>
            <div className="space-y-2">
              {bucket.map((i) => (
                <div key={i.id} className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-4">
                  <button
                    onClick={() => doneMut.mutate(i.id)}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline hover:bg-secondary"
                    aria-label="Mark done"
                  >
                    <Check className="size-3 opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.subject}</p>
                    {i.summary && <p className="mt-0.5 text-xs text-muted-foreground">{i.summary}</p>}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {i.sender && <span>{i.sender}</span>}
                      {i.due_at && (
                        <>
                          <span>·</span>
                          <span>Due {new Date(i.due_at).toLocaleDateString()}</span>
                        </>
                      )}
                      {i.amount != null && (
                        <>
                          <span>·</span>
                          <span>${Number(i.amount).toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </AppShell>
  );
}

function Chip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-hairline bg-surface text-foreground"
      }`}
    >
      {label} <span className="opacity-60">· {count}</span>
    </button>
  );
}
