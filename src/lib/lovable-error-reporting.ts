type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

import { captureError } from "./sentry";

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const ctx = {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  };
  window.__lovableEvents?.captureException?.(error, ctx, {
    mechanism: "react_error_boundary",
    handled: false,
    severity: "error",
  });
  captureError(error, ctx);
}
