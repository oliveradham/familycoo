// Server-only helpers for Google OAuth (per-user Calendar connection).
// Do NOT import at module scope of a client-reachable file — import inside
// server function handlers only.

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

/** Public URL Google should redirect back to after consent. */
export function getRedirectUri(requestOrigin?: string): string {
  const override = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (override) return override;
  const origin = requestOrigin ?? "https://familycoo.lovable.app";
  return `${origin.replace(/\/$/, "")}/api/public/oauth/google/callback`;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = getEnv("FIELD_ENCRYPTION_KEY");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function ub64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

/** Signed, stateless OAuth `state` param carrying user + household + nonce. */
export async function signState(payload: {
  user_id: string;
  household_id: string;
  return_to?: string;
}): Promise<string> {
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), n: crypto.randomUUID() };
  const encoded = b64url(new TextEncoder().encode(JSON.stringify(body)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(encoded));
  return `${encoded}.${b64url(sig)}`;
}

export async function verifyState(state: string): Promise<{
  user_id: string;
  household_id: string;
  return_to?: string;
  iat: number;
} | null> {
  const [encoded, sig] = state.split(".");
  if (!encoded || !sig) return null;
  const sigBytes = ub64url(sig);
  const sigBuf = new ArrayBuffer(sigBytes.byteLength);
  new Uint8Array(sigBuf).set(sigBytes);
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    sigBuf,
    new TextEncoder().encode(encoded),
  );
  if (!ok) return null;
  const bodyBytes = ub64url(encoded);
  const body = JSON.parse(new TextDecoder().decode(bodyBytes));
  if (typeof body?.iat !== "number" || Date.now() / 1000 - body.iat > 900) return null; // 15 min
  return body;
}

export function buildAuthUrl(state: string, requestOrigin?: string): string {
  const params = new URLSearchParams({
    client_id: getEnv("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: getRedirectUri(requestOrigin),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
  token_type: string;
};

export async function exchangeCode(
  code: string,
  requestOrigin?: string,
): Promise<GoogleTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: getEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: getRedirectUri(requestOrigin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshAccessToken(refresh_token: string): Promise<GoogleTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token,
      client_id: getEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: getEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as GoogleTokenResponse;
}

/** Decode the `email` claim from an id_token without verifying signature. */
export function emailFromIdToken(id_token: string | undefined): string | null {
  if (!id_token) return null;
  try {
    const [, payload] = id_token.split(".");
    if (!payload) return null;
    const json = JSON.parse(new TextDecoder().decode(ub64url(payload)));
    return typeof json?.email === "string" ? json.email : null;
  } catch {
    return null;
  }
}
