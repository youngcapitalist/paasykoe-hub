import { supabaseAdminConfig } from "./supabase-admin.js";

const FROM_DEFAULT = "Pääsykoe.fi <onboarding@resend.dev>";

/** Lähettää sähköpostin jaetun Supabase/Resend-jonon kautta. */
export async function sendEmailViaQueue({ to, from, subject, html, label, idempotencyKey, messageId }) {
  const cfg = supabaseAdminConfig();
  if (!cfg) return { error: "no_config" };

  const msgId = messageId || crypto.randomUUID();
  const payload = {
    to,
    from: from || FROM_DEFAULT,
    subject,
    html,
    message_id: msgId,
    idempotency_key: idempotencyKey || msgId,
    label: label || "paasykoe_hub",
    queued_at: new Date().toISOString(),
  };

  const enqueue = await fetch(`${cfg.base}/rest/v1/rpc/enqueue_email`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ queue_name: "transactional_emails", payload }),
  });

  if (!enqueue.ok) {
    const err = await enqueue.text().catch(() => "");
    console.error("[EMAIL QUEUE] enqueue failed", err.slice(0, 200));
    return { error: "enqueue_failed" };
  }

  const process = await fetch(`${cfg.base}/functions/v1/process-email-queue`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}` },
  });

  if (!process.ok) {
    const err = await process.text().catch(() => "");
    console.error("[EMAIL QUEUE] process failed", process.status, err.slice(0, 200));
    return { error: "process_failed", queued: true };
  }

  return { ok: true, via: "queue" };
}
