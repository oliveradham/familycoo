import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMaintenance, createMaintenance, markMaintenanceDone, deleteMaintenance } from "@/lib/maintenance.functions";
import { Plus, Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Family COO" }] }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const list = useServerFn(listMaintenance);
  const create = useServerFn(createMaintenance);
  const markDone = useServerFn(markMaintenanceDone);
  const del = useServerFn(deleteMaintenance);
  const qc = useQueryClient();
  const { data } = useSuspenseQuery({ queryKey: ["maintenance"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", area: "home", frequency_days: "", next_due_on: "", vendor: "" });

  const mCreate = useMutation({
    mutationFn: () =>
      create({
        data: {
          title: form.title,
          area: form.area,
          frequency_days: form.frequency_days ? parseInt(form.frequency_days) : null,
          next_due_on: form.next_due_on || null,
          vendor: form.vendor || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      setOpen(false);
      setForm({ title: "", area: "home", frequency_days: "", next_due_on: "", vendor: "" });
    },
  });
  const mDone = useMutation({ mutationFn: (id: string) => markDone({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }) });
  const mDel = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }) });

  return (
    <AppShell>
      <PageHeader back eyebrow="Home" title="Household maintenance." subtitle="Filters, HVAC, yard — never miss the recurring stuff." />

      <section className="px-6 mb-4">
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Plus className="size-3.5" strokeWidth={1.75} /> New task
        </button>
      </section>

      {open && (
        <section className="px-6 mb-4">
          <Card>
            <div className="grid gap-3">
              <input placeholder="Title (e.g. Replace HVAC filter)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm">
                  <option value="home">Home</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="yard">Yard</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="appliance">Appliance</option>
                </select>
                <input type="number" placeholder="Every N days" value={form.frequency_days} onChange={(e) => setForm({ ...form, frequency_days: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              </div>
              <input type="date" value={form.next_due_on} onChange={(e) => setForm({ ...form, next_due_on: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm" />
              <input placeholder="Vendor (optional)" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
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
            {data.map((m: any) => (
              <li key={m.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.area}</p>
                  <p className="mt-0.5 text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.next_due_on ? `Due ${m.next_due_on}` : "No date"}
                    {m.frequency_days ? ` · every ${m.frequency_days}d` : ""}
                    {m.vendor ? ` · ${m.vendor}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => mDone.mutate(m.id)} className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    <Check className="size-3" strokeWidth={2} /> Done
                  </button>
                  <button onClick={() => mDel.mutate(m.id)} className="text-muted-foreground hover:text-foreground" aria-label="Delete">
                    <Trash2 className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
            {data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No maintenance tasks yet.</li>}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
