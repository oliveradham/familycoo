import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Check, Trash2 } from "lucide-react";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { EmptyState, inputCls, primaryBtn } from "@/components/EmptyState";
import { addDays, isoDate, useFamilyRows } from "@/lib/use-family-rows";

export const Route = createFileRoute("/homework")({
  head: () => ({
    meta: [
      { title: "Homework Tracker — Family COO" },
      { name: "description", content: "Per-child homework list with subjects, due dates, and checkmarks. Overdue and due-tomorrow items stand out." },
      { property: "og:title", content: "Homework Tracker — Family COO" },
      { property: "og:description", content: "Simple per-child homework tracking for busy families." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeworkPage,
});

type Member = { id: string; name: string; role: string };
type Hw = { id: string; member_id: string | null; title: string; subject: string; due_date: string; done: boolean };
const SUBJECTS = ["Math", "Reading", "Writing", "Science", "Spelling", "Social Studies", "Art", "Other"];

function HomeworkPage() {
  const members = useFamilyRows<Member>("family_members");
  const hw = useFamilyRows<Hw>("homework");
  const kids = members.rows.filter((m) => m.role === "child");
  const [childId, setChildId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Math");
  const [due, setDue] = useState(() => isoDate(addDays(new Date(), 1)));
  const today = isoDate(new Date());
  const tomorrow = isoDate(addDays(new Date(), 1));
  const selected = childId || kids[0]?.id || "";

  if (!members.isLoading && kids.length === 0) {
    return (
      <AppShell>
        <PageHeader back eyebrow="Family tools" title="Homework, handled." />
        <section className="px-6">
          <EmptyState icon={BookOpen} title="Add your first child" description="Homework is tracked per child. Add your kids on the Family page to get started."
            action={<Link to="/family" className={primaryBtn}>Go to Family</Link>} />
        </section>
      </AppShell>
    );
  }

  const list = hw.rows.filter((h) => h.member_id === selected);
  const open = list.filter((h) => !h.done);
  const done = list.filter((h) => h.done);

  return (
    <AppShell>
      <PageHeader back eyebrow="Family tools" title="Homework, handled." subtitle="One list per child. Overdue in red, due tomorrow in amber." />
      <section className="px-6 mb-5 flex gap-2 overflow-x-auto">
        {kids.map((k) => {
          const count = hw.rows.filter((h) => h.member_id === k.id && !h.done).length;
          return (
            <button key={k.id} onClick={() => setChildId(k.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm ${k.id === selected ? "bg-primary text-primary-foreground" : "border border-hairline bg-surface"}`}>
              {k.name}{count ? ` · ${count}` : ""}
            </button>
          );
        })}
      </section>

      <section className="px-6 mb-6">
        <form className="space-y-2" onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !selected) return;
          hw.insert.mutate([{ member_id: selected, title: title.trim(), subject, due_date: due }]);
          setTitle("");
        }}>
          <input className={inputCls} placeholder="Assignment (e.g. Worksheet p. 12)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <button className={`${primaryBtn} w-full`} disabled={!title.trim()}>Add assignment</button>
        </form>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>To do</SectionLabel>
        {open.length === 0 && !hw.isLoading ? (
          <EmptyState icon={BookOpen} title="Add your first assignment" description="Nothing due. Enjoy the free evening." />
        ) : (
          <ul className="space-y-2">{open.map((h) => <Row key={h.id} h={h} today={today} tomorrow={tomorrow} hw={hw} />)}</ul>
        )}
      </section>
      {done.length > 0 && (
        <section className="px-6 mb-6">
          <SectionLabel>Done</SectionLabel>
          <ul className="space-y-2">{done.map((h) => <Row key={h.id} h={h} today={today} tomorrow={tomorrow} hw={hw} />)}</ul>
        </section>
      )}
    </AppShell>
  );
}

function Row({ h, today, tomorrow, hw }: { h: Hw; today: string; tomorrow: string; hw: ReturnType<typeof useFamilyRows<Hw>> }) {
  const overdue = !h.done && h.due_date < today;
  const dueTomorrow = !h.done && h.due_date === tomorrow;
  const dueToday = !h.done && h.due_date === today;
  const tone = overdue ? "border-red-300 bg-red-50 dark:bg-red-950/30" : dueTomorrow || dueToday ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : "border-hairline bg-surface";
  const label = overdue ? "Overdue" : dueToday ? "Due today" : dueTomorrow ? "Due tomorrow" : new Date(h.due_date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return (
    <li className={`flex items-center gap-3 rounded-2xl border p-4 ${tone} ${h.done ? "opacity-60" : ""}`}>
      <button aria-label={h.done ? "Mark not done" : "Mark done"} onClick={() => hw.update.mutate({ id: h.id, patch: { done: !h.done } })}
        className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${h.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-foreground/30"}`}>
        {h.done && <Check className="size-4" strokeWidth={3} />}
      </button>
      <div className="flex-1">
        <p className={`text-sm font-medium ${h.done ? "line-through" : ""}`}>{h.title}</p>
        <p className="text-[12px] text-muted-foreground">{h.subject} · <span className={overdue ? "font-semibold text-red-600" : dueTomorrow ? "font-semibold text-amber-700" : ""}>{label}</span></p>
      </div>
      <button aria-label="Delete" onClick={() => hw.remove.mutate(h.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
    </li>
  );
}
