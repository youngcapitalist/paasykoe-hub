import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import type { NurtureBrand } from "./brand-config.ts";

export type QueueEmailParams = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  label: string;
  idempotencyKey: string;
  unsubscribeUrl?: string;
};

export type NurtureTestContext = {
  exam: string;
  siteName: string;
  streamType?: string;
  stepIndex?: number;
  stepTotal?: number;
};

/** Jos NURTURE_TEST_RECIPIENT on asetettu, kaikki nurture menee sinne (ei oikeille liideille). */
export function applyNurtureTestRouting(
  originalTo: string,
  params: Pick<QueueEmailParams, "subject" | "html" | "text">,
  ctx?: NurtureTestContext,
): { to: string; subject: string; html: string; text?: string; isTestMode: boolean } {
  const testTo = Deno.env.get("NURTURE_TEST_RECIPIENT")?.trim().toLowerCase();
  if (!testTo) {
    return { to: originalTo, subject: params.subject, html: params.html, text: params.text, isTestMode: false };
  }

  const exam = ctx?.exam?.toUpperCase() ?? "?";
  const stream = ctx?.streamType ?? "";
  const step =
    ctx?.stepIndex != null && ctx?.stepTotal != null
      ? ` · viesti ${ctx.stepIndex + 1}/${ctx.stepTotal}`
      : "";
  const site = ctx?.siteName ?? `Koe ${exam}`;
  const tag = `[TEST · ${site}${stream ? ` · ${stream}` : ""}${step}]`;

  const topBanner =
    `<div style="background:#fef3c7;border:2px solid #d97706;border-radius:8px;padding:12px 16px;margin:0 0 16px;text-align:center">` +
    `<strong style="color:#92400e;font-size:13px">TEST MODE</strong>` +
    `<p style="margin:6px 0 0;font-size:12px;color:#78350f">${site} · Stream ${stream || "?"}${step}<br>` +
    `Alkuperäinen vastaanottaja: ${originalTo}</p></div>`;

  const bottomBanner =
    `<p style="font-size:11px;color:#999;text-align:center;margin-top:16px">` +
    `TEST MODE · ${site} · ${originalTo}</p>`;

  const html = params.html.includes("<body")
    ? params.html.replace(/<body([^>]*)>/, `<body$1>${topBanner}`)
    : `${topBanner}${params.html}`;

  return {
    to: testTo,
    subject: `${tag} ${params.subject}`,
    html: html.replace("</body>", `${bottomBanner}</body>`),
    text: params.text
      ? `${tag}\n${params.text}\n\n(TEST → ${originalTo})`
      : `${tag} (TEST → ${originalTo})`,
    isTestMode: true,
  };
}

export async function enqueueNurtureEmail(
  supabase: SupabaseClient,
  params: QueueEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  const messageId = crypto.randomUUID();
  const payload = {
    to: params.to,
    from: params.from,
    subject: params.subject,
    html: params.html,
    text: params.text,
    message_id: messageId,
    idempotency_key: params.idempotencyKey,
    label: params.label,
    queued_at: new Date().toISOString(),
  };

  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });

  if (error) {
    console.error("enqueueNurtureEmail failed", error);
    return { ok: false, error: error.message };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (supabaseUrl && serviceKey) {
    fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceKey}` },
    }).catch(() => {});
  }

  return { ok: true };
}

/** Lähetä kopio seurantaosoitteeseen (NURTURE_MIRROR_EMAIL). */
export async function mirrorToTestInbox(
  supabase: SupabaseClient,
  params: QueueEmailParams,
  originalTo: string,
  ctx?: NurtureTestContext,
): Promise<void> {
  const mirror = Deno.env.get("NURTURE_MIRROR_EMAIL");
  if (!mirror) return;

  const exam = ctx?.exam?.toUpperCase() ?? "?";
  const stream = ctx?.streamType ?? "";
  const step =
    ctx?.stepIndex != null && ctx?.stepTotal != null
      ? ` · viesti ${ctx.stepIndex + 1}/${ctx.stepTotal}`
      : "";
  const site = ctx?.siteName ?? `Koe ${exam}`;
  const tag = `[KOPIO · ${site}${stream ? ` · ${stream}` : ""}${step}]`;

  const banner =
    `<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;padding:12px 16px;margin:0 0 16px;text-align:center">` +
    `<strong style="color:#1d4ed8;font-size:13px">SEURANTAKOPIO</strong>` +
    `<p style="margin:6px 0 0;font-size:12px;color:#1e40af">${site}${stream ? ` · Stream ${stream}` : ""}${step}<br>` +
    `Lähetetty myös: <strong>${originalTo}</strong></p></div>`;

  const html = params.html.includes("<body")
    ? params.html.replace(/<body([^>]*)>/, `<body$1>${banner}`)
    : `${banner}${params.html}`;
  const text = params.text
    ? `${tag}\n(KOPIO → ${originalTo})\n\n${params.text}`
    : `${tag} (KOPIO → ${originalTo})`;

  await enqueueNurtureEmail(supabase, {
    ...params,
    to: mirror,
    subject: `${tag} ${params.subject}`,
    html,
    text,
    idempotencyKey: `${params.idempotencyKey}_mirror`,
    label: `${params.label}_mirror`,
  });
}
