/** Allekirjoitetut nurture-peruutustokenit. */

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

export async function signUnsubscribeToken(
  email: string,
  exam: string,
): Promise<string> {
  const s = secret();
  if (!s) throw new Error("NURTURE_SIGNING_SECRET missing");
  const normalized = email.toLowerCase().trim();
  const payload = JSON.stringify({
    e: normalized,
    x: exam.toLowerCase(),
    exp: Date.now() + 90 * 24 * 60 * 60 * 1000,
  });
  const payloadB64 = b64url(payload);
  const sig = await hmacSign(`${normalized}:${exam.toLowerCase()}`, s);
  return `${payloadB64}.${sig}`;
}

export async function verifyUnsubscribeToken(
  token: string,
): Promise<{ email: string; exam: string } | null> {
  const s = secret();
  if (!token || !s) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { e: string; x: string; exp: number };
    const expected = await hmacSign(`${parsed.e}:${parsed.x}`, s);
    if (sig !== expected) return null;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { email: parsed.e, exam: parsed.x };
  } catch {
    return null;
  }
}

export async function unsubscribeUrl(
  email: string,
  exam: string,
  siteUrl: string,
): Promise<string> {
  const token = await signUnsubscribeToken(email, exam);
  return `${siteUrl.replace(/\/$/, "")}/peruuta-nurture?token=${encodeURIComponent(token)}`;
}

/** Edge function URL one-click unsubscribe (RFC 8058). */
export async function unsubscribeApiUrl(email: string, exam: string): Promise<string> {
  const token = await signUnsubscribeToken(email, exam);
  const base = Deno.env.get("SUPABASE_URL") ?? "";
  return `${base}/functions/v1/nurture-unsubscribe?token=${encodeURIComponent(token)}`;
}
