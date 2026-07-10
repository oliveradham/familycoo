// Client-side Web Push registration.
import { savePushSubscription, deletePushSubscription, getVapidPublicKey } from "./push.functions";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return buffer;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function currentPushPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "default";
  return Notification.permission;
}

export async function subscribeToPush(): Promise<{ ok: boolean; error?: string }> {
  if (!pushSupported()) return { ok: false, error: "Push not supported in this browser" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, error: "Permission denied" };

  const { key } = await getVapidPublicKey();
  if (!key) return { ok: false, error: "Push notifications not configured on the server" };

  const reg =
    (await navigator.serviceWorker.getRegistration("/sw.js")) ??
    (await navigator.serviceWorker.register("/sw.js"));

  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    }));

  const json = sub.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!p256dh || !auth) return { ok: false, error: "Missing subscription keys" };

  await savePushSubscription({
    data: {
      endpoint: sub.endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      platform: "web",
    },
  });

  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean }> {
  if (!pushSupported()) return { ok: false };
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return { ok: true };
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await deletePushSubscription({ data: { endpoint: sub.endpoint } });
    await sub.unsubscribe();
  }
  return { ok: true };
}

export async function isCurrentlySubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
