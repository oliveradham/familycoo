// Server-only Web Push sender. Import inside handlers, never at top level of
// client-reachable modules.
import webpush from "web-push";

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@familycoo.lovable.app";
  if (!pub || !priv) throw new Error("VAPID keys not configured");
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type WebPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function sendWebPush(
  sub: WebPushSubscription,
  payload: PushPayload,
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  configure();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 },
    );
    return { ok: true };
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    // 404 / 410 → subscription is dead and should be removed.
    if (status === 404 || status === 410) return { ok: false, gone: true };
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export const VAPID_PUBLIC_KEY_SERVER = () => process.env.VAPID_PUBLIC_KEY ?? "";
