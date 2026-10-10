import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type GrantAccessInput = {
  userId: string;
  firstName?: string | null;
  examAccessUntil: string;
  tier: "pro" | "vip";
  stripeCustomerId?: string | null;
  grantMasterclass?: boolean;
};

/** Updates profile access; inserts a row if the signup trigger did not create one. */
export async function grantExamAccess(
  supabase: SupabaseClient,
  {
    userId,
    firstName,
    examAccessUntil,
    tier,
    stripeCustomerId,
    grantMasterclass = false,
  }: GrantAccessInput,
) {
  const payload = {
    exam_access_until: examAccessUntil,
    subscription_tier: tier,
    had_subscription: true,
    is_customer: true,
    ...(grantMasterclass
      ? { vip_access_until: examAccessUntil, has_vip_access: true }
      : {}),
    ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
  };

  const { data: updated, error: updateErr } = await supabase
    .from("profiles")
    .update(payload)
    .eq("user_id", userId)
    .select("user_id");

  if (updateErr) throw updateErr;
  if (updated && updated.length > 0) return;

  const { error: insertErr } = await supabase.from("profiles").insert({
    user_id: userId,
    free_questions_used: 0,
    first_name: firstName ?? null,
    ...payload,
  });
  if (insertErr) throw insertErr;
}
