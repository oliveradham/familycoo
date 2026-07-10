// Native push notifications wrapper (Capacitor).
// Dormant on web — returns without side effects. On native, requests permission,
// registers with APNs/FCM, and persists the device token as a push_subscription
// row (platform = ios/android) so server-side fan-out can target it.
//
// Install inside the Capacitor shell (not needed for web build):
//   npm i @capacitor/push-notifications && npx cap sync

import { isNative, getPlatform } from "./platform";
import { savePushSubscription, deletePushSubscription } from "./push.functions";

type PushPlugin = {
  requestPermissions: () => Promise<{ receive: "granted" | "denied" | "prompt" }>;
  register: () => Promise<void>;
  addListener: (event: string, cb: (payload: unknown) => void) => Promise<{ remove: () => Promise<void> }>;
  removeAllListeners: () => Promise<void>;
};

async function loadPushPlugin(): Promise<PushPlugin | null> {
  if (!isNative()) return null;
  try {
    const pkg = ["@capacitor", "push-notifications"].join("/");
    // Indirection prevents Vite from statically resolving this optional native-only dep.
    const dynImport = new Function("s", "return import(s)") as (s: string) => Promise<any>;
    const mod = await dynImport(pkg);
    return mod.PushNotifications as PushPlugin;
  } catch {
    return null;
  }
}

let currentToken: string | null = null;

/**
 * Request notification permission and register the device with APNs/FCM.
 * Persists the resulting token as a push_subscription row for server fan-out.
 * Safe to call on web (no-op). Safe to call more than once (idempotent).
 */
export async function registerNativePush(): Promise<
  { ok: true; token: string } | { ok: false; reason: string }
> {
  const Push = await loadPushPlugin();
  if (!Push) return { ok: false, reason: "not_native" };

  const perm = await Push.requestPermissions();
  if (perm.receive !== "granted") return { ok: false, reason: "denied" };

  await Push.removeAllListeners();

  const tokenPromise = new Promise<string>((resolve, reject) => {
    Push.addListener("registration", (payload) => {
      const t = (payload as { value?: string }).value;
      if (t) resolve(t);
      else reject(new Error("empty_token"));
    });
    Push.addListener("registrationError", (payload) => {
      reject(new Error(String((payload as { error?: string }).error ?? "registration_error")));
    });
  });

  await Push.register();

  try {
    const token = await Promise.race([
      tokenPromise,
      new Promise<string>((_, r) => setTimeout(() => r(new Error("timeout")), 15_000)),
    ]);

    currentToken = token;
    const platform = getPlatform() as "ios" | "android";
    await savePushSubscription({
      data: {
        endpoint: token,
        // p256dh/auth are web-push-only; server distinguishes by platform.
        p256dh: "",
        auth: "",
        user_agent: `${platform}-native`,
        platform,
      },
    });
    return { ok: true, token };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}

/** Unregister the current device token. Safe on web (no-op). */
export async function unregisterNativePush(): Promise<void> {
  if (!currentToken) return;
  try {
    await deletePushSubscription({ data: { endpoint: currentToken } });
  } finally {
    currentToken = null;
    const Push = await loadPushPlugin();
    if (Push) await Push.removeAllListeners();
  }
}
