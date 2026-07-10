// AES-256-GCM field encryption with per-household subkey derived via HKDF.
// Storage format: enc:v1:<base64 iv>:<base64 ciphertext+tag>

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(buf: ArrayBuffer | Uint8Array) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function ub64(s: string) {
  const bin = atob(s);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function getMasterKey() {
  const secret = process.env.FIELD_ENCRYPTION_KEY;
  if (!secret) throw new Error("FIELD_ENCRYPTION_KEY not set");
  return await crypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
}

async function deriveHouseholdKey(householdId: string) {
  const master = await getMasterKey();
  return await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: enc.encode(householdId), info: enc.encode("familycoo:field:v1") },
    master,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptField(householdId: string, plaintext: string | null | undefined) {
  if (plaintext == null || plaintext === "") return null;
  const key = await deriveHouseholdKey(householdId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return `enc:v1:${b64(iv)}:${b64(ct)}`;
}

export async function decryptField(householdId: string, blob: string | null | undefined) {
  if (!blob) return null;
  if (!blob.startsWith("enc:v1:")) return blob; // legacy plaintext
  const [, , ivB64, ctB64] = blob.split(":");
  try {
    const key = await deriveHouseholdKey(householdId);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ub64(ivB64) }, key, ub64(ctB64));
    return dec.decode(pt);
  } catch {
    return null;
  }
}
