import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PAID_TIERS = new Set(["pro", "vip", "basic"]);

function isPaidProfile(profile: Record<string, unknown> | null): boolean {
  if (!profile) return false;
  if (profile.manual_tier_override) return true;
  if (profile.is_customer === true) return true;
  const now = Date.now();
  const inFuture = (ts: unknown) => ts && new Date(ts as string).getTime() > now;
  if (inFuture(profile.exam_access_until) || inFuture(profile.vip_access_until)) return true;
  return PAID_TIERS.has(profile.subscription_tier as string);
}

export async function isCustomerEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  const lower = email.toLowerCase().trim();

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (!user?.id) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, manual_tier_override, exam_access_until, vip_access_until, is_customer, nurture_unsubscribed")
    .eq("user_id", user.id)
    .maybeSingle();

  return isPaidProfile(profile);
}

export async function isNurtureUnsubscribed(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<boolean> {
  const lower = email.toLowerCase().trim();

  const { data: global } = await supabase
    .from("suppressed_emails")
    .select("email")
    .eq("email", lower)
    .maybeSingle();
  if (global) return true;

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nurture_unsubscribed")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.nurture_unsubscribed) return true;
  }

  const { data: streamUnsub } = await supabase
    .from("active_nurture_streams")
    .select("status")
    .eq("email", lower)
    .eq("exam", exam.toLowerCase())
    .eq("status", "unsubscribed")
    .limit(1);
  if (streamUnsub && streamUnsub.length > 0) return true;

  return false;
}

export async function canSendNurture(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (await isNurtureUnsubscribed(supabase, email, exam)) {
    return { ok: false, reason: "unsubscribed" };
  }
  if (await isCustomerEmail(supabase, email)) {
    return { ok: false, reason: "customer" };
  }
  return { ok: true };
}

/** Poistu kaikista nurture-virroista oston jälkeen. */
export async function exitNurtureOnPurchase(
  supabase: SupabaseClient,
  email: string,
): Promise<void> {
  const lower = email.toLowerCase().trim();
  const now = new Date().toISOString();

  await supabase
    .from("active_nurture_streams")
    .update({ status: "exited_by_purchase", updated_at: now })
    .eq("email", lower)
    .in("status", ["active", "paused"]);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (user?.id) {
    await supabase
      .from("profiles")
      .update({ is_customer: true, updated_at: now })
      .eq("user_id", user.id);
  }
}
