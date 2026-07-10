import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Populates the caller's primary household with a curated sample family
 * (parents, kids, upcoming events, tasks, groceries) so a fresh account
 * — including App/Play reviewers — sees a lived-in app in under a second.
 *
 * Idempotent: bails out if the household already has any calendar events,
 * so hitting the button twice is a no-op.
 */
export const loadSampleFamily = createServerFn({ method: "POST" }).middleware([
  requireSupabaseAuth,
]).handler(async ({ context }) => {
  const { supabase, userId } = context;

  const { data: membership, error: mErr } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (mErr) throw mErr;
  if (!membership) throw new Error("No household found");
  const householdId = membership.household_id as string;

  // Idempotency guard
  const { count } = await supabase
    .from("calendar_events")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId);
  if ((count ?? 0) > 0) return { ok: true, skipped: true as const };

  const iso = (offsetDays: number, hour = 9, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const members = [
    { household_id: householdId, name: "Emma", role: "child", color: "#D69E2E" },
    { household_id: householdId, name: "Liam", role: "child", color: "#3182CE" },
    { household_id: householdId, name: "Sofia", role: "child", color: "#805AD5" },
  ];

  const events = [
    { household_id: householdId, title: "Emma — Piano lesson", starts_at: iso(0, 16, 30), location: "Bridgewater Music", category: "sport", created_by: userId },
    { household_id: householdId, title: "Board meeting", starts_at: iso(0, 12, 0), location: "Office", category: "work", created_by: userId },
    { household_id: householdId, title: "Lily pickup", starts_at: iso(0, 16, 15), location: "Lincoln Elementary", category: "school", created_by: userId },
    { household_id: householdId, title: "Liam — Soccer practice", starts_at: iso(1, 17, 0), location: "Riverside Field 3", category: "sport", created_by: userId },
    { household_id: householdId, title: "Sofia — Ballet recital", starts_at: iso(3, 18, 30), location: "Community Theater", category: "sport", created_by: userId },
    { household_id: householdId, title: "Parent-teacher conference", starts_at: iso(4, 15, 0), location: "Lincoln Elementary", category: "school", created_by: userId },
    { household_id: householdId, title: "Family dinner — Grandma's", starts_at: iso(6, 18, 0), category: "family", created_by: userId },
  ];

  const tasks = [
    { household_id: householdId, title: "Sign Emma's field trip form", status: "pending", priority: "high", created_by: userId },
    { household_id: householdId, title: "Order Liam's cleats (size 5)", status: "pending", priority: "medium", created_by: userId },
    { household_id: householdId, title: "Schedule Sofia's dentist visit", status: "pending", priority: "medium", created_by: userId },
    { household_id: householdId, title: "Renew car registration", status: "pending", priority: "high", created_by: userId },
    { household_id: householdId, title: "Refill Emma's inhaler prescription", status: "pending", priority: "high", created_by: userId },
  ];

  const grocery = [
    { household_id: householdId, name: "Oat milk", quantity: 2, category: "dairy", status: "needed", created_by: userId },
    { household_id: householdId, name: "Bananas", quantity: 6, category: "produce", status: "needed", created_by: userId },
    { household_id: householdId, name: "Sourdough bread", quantity: 1, category: "bakery", status: "needed", created_by: userId },
    { household_id: householdId, name: "Chicken breast", quantity: 2, category: "meat", status: "needed", created_by: userId },
  ];

  const [f, e, t, g] = await Promise.all([
    supabase.from("family_members").insert(members),
    supabase.from("calendar_events").insert(events),
    supabase.from("tasks").insert(tasks),
    supabase.from("grocery_items").insert(grocery),
  ]);
  for (const r of [f, e, t, g]) if (r.error) throw r.error;

  return { ok: true, skipped: false as const };
});
