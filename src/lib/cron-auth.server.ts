import { timingSafeEqual } from "crypto";

/**
 * Verify a cron/hook request carries the shared CRON_SECRET.
 * Accepts either `Authorization: Bearer <secret>` or `x-cron-secret: <secret>`.
 * Uses constant-time comparison. Never gate on SUPABASE_PUBLISHABLE_KEY — that
 * value ships in the client bundle and is not a secret.
 */
export function verifyCronRequest(request: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Server misconfigured: CRON_SECRET not set", { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : null;
  const provided = bearer ?? request.headers.get("x-cron-secret") ?? "";

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return new Response("Unauthorized", { status: 401 });
  return null;
}
