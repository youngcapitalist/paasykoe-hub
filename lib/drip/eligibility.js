import { adminFetch } from "./supabase-admin.js";
import { canonicalEmailKey, normalizeEmail } from "./email-normalize.js";

const PAID_TIERS = new Set(["pro", "vip", "basic"]);

function isPaidProfile(profile) {
  if (!profile) return false;
  if (profile.manual_tier_override) return true;
  const now = Date.now();
  const inFuture = (ts) => ts && new Date(ts).getTime() > now;
  if (inFuture(profile.exam_access_until) || inFuture(profile.vip_access_until)) return true;
  return PAID_TIERS.has(profile.subscription_tier);
}

async function hasLaudaturAccessForEmail(normalized, emailKey) {
  const now = new Date().toISOString();
  for (const filter of [
    `email_key=eq.${encodeURIComponent(emailKey)}`,
    `email=eq.${encodeURIComponent(normalized)}`,
  ]) {
    const { data } = await adminFetch(
      `laudatur_access?${filter}&access_until=gte.${now}&select=id&limit=1`
    );
    if (Array.isArray(data) && data.length > 0) return true;
  }
  return false;
}

/** Onko jo maksanut — ei lähetetä follow-upia. */
export async function isCustomerForStream(email, stream) {
  const emailKey = canonicalEmailKey(email);
  const normalized = normalizeEmail(email);

  if (stream === "laudaturpro") {
    return hasLaudaturAccessForEmail(normalized, emailKey);
  }

  if (stream.startsWith("valintakoe_")) {
    const cfg = (await import("./supabase-admin.js")).supabaseAdminConfig();
    if (!cfg) return false;

    const tryEmail = async (addr) => {
      const authRes = await fetch(`${cfg.base}/auth/v1/admin/users?email=${encodeURIComponent(addr)}`, {
        headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      });
      if (!authRes.ok) return null;
      const authData = await authRes.json().catch(() => ({}));
      const users = authData?.users || (authData?.id ? [authData] : []);
      return users[0] || null;
    };

    let user = await tryEmail(normalizeEmail(email));
    if (!user?.id) {
      const keyAsEmail = emailKey;
      if (keyAsEmail !== normalizeEmail(email)) {
        user = await tryEmail(keyAsEmail);
      }
    }
    if (!user?.id) return false;

    const { data: profiles } = await adminFetch(
      `profiles?user_id=eq.${encodeURIComponent(user.id)}&select=subscription_tier,manual_tier_override,exam_access_until,vip_access_until&limit=1`
    );
    return isPaidProfile(profiles?.[0]);
  }

  return false;
}

export async function isStreamUnsubscribed(email, stream) {
  const normalized = normalizeEmail(email);
  const emailKey = canonicalEmailKey(email);

  const { data } = await adminFetch(
    `marketing_stream_unsubscribes?stream=eq.${encodeURIComponent(stream)}&or=(email_key.eq.${encodeURIComponent(emailKey)},email.eq.${encodeURIComponent(normalized)})&select=email&limit=1`
  );
  if (Array.isArray(data) && data.length > 0) return true;

  const { data: global } = await adminFetch(
    `suppressed_emails?or=(email.eq.${encodeURIComponent(normalized)},email.eq.${encodeURIComponent(emailKey)})&select=email&limit=1`
  );
  return Array.isArray(global) && global.length > 0;
}

export async function canSendDrip(email, stream) {
  if (await isStreamUnsubscribed(email, stream)) return { ok: false, reason: "unsubscribed" };
  if (await isCustomerForStream(email, stream)) return { ok: false, reason: "customer" };
  return { ok: true };
}
