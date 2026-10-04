import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TABLES = [
  "meals",
  "meal_plan_entries",
  "homework",
  "packing_lists",
  "packing_items",
  "birthdays",
  "chores",
  "chore_completions",
  "family_members",
  "trips",
] as const;
const WRITABLE = TABLES.filter((t) => t !== "family_members" && t !== "trips");
type Table = (typeof TABLES)[number];

async function householdId(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.household_id as string) ?? null;
}

const ORDER: Record<Table, string> = {
  meals: "name",
  meal_plan_entries: "plan_date",
  homework: "due_date",
  packing_lists: "created_at",
  packing_items: "created_at",
  birthdays: "name",
  chores: "created_at",
  chore_completions: "completed_at",
  family_members: "created_at",
  trips: "created_at",
};

export const listRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { table: Table }) => z.object({ table: z.enum(TABLES) }).parse(d))
  .handler(async ({ data, context }) => {
    const hid = await householdId(context.supabase, context.userId);
    if (!hid) return [] as any[];
    const { data: rows, error } = await (context.supabase as any)
      .from(data.table)
      .select("*")
      .eq("household_id", hid)
      .order(ORDER[data.table], { ascending: true });
    if (error) throw error;
    return (rows ?? []) as any[];
  });

const rowSchema = z.record(z.string(), z.any());

export const insertRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { table: string; rows: Record<string, unknown>[] }) =>
    z.object({ table: z.enum(WRITABLE as [string, ...string[]]), rows: z.array(rowSchema).min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const hid = await householdId(context.supabase, context.userId);
    if (!hid) throw new Error("No household");
    const rows = data.rows.map((r) => {
      const { id: _id, household_id: _h, ...rest } = r as any;
      return { ...rest, household_id: hid };
    });
    const { data: out, error } = await (context.supabase as any).from(data.table).insert(rows).select("*");
    if (error) throw error;
    return (out ?? []) as any[];
  });

export const updateRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { table: string; id: string; patch: Record<string, unknown> }) =>
    z.object({ table: z.enum(WRITABLE as [string, ...string[]]), id: z.string().uuid(), patch: rowSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id: _i, household_id: _h, ...patch } = data.patch as any;
    const { error } = await (context.supabase as any).from(data.table).update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { table: string; id: string }) =>
    z.object({ table: z.enum(WRITABLE as [string, ...string[]]), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).from(data.table).delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/** Adds ingredients from planned meals in [from, to] that aren't already on the grocery list. */
export const sendMealsToGrocery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { from: string; to: string }) =>
    z.object({ from: z.string().date(), to: z.string().date() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const hid = await householdId(sb, context.userId);
    if (!hid) throw new Error("No household");
    const { data: entries, error } = await sb
      .from("meal_plan_entries")
      .select("meal_id, meals(ingredients)")
      .eq("household_id", hid)
      .gte("plan_date", data.from)
      .lte("plan_date", data.to);
    if (error) throw error;
    const wanted = new Map<string, string>();
    for (const e of entries ?? []) {
      for (const ing of (e.meals?.ingredients ?? []) as string[]) {
        const name = ing.trim();
        if (name) wanted.set(name.toLowerCase(), name);
      }
    }
    const { data: existing, error: gErr } = await sb
      .from("grocery_items")
      .select("name, status")
      .eq("household_id", hid);
    if (gErr) throw gErr;
    const have = new Set(
      (existing ?? []).filter((g: any) => g.status !== "bought").map((g: any) => String(g.name).toLowerCase()),
    );
    const toAdd = [...wanted.entries()].filter(([k]) => !have.has(k)).map(([, name]) => ({
      household_id: hid,
      name,
      category: "meal plan",
      status: "needed",
      created_by: context.userId,
    }));
    if (toAdd.length) {
      const { error: iErr } = await sb.from("grocery_items").insert(toAdd);
      if (iErr) throw iErr;
    }
    return { added: toAdd.length, skipped: wanted.size - toAdd.length };
  });
