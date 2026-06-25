import crypto from "crypto";

const OFFER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Luo allekirjoitetun offer-tokenin (HMAC-SHA256). */
export function createOfferToken(payload, secret) {
  if (!secret) throw new Error("OFFER_SIGNING_SECRET missing");
  const body = { ...payload, iat: Date.now(), exp: Date.now() + OFFER_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

/** Palauttaa payloadin tai null jos virheellinen / vanhentunut. */
export function verifyOfferToken(token, secret) {
  if (!token || !secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
