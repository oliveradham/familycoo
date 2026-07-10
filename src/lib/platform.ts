// Runtime platform detection. Safe on SSR (returns false).
// Used to swap web-only flows (Paddle checkout, PWA install prompts) for
// native equivalents (RevenueCat, in-app browser) when running inside a
// Capacitor shell.

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => "web" | "ios" | "android";
};

function cap(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function isNative(): boolean {
  return Boolean(cap()?.isNativePlatform?.());
}

export function getPlatform(): "web" | "ios" | "android" {
  return cap()?.getPlatform?.() ?? "web";
}

export function isIOS(): boolean {
  return getPlatform() === "ios";
}

export function isAndroid(): boolean {
  return getPlatform() === "android";
}

/**
 * Open an external URL. On native, routes through @capacitor/browser
 * (App Store requirement — no window.open to external sites).
 */
export async function openExternal(url: string): Promise<void> {
  if (isNative()) {
    try {
      const pkg = ["@capacitor", "browser"].join("/");
      // Indirection prevents Vite from statically resolving this optional native-only dep.
      const dynImport = new Function("s", "return import(s)") as (s: string) => Promise<any>;
      const mod = await dynImport(pkg);
      await mod.Browser.open({ url });
      return;
    } catch {
      // fall through to window.open if plugin missing in dev
    }
  }
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
}
