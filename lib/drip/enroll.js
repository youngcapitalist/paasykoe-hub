import { getStream } from "./streams.js";
import { adminFetch } from "./supabase-admin.js";
import { canonicalEmailKey, normalizeEmail } from "./email-normalize.js";
import { canSendDrip } from "./eligibility.js";

/** Kirjaa liidi follow-up -jonoon (tai päivittää payloadin). */
export async function enrollInDrip({ email, stream, payload = {} }) {
  const normalized = normalizeEmail(email);
  const emailKey = canonicalEmailKey(email);
  const config = getStream(stream);
  if (!config || !normalized) return { error: "invalid_stream" };

  const eligible = await canSendDrip(email, stream);
  if (!eligible.ok) return { error: "not_eligible", reason: eligible.reason };

  const firstStep = config.steps[0];
  const nextSendAt = new Date(Date.now() + firstStep.delayHours * 60 * 60 * 1000).toISOString();

  const row = {
    email: normalized,
    email_key: emailKey,
    stream,
    step_index: 1,
    status: "active",
    payload,
    next_send_at: nextSendAt,
    updated_at: new Date().toISOString(),
  };

  const { error, status } = await adminFetch("lead_drip_enrollments?on_conflict=email_key,stream", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });

  if (error && status !== 409) {
    return { error: "enroll_failed" };
  }

  return { ok: true, stream, nextSendAt, emailKey };
}

export async function markDripConverted(email, stream) {
  const emailKey = canonicalEmailKey(email);
  await adminFetch(
    `lead_drip_enrollments?email_key=eq.${encodeURIComponent(emailKey)}&stream=eq.${encodeURIComponent(stream)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "converted", updated_at: new Date().toISOString() }),
    }
  );
}

export async function recordStreamUnsubscribe(email, stream) {
  const normalized = normalizeEmail(email);
  const emailKey = canonicalEmailKey(email);
  await adminFetch("marketing_stream_unsubscribes", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ email: normalized, email_key: emailKey, stream }),
  });
  await adminFetch(
    `lead_drip_enrollments?email_key=eq.${encodeURIComponent(emailKey)}&stream=eq.${encodeURIComponent(stream)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled", updated_at: new Date().toISOString() }),
    }
  );
}
