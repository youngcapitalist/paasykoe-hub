/** Allekirjoitetut nurture-alennustokenit (HOT DEAL). */

const DEAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEAL_TTL_F_MS = 48 * 60 * 60 * 1000;

function secret(): string {
  return Deno.env.get("NURTURE_SIGNING_SECRET") || Deno.env.get("DRIP_SIGNING_SECRET") || "";
}

function b64url(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(payload: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  return b64url(String.fromCharCode(...new Uint8Array(sig)));
}

export async function signDealToken(
  email: string,
  exam: string,
  discountPct: number,
  ttlMs?: number,
): Promise<string> {
  const s = secret();
  if (!s) throw new Error("NURTURE_SIGNING_SECRET missing");
  const normalized = email.toLowerCase().trim();
  const ex = exam.toLowerCase();
  const ttl = ttlMs ?? (ex === "f" ? DEAL_TTL_F_MS : DEAL_TTL_MS);
  const payload = JSON.stringify({
    e: normalized,
    x: ex,
    d: discountPct,
    exp: Date.now() + ttl,
  });
  const payloadB64 = b64url(payload);
  const sig = await hmacSign(`${normalized}:${ex}:${discountPct}`, s);
  return `${payloadB64}.${sig}`;
}

export async function verifyDealToken(
  token: string,
): Promise<{ email: string; exam: string; discountPct: number } | null> {
  const s = secret();
  if (!token || !s) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { e: string; x: string; d: number; exp: number };
    const expected = await hmacSign(`${parsed.e}:${parsed.x}:${parsed.d}`, s);
    if (sig !== expected) return null;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    if (!parsed.d || parsed.d < 1 || parsed.d > 50) return null;
    return { email: parsed.e, exam: parsed.x, discountPct: parsed.d };
  } catch {
    return null;
  }
}

/** UTM-medium → alennus % (vanhat sähköpostit ilman tokenia). */
export function discountFromUtmMedium(medium: string | null): number | null {
  if (!medium) return null;
  if (medium === "B_hot_deal") return 30;
  if (medium === "C_hot_deal") return 25;
  return null;
}
