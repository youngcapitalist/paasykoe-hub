import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  stepsForStream,
  nextSendAtFromEnrollment,
  campaignId,
} from "./sequences.ts";
import { canSendNurture } from "./eligibility.ts";

function jitterMs(maxHours = 48): number {
  return Math.floor(Math.random() * maxHours * 60 * 60 * 1000);
}

export async function enrollStreamB(
  supabase: SupabaseClient,
  email: string,
  exam: string,
  options: { backfill?: boolean } = {},
): Promise<{ ok: boolean; reason?: string }> {
  const lower = email.toLowerCase().trim();
  const ex = exam.toLowerCase();

  const eligible = await canSendNurture(supabase, lower, ex);
  if (!eligible.ok) return { ok: false, reason: eligible.reason };

  const { data: existing } = await supabase
    .from("active_nurture_streams")
    .select("id, status")
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "B")
    .maybeSingle();

  if (existing && !["completed", "unsubscribed", "exited_by_purchase"].includes(existing.status)) {
    return { ok: true, reason: "already_enrolled" };
  }

  // Stream B vain jos EI ilmaistiliä
  const { data: users } = await supabase.auth.admin.listUsers();
  const hasAccount = users?.users?.some((u) => u.email?.toLowerCase() === lower);
  if (hasAccount) return { ok: false, reason: "has_account" };

  const enrolledAt = new Date();
  const steps = stepsForStream("B");
  const firstDelay = steps[0]?.delayDays ?? 0;
  let nextSend = new Date(enrolledAt.getTime() + firstDelay * 24 * 60 * 60 * 1000);
  if (options.backfill) {
    nextSend = new Date(Date.now() + jitterMs());
  }

  const { error } = await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: ex,
      stream_type: "B",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: enrolledAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );

  if (error) {
    console.error("enrollStreamB failed", error);
    return { ok: false, reason: "db_error" };
  }
  return { ok: true };
}

export async function enrollStreamC(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<{ ok: boolean; reason?: string }> {
  const lower = email.toLowerCase().trim();
  const ex = exam.toLowerCase();

  const eligible = await canSendNurture(supabase, lower, ex);
  if (!eligible.ok) return { ok: false, reason: eligible.reason };

  const { data: existing } = await supabase
    .from("active_nurture_streams")
    .select("id, status")
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "C")
    .maybeSingle();

  if (existing && !["completed", "unsubscribed", "exited_by_purchase"].includes(existing.status)) {
    return { ok: true, reason: "already_enrolled" };
  }

  // Pause Stream B — tuotekonteksti voittaa
  await supabase
    .from("active_nurture_streams")
    .update({ status: "paused", updated_at: new Date().toISOString() })
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "B")
    .eq("status", "active");

  const enrolledAt = new Date();
  const steps = stepsForStream("C");
  const firstDelay = steps[0]?.delayDays ?? 1;
  const nextSend = new Date(enrolledAt.getTime() + firstDelay * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: ex,
      stream_type: "C",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: enrolledAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );

  if (error) {
    console.error("enrollStreamC failed", error);
    return { ok: false, reason: "db_error" };
  }
  return { ok: true };
}

export async function enrollMaintenance(
  supabase: SupabaseClient,
  email: string,
  exam: string,
  intervalDays: number,
): Promise<void> {
  const lower = email.toLowerCase().trim();
  const nextSend = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: exam.toLowerCase(),
      stream_type: "maintenance",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );
}

export { campaignId, nextSendAtFromEnrollment, stepsForStream };
