import crypto from "crypto";
import { normalizeEmail } from "./email-normalize.js";

function secret() {
  return process.env.DRIP_SIGNING_SECRET || process.env.OFFER_SIGNING_SECRET || "";
}

export function signUnsubscribeToken(email, stream) {
  const s = secret();
  if (!s) throw new Error("DRIP_SIGNING_SECRET missing");
  const normalized = normalizeEmail(email);
  const payload = `${normalized}:${stream}`;
  const sig = crypto.createHmac("sha256", s).update(payload).digest("base64url");
  return (
    Buffer.from(
      JSON.stringify({ e: normalized, s: stream, exp: Date.now() + 90 * 24 * 60 * 60 * 1000 })
    ).toString("base64url") +
    "." +
    sig
  );
}

export function verifyUnsubscribeToken(token) {
  const s = secret();
  if (!token || !s) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const expected = crypto
      .createHmac("sha256", s)
      .update(`${parsed.e}:${parsed.s}`)
      .digest("base64url");
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { email: parsed.e, stream: parsed.s };
  } catch {
    return null;
  }
}

export function unsubscribeUrl(email, stream, siteUrl = "https://laudaturpro.fi") {
  const token = signUnsubscribeToken(email, stream);
  return `${siteUrl.replace(/\/$/, "")}/peruuta?token=${encodeURIComponent(token)}`;
}
