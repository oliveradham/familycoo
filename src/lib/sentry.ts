// Sentry crash reporting. Dormant unless VITE_SENTRY_DSN is set.
// - Client-only (SSR guarded).
// - Captures unhandled errors + tanstack error boundary reports.
// - Strips known PII fields (email, phone, address, etc.) via beforeSend.

import * as Sentry from "@sentry/react";

let initialized = false;

const PII_KEY_RE =
  /email|phone|address|street|zip|postal|dob|birthday|ssn|passport|license|token|password|secret|api[-_]?key/i;

function scrub<T>(value: T, depth = 0): T {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1)) as unknown as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_KEY_RE.test(k) ? "[redacted]" : scrub(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

export function initSentry(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: (import.meta.env.VITE_APP_VERSION as string | undefined) ?? undefined,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      // Drop request cookies / headers entirely
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
        if (event.request.data) event.request.data = scrub(event.request.data);
      }
      if (event.extra) event.extra = scrub(event.extra);
      if (event.contexts) event.contexts = scrub(event.contexts);
      if (event.user) {
        // keep only opaque id
        event.user = event.user.id ? { id: String(event.user.id) } : undefined;
      }
      return event;
    },
  });

  initialized = true;
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.captureException(error, context ? { extra: scrub(context) } : undefined);
}

export function setSentryUser(id: string | null): void {
  if (!initialized) return;
  Sentry.setUser(id ? { id } : null);
}
