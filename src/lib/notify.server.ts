// Household notification fan-out. Server-only.
import type { SupabaseClient } from "@supabase/supabase-js";

type Sb = SupabaseClient;

export type NotifyInput = {
  household_id: string;
  kind: string; // e.g. "briefing:morning", "agent:conflict"
  subject: string;
  body?: string;
  url?: string;
  ref_id?: string; // dedupe key
  dedupe_hours?: number; // default 6
  user_ids?: string[]; // if omitted, all household members
};

export async function notifyHousehold(supabase: Sb, input: NotifyInput) {
  const dedupeHours = input.dedupe_hours ?? 6;

  // 1. Resolve recipients.
  let userIds = input.user_ids;
  if (!userIds || userIds.length === 0) {
    const { data } = await supabase
      .from("household_members")
      .select("user_id")
      .eq("household_id", input.household_id);
    userIds = (data ?? []).map((m) => m.user_id as string);
  }
  if (userIds.length === 0) return { sent: 0, skipped: 0 };

  // 2. Dedupe: skip if we already delivered same (household, ref_id) recently.
  if (input.ref_id) {
    const since = new Date(Date.now() - dedupeHours * 3600_000).toISOString();
    const { data: recent } = await supabase
      .from("notification_log")
      .select("id")
      .eq("household_id", input.household_id)
      .eq("ref_id", input.ref_id)
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) return { sent: 0, skipped: userIds.length };
  }

  // 3. Load profiles for channel preferences.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, notification_channel, autopilot_paused")
    .in("id", userIds);

  const { sendWebPush } = await import("./push.server");

  let sent = 0;
  for (const p of profiles ?? []) {
    if (p.autopilot_paused) continue;
    const channel = p.notification_channel ?? "in_app";

    // In-app log always written (this powers the /notifications feed).
    await supabase.from("notification_log").insert({
      user_id: p.id,
      household_id: input.household_id,
      channel: "in_app",
      kind: input.kind,
      subject: input.subject,
      body: input.body ?? null,
      ref_id: input.ref_id ?? null,
      delivered_at: new Date().toISOString(),
    });

    // Web push fan-out if user opted into push (or "both").
    if (channel === "push" || channel === "both") {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth, platform")
        .eq("user_id", p.id);

      for (const sub of subs ?? []) {
        if (sub.platform !== "web") continue; // native handled elsewhere
        const result = await sendWebPush(sub, {
          title: input.subject,
          body: input.body ?? "",
          url: input.url ?? "/notifications",
          tag: input.ref_id ?? input.kind,
        });
        if (result.ok) sent++;
        if (result.gone) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
        await supabase.from("notification_log").insert({
          user_id: p.id,
          household_id: input.household_id,
          channel: "push",
          kind: input.kind,
          subject: input.subject,
          body: input.body ?? null,
          ref_id: input.ref_id ?? null,
          delivered_at: result.ok ? new Date().toISOString() : null,
          error: result.error ?? null,
        });
      }
    }
  }

  return { sent, skipped: 0 };
}
