import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Delete the signed-in user's account entirely.
 * First cancels any active Paddle subscription so we don't leave the customer
 * being billed with no account. Then removes the auth user (cascades tables).
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Best-effort: cancel any active Paddle subscription immediately.
    try {
      const { data: subs } = await supabaseAdmin
        .from("subscriptions")
        .select("paddle_subscription_id, environment, status")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due"]);

      if (subs && subs.length > 0) {
        const { getPaddleClient } = await import("@/lib/paddle.server");
        for (const s of subs as Array<{ paddle_subscription_id: string; environment: string }>) {
          if (!s.paddle_subscription_id) continue;
          const paddle = getPaddleClient((s.environment as "sandbox" | "live") ?? "sandbox");
          try {
            await paddle.subscriptions.cancel(s.paddle_subscription_id, {
              effectiveFrom: "immediately",
            });
          } catch (e) {
            console.warn("Paddle cancel failed for sub", s.paddle_subscription_id, e);
          }
        }
      }
    } catch (e) {
      console.warn("Pre-delete Paddle cancellation sweep failed", e);
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
