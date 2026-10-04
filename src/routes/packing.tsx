import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Luggage, Plus, Trash2 } from "lucide-react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { EmptyState, ghostBtn, inputCls, primaryBtn } from "@/components/EmptyState";
import { useFamilyRows } from "@/lib/use-family-rows";

export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "Trip Packing Lists — Family COO" },
      { name: "description", content: "Packing list templates linked to your trips, with a separate checklist for every family member." },
      { property: "og:title", content: "Trip Packing Lists — Family COO" },
      { property: "og:description", content: "Beach, city, cruise or business — per-person packing lists for every trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PackingPage,
});

type Trip = { id: string; title: string; destination: string | null; start_date: string | null };
type Member = { id: string; name: string };
type PList = { id: string; trip_id: string | null; member_id: string | null; person_label: string; template: string };
type PItem = { id: string; list_id: string; name: string; packed: boolean };

const BASE = ["Toothbrush", "Toothpaste", "Pajamas", "Underwear", "Socks", "Phone charger", "Medications"];
const TEMPLATES: Record<string, { label: string; items: string[] }> = {
  beach: { label: "Beach vacation", items: [...BASE, "Swimsuit", "Sunscreen", "Sunglasses", "Hat", "Flip-flops", "Beach towel", "Shorts", "T-shirts"] },
  city: { label: "City trip", items: [...BASE, "Walking shoes", "Light jacket", "Day bag", "Umbrella", "Outfits", "Water bottle"] },
  cruise: { label: "Cruise", items: [...BASE, "Passport", "Formal outfit", "Swimsuit", "Sunscreen", "Motion-sickness tablets", "Lanyard", "Light sweater"] },
  business: { label: "Business trip", items: [...BASE, "Laptop", "Laptop charger", "Business attire", "Dress shoes", "Notebook", "ID / badge"] },
};

function PackingPage() {
  const trips = useFamilyRows<Trip>("trips");
  const members = useFamilyRows<Member>("family_members");
  const lists = useFamilyRows<PList>("packing_lists");
  const items = useFamilyRows<PItem>("packing_items");
  const [tripId, setTripId] = useState("");
  const [template, setTemplate] = useState("beach");
  const [who, setWho] = useState<string[]>([]);
  const selectedTrip = tripId || trips.rows[0]?.id || "";

  if (!trips.isLoading && trips.rows.length === 0) {
    return (
      <AppShell>
        <PageHeader back eyebrow="Family tools" title="Packed, not panicked." />
        <section className="px-6">
          <EmptyState icon={Luggage} title="Add your first trip" description="Packing lists attach to trips. Create a trip in Travel, then come back to pack."
            action={<Link to="/travel" className={primaryBtn}>Go to Travel</Link>} />
        </section>
      </AppShell>
    );
  }

  const tripLists = lists.rows.filter((l) => l.trip_id === selectedTrip);

  const create = async () => {
    const people = who.length ? who : ["everyone"];
    const created = await lists.insert.mutateAsync(
      people.map((p) => ({
        trip_id: selectedTrip,
        template,
        member_id: p === "everyone" ? null : p,
        person_label: p === "everyone" ? "Everyone" : members.rows.find((m) => m.id === p)?.name ?? "Person",
      })),
    );
    const rows = (created as PList[]).flatMap((l) => TEMPLATES[template].items.map((name) => ({ list_id: l.id, name })));
    if (rows.length) await items.insert.mutateAsync(rows);
    setWho([]);
  };

  return (
    <AppShell>
      <PageHeader back eyebrow="Family tools" title="Packed, not panicked." subtitle="Start from a template. Every kid gets their own list." />
      <section className="px-6 mb-5 flex gap-2 overflow-x-auto">
        {trips.rows.map((t) => (
          <button key={t.id} onClick={() => setTripId(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${t.id === selectedTrip ? "bg-primary text-primary-foreground" : "border border-hairline bg-surface"}`}>
            {t.title}
          </button>
        ))}
      </section>

      <section className="px-6 mb-6">
        <Card className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">New list from template</p>
          <select className={`${inputCls} mt-3`} value={template} onChange={(e) => setTemplate(e.target.value)}>
            {Object.entries(TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {members.rows.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {members.rows.map((m) => {
                const on = who.includes(m.id);
                return (
                  <button key={m.id} type="button" onClick={() => setWho(on ? who.filter((x) => x !== m.id) : [...who, m.id])}
                    className={`rounded-full px-3 py-1.5 text-[12px] ${on ? "bg-primary text-primary-foreground" : "border border-hairline"}`}>{m.name}</button>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">{who.length ? `${who.length} separate list${who.length > 1 ? "s" : ""}` : "No one picked — one shared list."}</p>
          <button className={`${primaryBtn} mt-3 w-full`} disabled={lists.insert.isPending} onClick={create}><Plus className="size-4" /> Create</button>
        </Card>
      </section>

      <section className="px-6 mb-6 space-y-4">
        {tripLists.length === 0 && !lists.isLoading ? (
          <EmptyState icon={Luggage} title="Add your first packing list" description="Pick a template above to create one." />
        ) : (
          tripLists.map((l) => <ListCard key={l.id} list={l} items={items} lists={lists} />)
        )}
      </section>
    </AppShell>
  );
}

function ListCard({ list, items, lists }: { list: PList; items: ReturnType<typeof useFamilyRows<PItem>>; lists: ReturnType<typeof useFamilyRows<PList>> }) {
  const [name, setName] = useState("");
  const mine = items.rows.filter((i) => i.list_id === list.id);
  const packed = mine.filter((i) => i.packed).length;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-xl italic">{list.person_label}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{TEMPLATES[list.template]?.label ?? "Custom"} · {packed}/{mine.length} packed</p>
        </div>
        <button aria-label="Delete list" onClick={() => lists.remove.mutate(list.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${mine.length ? (packed / mine.length) * 100 : 0}%` }} />
      </div>
      <SectionLabel>{""}</SectionLabel>
      <ul className="space-y-1">
        {mine.map((i) => (
          <li key={i.id} className="flex items-center gap-3">
            <button onClick={() => items.update.mutate({ id: i.id, patch: { packed: !i.packed } })} className="flex flex-1 items-center gap-3 py-1.5 text-left text-sm">
              <span className={`grid size-5 place-items-center rounded-md border ${i.packed ? "border-emerald-500 bg-emerald-500 text-white" : "border-foreground/30"}`}>{i.packed && <Check className="size-3" strokeWidth={3} />}</span>
              <span className={i.packed ? "text-muted-foreground line-through" : ""}>{i.name}</span>
            </button>
            <button aria-label="Remove item" onClick={() => items.remove.mutate(i.id)}><Trash2 className="size-3.5 text-muted-foreground/60" /></button>
          </li>
        ))}
      </ul>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; items.insert.mutate([{ list_id: list.id, name: name.trim() }]); setName(""); }}>
        <input className={inputCls} placeholder="Add item" value={name} onChange={(e) => setName(e.target.value)} />
        <button className={ghostBtn} aria-label="Add item"><Plus className="size-4" /></button>
      </form>
    </Card>
  );
}
