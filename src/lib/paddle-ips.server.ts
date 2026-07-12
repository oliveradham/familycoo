/**
 * Paddle webhook IP allowlist.
 *
 * Paddle publishes the CIDRs it dispatches webhooks from at
 * https://api.paddle.com/ips (`data.ipv4_cidrs`). We fetch and cache the list
 * so we don't hardcode it — Paddle can update it at any time.
 *
 * Sandbox does NOT have a stable public list; we only allowlist for live and
 * skip the check for sandbox to keep dev/test flows working.
 */
type Cache = { cidrs: string[]; fetchedAt: number };
let cache: Cache | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 hour

async function loadCidrs(): Promise<string[]> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.cidrs;
  try {
    const res = await fetch("https://api.paddle.com/ips");
    if (!res.ok) throw new Error(`ips endpoint ${res.status}`);
    const json = (await res.json()) as { data?: { ipv4_cidrs?: string[] } };
    const cidrs = json.data?.ipv4_cidrs ?? [];
    if (cidrs.length) cache = { cidrs, fetchedAt: Date.now() };
    return cache?.cidrs ?? [];
  } catch (e) {
    console.warn("Paddle IP list fetch failed, using previous cache", e);
    return cache?.cidrs ?? [];
  }
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = Number(p);
    if (!Number.isInteger(o) || o < 0 || o > 255) return null;
    n = (n << 8) + o;
  }
  return n >>> 0;
}

function inCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt == null || rangeInt == null || !Number.isFinite(bits)) return false;
  if (bits === 0) return true;
  const mask = (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/**
 * Extract the caller IP from common proxy headers. Returns null if unknown.
 */
export function callerIp(req: Request): string | null {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? null;
}

/**
 * True if `ip` is inside a currently-published Paddle CIDR.
 * On live, an unknown-source request must be rejected by the caller.
 */
export async function isPaddleIp(ip: string): Promise<boolean> {
  const cidrs = await loadCidrs();
  if (!cidrs.length) return true; // fail-open only when we couldn't load; signature check remains
  return cidrs.some((c) => inCidr(ip, c));
}
