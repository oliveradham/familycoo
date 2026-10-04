import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Trash2, UtensilsCrossed, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { EmptyState, ghostBtn, inputCls, primaryBtn } from "@/components/EmptyState";
import { addDays, isoDate, useFamilyRows } from "@/lib/use-family-rows";
import { sendMealsToGrocery } from "@/lib/family-tools.functions";

export const Route = createFileRoute("/meals")({
  head: () => ({
    meta: [
      { title: "Weekly Meal Planner — Family COO" },
      { name: "description", content: "Plan breakfast, lunch and dinner for the week and send missing ingredients to your grocery list in one tap." },
      { property: "og:title", content: "Weekly Meal Planner — Family COO" },
      { property: "og:description", content: "Plan the week's meals, rotate favorites, and fill the grocery list automatically." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MealsPage,
});

type Meal = { id: string; name: string; ingredients: string[]; is_favorite: boolean };
type Entry = { id: string; plan_date: string; slot: "breakfast" | "lunch" | "dinner"; meal_id: string };
const SLOTS = ["breakfast", "lunch", "dinner"] as const;

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday start
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function MealsPage() {
  const meals = useFamilyRows<Meal>("meals");
  const entries = useFamilyRows<Entry>("meal_plan_entries");
  const qc = useQueryClient();
  const send = useServerFn(sendMealsToGrocery);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [picking, setPicking] = useState<{ date: string; slot: Entry["slot"] } | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const from = isoDate(days[0]);
  const to = isoDate(days[6]);
  const mealById = useMemo(() => new Map(meals.rows.map((m) => [m.id, m])), [meals.rows]);
  const entryAt = (date: string, slot: string) => entries.rows.find((e) => e.plan_date === date && e.slot === slot);

  const sendMut = useMutation({
    mutationFn: () => send({ data: { from, to } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["groceries"] });
      toast.success(r.added ? `Added ${r.added} item${r.added === 1 ? "" : "s"} to groceries` : "Everything is already on your list");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update groceries"),
  });

  const assign = async (mealId: string) => {
    if (!picking) return;
    const existing = entryAt(picking.date, picking.slot);
    if (existing) await entries.remove.mutateAsync(existing.id);
    await entries.insert.mutateAsync([{ plan_date: picking.date, slot: picking.slot, meal_id: mealId }]);
    setPicking(null);
  };

  const favorites = meals.rows.filter((m) => m.is_favorite);
  const weekHasMeals = entries.rows.some((e) => e.plan_date >= from && e.plan_date <= to);

  return (
    <AppShell>
      <PageHeader back eyebrow="Family tools" title="This week's table." subtitle="Plan meals, rotate favorites, and let the grocery list fill itself." />

      <section className="px-6 mb-6">
        <div className="flex items-center justify-between">
          <button aria-label="Previous week" className={ghostBtn} onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="size-4" /></button>
          <p className="text-[12px] uppercase tracking-widest text-muted-foreground">
            {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
          <button aria-label="Next week" className={ghostBtn} onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="size-4" /></button>
        </div>
        <button className={`${primaryBtn} mt-4 w-full`} disabled={!weekHasMeals || sendMut.isPending} onClick={() => sendMut.mutate()}>
          <ShoppingCart className="size-4" /> {sendMut.isPending ? "Sending…" : "Send to grocery list"}
        </button>
      </section>

      <section className="px-6 mb-8 space-y-3">
        {days.map((d) => {
          const date = isoDate(d);
          return (
            <Card key={date} className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SLOTS.map((slot) => {
                  const e = entryAt(date, slot);
                  const meal = e ? mealById.get(e.meal_id) : undefined;
                  return (
                    <button
                      key={slot}
                      onClick={() => setPicking({ date, slot })}
                      className={`min-h-[64px] rounded-2xl border p-2 text-left ${meal ? "border-foreground/20 bg-secondary/50" : "border-dashed border-hairline"}`}
                    >
                      <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">{slot}</span>
                      <span className="mt-1 block text-[12px] leading-tight">{meal?.name ?? "+ Add"}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </section>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4" onClick={() => setPicking(null)}>
          <div className="w-full max-w-[480px] rounded-3xl bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-serif text-xl italic capitalize">Pick {picking.slot}</p>
              <button aria-label="Close" onClick={() => setPicking(null)}><X className="size-4" /></button>
            </div>
            {meals.rows.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Add a meal below first.</p>
            ) : (
              <ul className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto">
                {[...favorites, ...meals.rows.filter((m) => !m.is_favorite)].map((m) => (
                  <li key={m.id}>
                    <button onClick={() => assign(m.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-secondary/60">
                      {m.name}
                      {m.is_favorite && <Heart className="size-3.5 fill-current text-rose-500" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {entryAt(picking.date, picking.slot) && (
              <button
                className={`${ghostBtn} mt-3 w-full`}
                onClick={async () => { await entries.remove.mutateAsync(entryAt(picking.date, picking.slot)!.id); setPicking(null); }}
              >
                Clear this slot
              </button>
            )}
          </div>
        </div>
      )}

      <section className="px-6 mb-6">
        <SectionLabel>Your meals</SectionLabel>
        <form
          className="mb-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            meals.insert.mutate([{ name: name.trim(), ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean) }]);
            setName(""); setIngredients("");
          }}
        >
          <input className={inputCls} placeholder="Meal name (e.g. Taco night)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="Ingredients, comma separated" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
          <button className={`${primaryBtn} w-full`} disabled={!name.trim()}>Save meal</button>
        </form>
        {meals.rows.length === 0 && !meals.isLoading ? (
          <EmptyState icon={UtensilsCrossed} title="Add your first meal" description="Save meals once, then drop them into any day. Heart the ones you love to rotate them." />
        ) : (
          <ul className="space-y-2">
            {meals.rows.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  {m.ingredients.length > 0 && <p className="mt-0.5 text-[12px] text-muted-foreground">{m.ingredients.join(", ")}</p>}
                </div>
                <button aria-label="Favorite" onClick={() => meals.update.mutate({ id: m.id, patch: { is_favorite: !m.is_favorite } })}>
                  <Heart className={`size-4 ${m.is_favorite ? "fill-current text-rose-500" : "text-muted-foreground"}`} />
                </button>
                <button aria-label="Delete meal" onClick={() => meals.remove.mutate(m.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
