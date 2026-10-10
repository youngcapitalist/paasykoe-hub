import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { grantExamAccess } from "../_shared/profile-access.ts";
import { sendProActivatedEmail } from "../_shared/send-pro-activated-email.ts";
import { exitNurtureOnPurchase } from "../_shared/nurture/eligibility.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

// Spring 2027 exam access window (official date TBA). Safe upper bound: end of June 2027.
// Update to the exact exam morning once the 2027 date is published.
const EXAM_ACCESS_UNTIL = "2027-06-30T20:59:59.000Z";

const ONE_TIME_PRODUCT_ID = "prod_USXr5PYWodxpgZ";
// VIP "Takuu" -paketti (€249): grants tier "vip" + vip_access_until (includes Pro).
const VIP_PRICE_ID = "price_1TkiYiJGgBNOSEXE2owRmpF2";
const VIP_PRODUCT_ID = "prod_UkCyWvOC3EcRxm";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body?.sessionId;
    if (!sessionId) throw new Error("sessionId is required");
    logStep("Verifying session", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    });

    logStep("Session retrieved", {
      payment_status: session.payment_status,
      mode: session.mode,
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ activated: false, reason: "not_paid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Determine the email used for payment
    const email =
      session.customer_details?.email ??
      (typeof session.customer === "object" && session.customer && !("deleted" in session.customer)
        ? session.customer.email
        : null);

    if (!email) {
      logStep("No email on session");
      return new Response(
        JSON.stringify({ activated: false, reason: "no_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const lowerEmail = email.toLowerCase();
    logStep("Looking up user by email", { email: lowerEmail });

    // Stop nurture immediately on paid Stripe session — even before account exists.
    try {
      await exitNurtureOnPurchase(supabaseClient, lowerEmail);
      logStep("Nurture streams exited (paid session)");
    } catch (err) {
      logStep("Nurture exit error", { error: String(err) });
    }

    // Find the user in Supabase by email (admin API)
    const { data: usersList, error: listErr } = await supabaseClient.auth.admin.listUsers();
    if (listErr) throw new Error(`Failed to list users: ${listErr.message}`);

    const matchedUser = usersList.users.find(
      (u) => u.email?.toLowerCase() === lowerEmail,
    );

    if (!matchedUser) {
      logStep("No user found yet for paid email", { email: lowerEmail });
      return new Response(
        JSON.stringify({ activated: false, reason: "no_user_yet", email: lowerEmail, nurture_exited: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Activate access
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

    // Detect which product was purchased. VIP grants all Pro access PLUS the
    // VIP tier + Masterclass flag; any other paid session is the €99 Pro access.
    const lineItem = session.line_items?.data?.[0];
    const priceObj = lineItem?.price;
    const purchasedPriceId = typeof priceObj === "object" ? priceObj?.id : undefined;
    const purchasedProductId =
      typeof priceObj?.product === "string" ? priceObj.product : (priceObj?.product as { id?: string } | undefined)?.id;

    const meta = session.metadata ?? {};
    const isWtp = meta.offer_type === "wtp";
    const isNurtureDeal = meta.offer_type === "nurture_deal";
    const wtpTier = meta.offer_tier;
    const liveMasterclasses = meta.live_masterclasses === "true";

    const isWtpVip = isWtp && wtpTier === "vip";
    const isNurtureVip = isNurtureDeal && wtpTier === "vip";
    const isVip =
      purchasedPriceId === VIP_PRICE_ID ||
      purchasedProductId === VIP_PRODUCT_ID ||
      isWtpVip ||
      isNurtureVip;
    const tier = isVip ? "vip" : "pro";
    const grantMasterclass = isWtp ? liveMasterclasses : isVip;
    logStep("Product resolved", { purchasedPriceId, purchasedProductId, isVip, isWtp, liveMasterclasses });

    await grantExamAccess(supabaseClient, {
      userId: matchedUser.id,
      firstName: matchedUser.user_metadata?.first_name ?? null,
      examAccessUntil: EXAM_ACCESS_UNTIL,
      tier,
      stripeCustomerId: customerId,
      grantMasterclass,
    });

    logStep("Access activated", {
      userId: matchedUser.id,
      until: EXAM_ACCESS_UNTIL,
      tier,
    });

    try {
      await sendProActivatedEmail(supabaseClient, {
        recipientEmail: email,
        firstName:
          matchedUser.user_metadata?.first_name ??
          undefined,
        tier,
        idempotencyKey: `pro-activated-${session.id}`,
      });
      logStep("PRO activation email enqueued");
    } catch (err) {
      logStep("Email send error", { error: String(err) });
    }

    return new Response(
      JSON.stringify({
        activated: true,
        tier,
        exam_access_until: EXAM_ACCESS_UNTIL,
        nurture_exited: true,
        ...(grantMasterclass ? { vip_access_until: EXAM_ACCESS_UNTIL } : {}),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
