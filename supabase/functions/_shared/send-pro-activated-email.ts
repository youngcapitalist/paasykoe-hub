import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type SendProActivatedInput = {
  recipientEmail: string;
  firstName?: string;
  tier?: string;
  idempotencyKey: string;
};

function serviceAuthHeaders() {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return {
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
  };
}

/** Enqueue PRO activation email and trigger the queue worker immediately. */
export async function sendProActivatedEmail(
  supabase: SupabaseClient,
  { recipientEmail, firstName, tier = "pro", idempotencyKey }: SendProActivatedInput,
) {
  const { error } = await supabase.functions.invoke("send-transactional-email", {
    headers: serviceAuthHeaders(),
    body: {
      templateName: "pro-activated",
      recipientEmail,
      idempotencyKey,
      templateData: { firstName, tier },
    },
  });

  if (error) {
    throw new Error(`send-transactional-email: ${error.message}`);
  }

  supabase.functions
    .invoke("process-email-queue", { headers: serviceAuthHeaders() })
    .catch((err) => {
      console.warn("[sendProActivatedEmail] process-email-queue trigger failed", err);
    });
}
