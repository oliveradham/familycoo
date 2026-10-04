import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Cake, Gift, Plus, Trash2, X } from "lucide-react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { EmptyState, inputCls, primaryBtn } from "@/components/EmptyState";
import { useFamilyRows } from "@/lib/use-family-rows";

export const Route = createFileRoute("/birthdays")({
  head: () => ({
    meta: [
      { title: "Birthdays & Gifts — Family COO" },
      { name: "description", content: "Track birthdays, ages, gift ideas and purchased/wrapped status — with reminders two weeks and three days ahead." },
      { property: "og:title", content: "Birthdays & Gifts — Family COO" },
      { property: "og:description", content: "Never miss a birthday. Gift ideas and reminders for everyone you love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BirthdaysPage,
});

type B = { id: string; name: string; relation: string | null; birth_date: string; gift_ideas: string[]; gift_status: "idea" | "purchased" | "wrapped" };
const STATUSES = ["idea", "purchased", "wrapped"] as const;

function nextBirthday(birth: string) {
  const [y, m, d] = birth.split("-").map(Number);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let next = new Date(now.getFullYear(), m - 1, d);
  if (next < now) next = new Date(now.getFullYear() + 1, m - 1, d);
  const days = Math.round((next.getTime() - now.getTime()) / 86400000);
  return { next, days, turning: next.getFullYear() - y };
}

function BirthdaysPage() {
  const b = useFamilyRows<B>("birthdays");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [date, setDate] = useState("");
  const sorted = b.rows.map((r) => ({ ...r, ...nextBirthday(r.birth_date) })).sort((a, z) => a.days - z.days);
  const soon = sorted.filter((r) => r.days <= 14);

  return (
    <AppShell>
      <PageHeader back eyebrow="Family tools" title="Every birthday, remembered." subtitle="I'll remind you two weeks and three days before each one." />

      <section className="px-6 mb-6">
        <form className="space-y-2" onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !date) return;
          b.insert.mutate([{ name: name.trim(), relation: relation.trim() || null, birth_date: date }]);
          setName(""); setRelation(""); setDate("");
        }}>
          <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Relation (e.g. Cousin)" value={relation} onChange={(e) => setRelation(e.target.value)} />
            <input type="date" aria-label="Birth date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className={`${primaryBtn} w-full`} disabled={!name.trim() || !date}>Add birthday</button>
        </form>
      </section>

      {soon.length > 0 && (
        <section className="px-6 mb-6">
          <Card className="flex items-start gap-3 p-5">
            <Bell className="mt-0.5 size-4 shrink-0" />
            <div className="text-[13px]">
              {soon.map((s) => (
                <p key={s.id}><span className="font-medium">{s.name}</span> turns {s.turning} {s.days === 0 ? "today" : `in ${s.days} day${s.days === 1 ? "" : "s"}`} · gift {s.gift_status}</p>
              ))}
            </div>
          </Card>
        </section>
      )}

      <section className="px-6 mb-6">
        <SectionLabel>Coming up</SectionLabel>
        {sorted.length === 0 && !b.isLoading ? (
          <EmptyState icon={Cake} title="Add your first birthday" description="Family, friends, teachers — add anyone and I'll keep track." />
        ) : (
          <ul className="space-y-3">{sorted.map((r) => <BirthdayCard key={r.id} r={r} b={b} />)}</ul>
        )}
      </section>
    </AppShell>
  );
}

function BirthdayCard({ r, b }: { r: B & { next: Date; days: number; turning: number }; b: ReturnType<typeof useFamilyRows<B>> }) {
  const [idea, setIdea] = useState("");
  return (
    <li>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-xl italic">{r.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {r.relation ? `${r.relation} · ` : ""}Turns {r.turning} on {r.next.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${r.days <= 3 ? "bg-red-100 text-red-700" : r.days <= 14 ? "bg-amber-100 text-amber-800" : "bg-secondary text-muted-foreground"}`}>
              {r.days === 0 ? "Today" : `${r.days}d`}
            </span>
            <button aria-label="Delete" onClick={() => b.remove.mutate(r.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => b.update.mutate({ id: r.id, patch: { gift_status: s } })}
              className={`flex-1 rounded-full py-1.5 text-[11px] uppercase tracking-widest ${r.gift_status === s ? "bg-primary text-primary-foreground" : "border border-hairline"}`}>
              {s}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Gift ideas</p>
        <ul className="mt-1 space-y-1">
          {r.gift_ideas.map((g, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <Gift className="size-3.5 text-muted-foreground" /> <span className="flex-1">{g}</span>
              <button aria-label="Remove idea" onClick={() => b.update.mutate({ id: r.id, patch: { gift_ideas: r.gift_ideas.filter((_, k) => k !== i) } })}><X className="size-3.5 text-muted-foreground" /></button>
            </li>
          ))}
        </ul>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!idea.trim()) return; b.update.mutate({ id: r.id, patch: { gift_ideas: [...r.gift_ideas, idea.trim()] } }); setIdea(""); }}>
          <input className={inputCls} placeholder="Add a gift idea" value={idea} onChange={(e) => setIdea(e.target.value)} />
          <button aria-label="Add idea" className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline"><Plus className="size-4" /></button>
        </form>
      </Card>
    </li>
  );
}
