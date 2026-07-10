/**
 * Redaction layer applied to ALL text sent to the AI Gateway.
 * Belt-and-suspenders: the Gateway is already private and does not train on
 * user data, but we strip anything that looks like a credential or high-risk
 * identifier before it ever leaves our server.
 *
 * Runs server-side inside createServerFn handlers.
 */

const PATTERNS: Array<{ re: RegExp; label: string }> = [
  // US SSN
  { re: /\b\d{3}-\d{2}-\d{4}\b/g, label: "[REDACTED_SSN]" },
  // Credit card (13-19 digits, allowing spaces/dashes)
  { re: /\b(?:\d[ -]*?){13,19}\b/g, label: "[REDACTED_CARD]" },
  // Passport-ish: 1-2 letters + 6-9 digits
  { re: /\b[A-Z]{1,2}\d{6,9}\b/g, label: "[REDACTED_ID]" },
  // IBAN
  { re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, label: "[REDACTED_IBAN]" },
  // Bearer / API tokens
  { re: /\b(?:sk|pk|rk|ey)[-_][A-Za-z0-9_-]{16,}\b/g, label: "[REDACTED_TOKEN]" },
  // JWTs
  { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, label: "[REDACTED_JWT]" },
  // Common secret-labeled key/value pairs
  {
    re: /\b(password|passwd|pwd|secret|api[_-]?key|token|authorization)\s*[:=]\s*\S+/gi,
    label: "$1: [REDACTED]",
  },
];

export function redactForAI(input: string): string {
  if (!input) return input;
  let out = input;
  for (const { re, label } of PATTERNS) out = out.replace(re, label);
  return out;
}

export function redactObjectForAI<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === "string" ? redactForAI(v) : v)),
  );
}
