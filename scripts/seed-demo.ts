/**
 * Demo seed script — populates a household with realistic data for
 * screenshots, demos, and store review builds. Idempotent: safe to re-run.
 *
 * Usage:
 *   1. Sign in as the demo account in the app (creates household + user).
 *   2. Copy the household_id from the browser (localStorage or dev tools).
 *   3. DEMO_HOUSEHOLD_ID=... bun run scripts/seed-demo.ts
 *
 * This talks to the DB via the service role, so run locally only.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const household = process.env.DEMO_HOUSEHOLD_ID;

if (!url || !key || !household) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_HOUSEHOLD_ID");
  process.exit(1);
}

const supa = createClient(url, key, { auth: { persistSession: false } });

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

async function upsert(table: string, rows: Record<string, unknown>[], conflict: string) {
  const { error } = await supa.from(table).upsert(rows, { onConflict: conflict });
  if (error) {
    console.error(`× ${table}:`, error.message);
  } else {
    console.log(`✓ ${table}: ${rows.length} rows`);
  }
}

const familyMembers = [
  { household_id: household, name: "Sarah", role: "parent", color: "#8B7355" },
  { household_id: household, name: "David", role: "parent", color: "#4A5568" },
  { household_id: household, name: "Emma", role: "child", color: "#D69E2E" },
  { household_id: household, name: "Liam", role: "child", color: "#3182CE" },
  { household_id: household, name: "Sofia", role: "child", color: "#805AD5" },
];

const calendarEvents = [
  { household_id: household, title: "Emma — Piano lesson", starts_at: iso(daysFromNow(0)), location: "Bridgewater Music" },
  { household_id: household, title: "Liam — Soccer practice", starts_at: iso(daysFromNow(1)), location: "Riverside Field 3" },
  { household_id: household, title: "Sofia — Ballet recital", starts_at: iso(daysFromNow(3)), location: "Community Theater" },
  { household_id: household, title: "Parent-teacher conference", starts_at: iso(daysFromNow(4)), location: "Lincoln Elementary" },
  { household_id: household, title: "Family dinner — Grandma's", starts_at: iso(daysFromNow(6)) },
];

const tasks = [
  { household_id: household, title: "Sign Emma's field trip form", status: "pending", priority: "high" },
  { household_id: household, title: "Order Liam's cleats (size 5)", status: "pending", priority: "medium" },
  { household_id: household, title: "Schedule Sofia's dentist visit", status: "pending", priority: "medium" },
  { household_id: household, title: "Renew car registration", status: "pending", priority: "high" },
  { household_id: household, title: "Refill Emma's inhaler prescription", status: "pending", priority: "high" },
];

const grocery = [
  { household_id: household, name: "Oat milk", qty: 2, category: "dairy", location: "shopping" },
  { household_id: household, name: "Bananas", qty: 6, category: "produce", location: "shopping" },
  { household_id: household, name: "Sourdough bread", qty: 1, category: "bakery", location: "shopping" },
  { household_id: household, name: "Chicken breast", qty: 2, category: "meat", location: "shopping" },
  { household_id: household, name: "Rice", qty: 1, category: "pantry", location: "pantry" },
];

async function main() {
  await upsert("family_members", familyMembers, "household_id,name");
  await upsert("calendar_events", calendarEvents, "household_id,title,starts_at");
  await upsert("tasks", tasks, "household_id,title");
  await upsert("grocery_items", grocery, "household_id,name");
  console.log("\nDemo seed complete for household", household);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
