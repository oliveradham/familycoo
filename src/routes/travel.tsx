import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listTrips, createTrip, updateTripStatus, deleteTrip } from "@/lib/trips.functions";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/travel")({
  head: () => ({ meta: [{ title: "Travel — Family COO" }] }),
  component: TravelPage,
});

function TravelPage() {
  const list = useServerFn(listTrips);
  const create = useServerFn(createTrip);
  const status = useServerFn(updateTripStatus);
  const del = useServerFn(deleteTrip);
  const qc = useQueryClient();
  const { data } = useSuspenseQuery({ queryKey: ["trips"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", destination: "", start_date: "", end_date: "" });

  const mCreate = useMutation({
    mutationFn: () => create({ data: { title: form.title, destination: form.destination, start_date: form.start_date || null, end_date: form.end_date || null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      setOpen(false);
      setForm({ title: "", destination: "", start_date: "", end_date: "" });
    },
  });
  const mStatus = useMutation({ mutationFn: (v: { id: string; status: string }) => status({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }) });
  const mDel = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }) });

  return (
    <AppShell>
      <PageHeader back eyebrow="Travel" title="Trips at a glance." subtitle="Plan, book, pack — a calm view of family travel." />

      <section className="px-6 mb-4">
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Plus className="size-3.5" strokeWidth={1.75} /> New trip
        </button>
      </section>

      {open && (
        <section className="px-6 mb-4">
          <Card>
            <div className="grid gap-3">
              <input placeholder="Trip name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <input placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm" />
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm" />
              </div>
              <button onClick={() => mCreate.mutate()} disabled={!form.title.trim() || mCreate.isPending} className="rounded-full bg-zinc-900 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50">
                {mCreate.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </Card>
        </section>
      )}

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {data.map((t: any) => (
              <li key={t.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.status}</p>
                  <p className="mt-0.5 text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.destination}
                    {t.start_date ? ` · ${t.start_date}` : ""}
                    {t.end_date ? ` → ${t.end_date}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={t.status} onChange={(e) => mStatus.mutate({ id: t.id, status: e.target.value })} className="rounded-full border border-hairline bg-transparent px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <option value="planning">planning</option>
                    <option value="booked">booked</option>
                    <option value="complete">complete</option>
                  </select>
                  <button onClick={() => mDel.mutate(t.id)} className="text-muted-foreground hover:text-foreground" aria-label="Delete">
                    <Trash2 className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
            {data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No trips planned.</li>}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
