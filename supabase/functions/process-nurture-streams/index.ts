import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getNurtureBrand, fromHeader } from "../_shared/nurture/brand-config.ts";
import {
  stepsForStream,
  campaignId,
  maintenanceIntervalDays,
  maintenanceStepFor,
  type NurtureStep,
} from "../_shared/nurture/sequences.ts";
import { renderNurtureEmail, ctaUrlForStep, weaknessHintFromPain } from "../_shared/nurture/templates.ts";
import { canSendNurture } from "../_shared/nurture/eligibility.ts";
import { enrollMaintenance } from "../_shared/nurture/enroll.ts";
import { unsubscribeUrl, unsubscribeApiUrl } from "../_shared/nurture/unsubscribe-token.ts";
import { enqueueNurtureEmail, mirrorToTestInbox, applyNurtureTestRouting } from "../_shared/nurture/send-via-queue.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function stepDueAt(enrolledAt: Date, step: NurtureStep): Date {
  return new Date(enrolledAt.getTime() + step.delayDays * 24 * 60 * 60 * 1000);
}

async function resolveWeaknessHint(
  supabase: ReturnType<typeof createClient>,
  email: string,
): Promise<string> {
  const lower = email.toLowerCase();
  const { data: hub } = await supabase
    .from("valintakoe_hub_leads")
    .select("pain_key")
    .eq("email", lower)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (hub?.pain_key) return weaknessHintFromPain(hub.pain_key);

  const { data: mkt } = await supabase
    .from("marketing_leads")
    .select("metadata")
    .eq("email", lower)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const meta = (mkt?.metadata ?? {}) as Record<string, unknown>;
  const pain = (meta.pain_key as string) || (meta.weakness as string) || null;
  return weaknessHintFromPain(pain);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const now = new Date();
  const results = { processed: 0, sent: 0, skipped: 0, exited: 0, errors: 0 };

  const { data: due, error: queryErr } = await supabase
    .from("active_nurture_streams")
    .select("*")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .order("next_send_at", { ascending: true })
    .limit(50);

  if (queryErr) {
    console.error("Query failed", queryErr);
    return new Response(JSON.stringify({ error: "query_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cache auth users once per cron run
  const { data: allUsersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const usersByEmail = new Map(
    (allUsersData?.users ?? [])
      .filter((u) => u.email)
      .map((u) => [u.email!.toLowerCase(), u]),
  );

  for (const row of due ?? []) {
    results.processed++;
    const { email, exam, stream_type: streamType, current_step_index: curIdx, id } = row;
    const enrolledAt = new Date(row.enrolled_at);

    const eligibility = await canSendNurture(supabase, email, exam);
    if (!eligibility.ok) {
      const status = eligibility.reason === "customer" ? "exited_by_purchase" : "unsubscribed";
      await supabase
        .from("active_nurture_streams")
        .update({ status, updated_at: now.toISOString() })
        .eq("id", id);
      results.exited++;
      continue;
    }

    const brand = getNurtureBrand(exam);
    let stepIndex = curIdx + 1;
    let step: NurtureStep;

    if (streamType === "maintenance") {
      step = maintenanceStepFor(exam, stepIndex);
    } else if (streamType === "passive") {
      const user = usersByEmail.get(email.toLowerCase());
      let lastLogin: Date | null = null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("last_login_at")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof?.last_login_at) lastLogin = new Date(prof.last_login_at);
      }
      const daysSince = lastLogin
        ? (now.getTime() - lastLogin.getTime()) / (24 * 60 * 60 * 1000)
        : 999;
      step =
        daysSince > 45
          ? { template: "T2_SMALL_STEP", delayDays: 0 }
          : { template: "T3_DELETE_PLAN", delayDays: 0 };
      stepIndex = curIdx + 1;
    } else {
      const steps = stepsForStream(streamType, exam);
      if (stepIndex >= steps.length) {
        await supabase
          .from("active_nurture_streams")
          .update({ status: "completed", updated_at: now.toISOString() })
          .eq("id", id);
        await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
        continue;
      }
      step = steps[stepIndex];
      const dueAt = stepDueAt(enrolledAt, step);
      if (dueAt > now) {
        await supabase
          .from("active_nurture_streams")
          .update({ next_send_at: dueAt.toISOString(), updated_at: now.toISOString() })
          .eq("id", id);
        results.skipped++;
        continue;
      }
    }

    const campId = campaignId(exam, streamType, stepIndex);

    // Idempotenssi
    const { data: existingLog } = await supabase
      .from("nurture_log")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("campaign_id_text", campId)
      .maybeSingle();

    if (existingLog) {
      results.skipped++;
      const steps = stepsForStream(streamType, exam);
      const nextIdx = stepIndex + 1;
      let nextSend: string;
      if (streamType === "maintenance" || streamType === "passive") {
        nextSend = new Date(now.getTime() + maintenanceIntervalDays() * 24 * 60 * 60 * 1000).toISOString();
      } else if (nextIdx >= steps.length) {
        await supabase
          .from("active_nurture_streams")
          .update({ status: "completed", current_step_index: stepIndex, updated_at: now.toISOString() })
          .eq("id", id);
        await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
        continue;
      } else {
        nextSend = stepDueAt(enrolledAt, steps[nextIdx]).toISOString();
      }
      await supabase
        .from("active_nurture_streams")
        .update({
          current_step_index: stepIndex,
          next_send_at: nextSend,
          updated_at: now.toISOString(),
        })
        .eq("id", id);
      continue;
    }

    // Hae etunimi
    let firstName: string | null = null;
    const user = usersByEmail.get(email.toLowerCase());
    if (user?.id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("user_id", user.id)
        .maybeSingle();
      firstName = prof?.first_name ?? user.user_metadata?.first_name ?? null;
    }

    const weaknessHint =
      exam.toLowerCase() === "f" && streamType === "B" && step.template === "T4_UNREAD"
        ? await resolveWeaknessHint(supabase, email)
        : null;

    const unsubLink = await unsubscribeUrl(email, exam, brand.siteUrl);
    const ctaUrl = await ctaUrlForStep(brand, streamType, step, email);
    const rendered = renderNurtureEmail({
      email,
      firstName,
      brand,
      step,
      streamType,
      unsubscribeUrl: unsubLink,
      ctaUrl,
      weaknessHint,
    });

    const streamSteps = stepsForStream(streamType, exam);
    const stepTotal =
      streamType === "maintenance" && exam.toLowerCase() === "f"
        ? streamSteps.length
        : streamSteps.length;
    const routed = applyNurtureTestRouting(email, {
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }, {
      exam,
      siteName: brand.siteName,
      streamType,
      stepIndex: stepIndex,
      stepTotal,
    });

    const emailParams = {
      to: routed.to,
      from: fromHeader(brand),
      subject: routed.subject,
      html: routed.html,
      text: routed.text,
      label: `nurture_${campId}`,
      idempotencyKey: campId,
      unsubscribeUrl: await unsubscribeApiUrl(email, exam),
    };

    const sendResult = await enqueueNurtureEmail(supabase, emailParams);
    if (!sendResult.ok) {
      results.errors++;
      continue;
    }

    if (!routed.isTestMode) {
      await mirrorToTestInbox(supabase, emailParams, email, {
        exam,
        siteName: brand.siteName,
        streamType,
        stepIndex: stepIndex,
        stepTotal,
      });
    }

    await supabase.from("nurture_log").insert({
      email: email.toLowerCase(),
      exam: exam.toLowerCase(),
      step: stepIndex,
      campaign_id_text: campId,
      sent_at: now.toISOString(),
    });

    results.sent++;

    const steps = stepsForStream(streamType, exam);
    const nextIdx = stepIndex + 1;
    let nextSend: string;
    let newStatus = "active";

    if (streamType === "maintenance" || streamType === "passive") {
      nextSend = new Date(now.getTime() + maintenanceIntervalDays() * 24 * 60 * 60 * 1000).toISOString();
    } else if (nextIdx >= steps.length) {
      newStatus = "completed";
      nextSend = now.toISOString();
    } else {
      nextSend = stepDueAt(enrolledAt, steps[nextIdx]).toISOString();
    }

    await supabase
      .from("active_nurture_streams")
      .update({
        current_step_index: stepIndex,
        last_sent_at: now.toISOString(),
        next_send_at: nextSend,
        status: newStatus,
        updated_at: now.toISOString(),
      })
      .eq("id", id);

    if (newStatus === "completed") {
      await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
    }
  }

  return new Response(JSON.stringify({ ok: true, ...results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
