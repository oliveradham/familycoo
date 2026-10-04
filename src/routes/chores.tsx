import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { EmptyState, inputCls, primaryBtn } from "@/components/EmptyState";
import { addDays, useFamilyRows } from "@/lib/use-family-rows";

export const Route = createFileRoute("/chores")({
  head: () => ({
    meta: [
      { title: "Kids Chore Chart — Family COO" },
      { name: "description", content: "Assign chores to each child, earn stars, and approve completed chores. Weekly star totals per kid." },
      { property: "og:title", content: "Kids Chore Chart — Family COO" },
      { property: "og:description", content: "A colorful, parent-approved chore chart with star rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChoresPage,
});

type Member = { id: string; name: string; role: string };
type Chore = { id: string; member_id: string; title: string; stars: number };
type Done = { id: string; chore_id: string; member_id: string; stars: number; status: "pending" | "approved" | "rejected"; completed_at: string };

const COLORS = [
  "from-rose-400 to-orange-300",
  "from-sky-400 to-cyan-300",
  "from-violet-400 to-fuchsia-300",
  "from-emerald-400 to-lime-300",
  "from-amber-400 to-yellow-300",
];

function weekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return addDays(d, -((d.getDay() + 6) % 7));
}

function ChoresPage() {
  const members = useFamilyRows<Member>("family_members");
  const chores = useFamilyRows<Chore>("chores");
  const done = useFamilyRows<Done>("chore_completions");
  const kids = members.rows.filter((m) => m.role === "child");
  const [kid, setKid] = useState("");
  const [title, setTitle] = useState("");
  const [stars, setStars] = useState(1);
  const ws = weekStart().getTime();
  const thisWeek = done.rows.filter((d) => new Date(d.completed_at).getTime() >= ws);
  const pending = done.rows.filter((d) => d.status === "pending");

  if (!members.isLoading && kids.length === 0) {
    return (
      <AppShell>
        <PageHeader back eyebrow="Family tools" title="Chores & stars." />
        <section className="px-6">
          <EmptyState icon={Star} title="Add your first child" description="Chores are assigned per child. Add your kids on the Family page first."
            action={<Link to="/family" className={primaryBtn}>Go to Family</Link>} />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader back eyebrow="Family tools" title="Chores & stars." subtitle="Kids tap when done. You approve. Stars add up for the week." />

      <section className="px-6 mb-6 grid grid-cols-2 gap-3">
        {kids.map((k, i) => {
          const total = thisWeek.filter((d) => d.member_id === k.id && d.status === "approved").reduce((s, d) => s + d.stars, 0);
          return (
            <div key={k.id} className={`rounded-3xl bg-gradient-to-br ${COLORS[i % COLORS.length]} p-4 text-white shadow-sm`}>
              <p className="text-sm font-semibold">{k.name}</p>
              <p className="mt-2 flex items-center gap-1 text-3xl font-bold"><Star className="size-6 fill-current" />{total}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-90">stars this week</p>
            </div>
          );
        })}
      </section>

      {pending.length > 0 && (
        <section className="px-6 mb-6">
          <SectionLabel>Waiting for your OK</SectionLabel>
          <ul className="space-y-2">
            {pending.map((p) => {
              const c = chores.rows.find((x) => x.id === p.chore_id);
              const k = kids.find((x) => x.id === p.member_id);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 dark:bg-amber-950/30">
                  <div className="flex-1 text-sm"><span className="font-medium">{k?.name}</span> · {c?.title ?? "Chore"} · {p.stars}★</div>
                  <button aria-label="Approve" onClick={() => done.update.mutate({ id: p.id, patch: { status: "approved", approved_at: new Date().toISOString() } })}
                    className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white"><Check className="size-4" strokeWidth={3} /></button>
                  <button aria-label="Reject" onClick={() => done.update.mutate({ id: p.id, patch: { status: "rejected" } })}
                    className="grid size-9 place-items-center rounded-full border border-hairline"><X className="size-4" /></button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="px-6 mb-6">
        <SectionLabel>Add a chore</SectionLabel>
        <form className="space-y-2" onSubmit={(e) => {
          e.preventDefault();
          const member = kid || kids[0]?.id;
          if (!title.trim() || !member) return;
          chores.insert.mutate([{ member_id: member, title: title.trim(), stars }]);
          setTitle("");
        }}>
          <input className={inputCls} placeholder="Chore (e.g. Make bed)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select className={inputCls} value={kid || kids[0]?.id || ""} onChange={(e) => setKid(e.target.value)}>
              {kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <select className={inputCls} value={stars} onChange={(e) => setStars(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
            </select>
          </div>
          <button className={`${primaryBtn} w-full`} disabled={!title.trim()}>Add chore</button>
        </form>
      </section>

      <section className="px-6 mb-6 space-y-4">
        {chores.rows.length === 0 && !chores.isLoading ? (
          <EmptyState icon={Star} title="Add your first chore" description="Feed the dog, make the bed, set the table — each earns stars." />
        ) : (
          kids.map((k, i) => {
            const mine = chores.rows.filter((c) => c.member_id === k.id);
            if (!mine.length) return null;
            return (
              <Card key={k.id} className="p-5">
                <p className={`inline-block rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]} px-3 py-1 text-sm font-semibold text-white`}>{k.name}</p>
                <ul className="mt-3 space-y-2">
                  {mine.map((c) => {
                    const waiting = pending.some((p) => p.chore_id === c.id);
                    return (
                      <li key={c.id} className="flex items-center gap-3">
                        <span className="flex-1 text-[15px]">{c.title}</span>
                        <span className="text-amber-500">{"★".repeat(c.stars)}</span>
                        <button disabled={waiting} onClick={() => done.insert.mutate([{ chore_id: c.id, member_id: k.id, stars: c.stars }])}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest ${waiting ? "bg-amber-100 text-amber-800" : "bg-primary text-primary-foreground"}`}>
                          {waiting ? "Waiting" : "Done!"}
                        </button>
                        <button aria-label="Delete chore" onClick={() => chores.remove.mutate(c.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
