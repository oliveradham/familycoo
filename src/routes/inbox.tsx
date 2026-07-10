import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { inbox, family, type InboxItem, type InboxLane } from "@/lib/family-data";
import { useMemo, useState } from "react";
import { Check, HelpCircle, Info } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Family Inbox — Family COO" }] }),
  component: InboxPage,
});

const LANES: InboxLane[] = [
  "Needs Signature",
  "Needs Payment",
  "Needs Response",
  "Needs Scheduling",
  "Waiting on Others",
  "Upcoming Travel",
  "Renewals",
  "Low Priority",
];

function InboxPage() {
  const [active, setActive] = useState<InboxLane | "All">("All");

  const grouped = useMemo(() => {
    const map: Record<string, InboxItem[]> = {};
    for (const item of inbox) {
      (map[item.lane] ||= []).push(item);
    }
    return map;
  }, []);

  const visibleLanes = active === "All" ? LANES : [active];

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="One inbox for the family"
        title="Sorted, so you don't have to."
        subtitle="Every actionable message from schools, sports, travel, bills, and medical — organized by what it needs from you."
      />

      <section className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-hairline bg-surface p-2 text-center">
          <Stat n="1,240" l="Scanned this month" />
          <Stat n={String(inbox.length)} l="Sorted for you" />
          <Stat n="1" l="Needs your eye" />
        </div>
      </section>

      <section className="px-6 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip label="All" active={active === "All"} onClick={() => setActive("All")} count={inbox.length} />
          {LANES.map((l) => (
            <FilterChip
              key={l}
              label={l}
              active={active === l}
              onClick={() => setActive(l)}
              count={(grouped[l] ?? []).length}
            />
          ))}
        </div>
      </section>

      <section className="px-6 space-y-8 pb-10">
        {visibleLanes.map((lane) => {
          const items = grouped[lane] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={lane}>
              <SectionLabel>{lane}</SectionLabel>
              <div className="space-y-2">
                {items.map((m) => (
                  <InboxCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="py-2">
      <p className="font-serif text-2xl italic leading-none">{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "border border-hairline bg-surface text-muted-foreground"
      }`}
    >
      {label}
      <span className={`ml-1.5 ${active ? "opacity-60" : "opacity-50"}`}>{count}</span>
    </button>
  );
}

function InboxCard({ m }: { m: InboxItem }) {
  const [assignee, setAssignee] = useState(m.assigned);
  const [showWhy, setShowWhy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const p = family.find((f) => f.id === assignee);
  const confidence: "high" | "medium" | "low" =
    m.confidence >= 0.9 ? "high" : m.confidence >= 0.75 ? "medium" : "low";
  const confidenceLabel =
    confidence === "high"
      ? "I can handle this"
      : confidence === "medium"
        ? "Suggested"
        : "Please confirm";
  const dot =
    confidence === "high"
      ? "bg-emerald-500"
      : confidence === "medium"
        ? "bg-amber-500"
        : "bg-zinc-400";

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {m.from} · {m.time}
          </p>
          <p className="mt-0.5 font-serif text-lg italic leading-tight">{m.subject}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">{m.preview}</p>
        </div>
        <span className="rounded-full border border-hairline px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {m.category}
        </span>
      </div>

      {m.extracted && (
        <div className="mb-3 divide-y divide-hairline rounded-2xl bg-secondary/40 px-3">
          {m.extracted.map((x) => (
            <div key={x.label} className="flex items-baseline justify-between gap-4 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {x.label}
              </p>
              <p className="text-[13px] text-right">{x.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Belongs to
        </span>
        <div className="flex gap-1">
          {family
            .filter((f) => f.role !== "nanny")
            .map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setAssignee(f.id);
                  setConfirmed(true);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] ${
                  assignee === f.id ? f.color : "border border-hairline text-muted-foreground"
                }`}
              >
                <span className="grid size-4 place-items-center rounded-full bg-black/10 text-[8px]">
                  {f.initials}
                </span>
                {f.name.split(" ")[0]}
              </button>
            ))}
        </div>
        <button
          onClick={() => setShowWhy((s) => !s)}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-4"
        >
          <HelpCircle className="size-3" /> Why?
        </button>
      </div>

      {showWhy && (
        <p className="mt-3 flex gap-2 rounded-xl border border-dashed border-hairline p-3 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {m.reason}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={`size-1.5 rounded-full ${dot}`} />
          {confidenceLabel} · {Math.round(m.confidence * 100)}%
          {confirmed && " · learned"}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setConfirmed(true)}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-widest text-white"
          >
            <Check className="size-3" strokeWidth={2.5} /> Confirm
            {p ? ` · ${p.name.split(" ")[0]}` : ""}
          </button>
          <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
