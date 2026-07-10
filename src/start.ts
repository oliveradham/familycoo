import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Security headers applied to every response. Defense-in-depth against
// clickjacking, MIME-sniffing, referrer leakage, mixed content, and
// cross-origin data exfiltration. CSP is intentionally permissive enough
// to allow Google Fonts and inline styles used by the app shell.
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const response = (result && typeof result === "object" && "response" in (result as any)
    ? (result as any).response
    : result) as unknown;
  if (!(response instanceof Response)) return result;
  const h = response.headers;

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const set = (k: string, v: string) => {
    if (!h.has(k)) h.set(k, v);
  };
  set("Content-Security-Policy", csp);
  set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  set("X-Content-Type-Options", "nosniff");
  set("X-Frame-Options", "DENY");
  set("Referrer-Policy", "strict-origin-when-cross-origin");
  set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  );
  set("Cross-Origin-Opener-Policy", "same-origin");
  set("Cross-Origin-Resource-Policy", "same-origin");
  set("X-DNS-Prefetch-Control", "off");
  set("X-Permitted-Cross-Domain-Policies", "none");
  return result;
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [securityHeadersMiddleware, errorMiddleware],
}));
