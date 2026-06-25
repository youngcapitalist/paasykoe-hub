import { createOfferToken } from "../../../lib/offer-token";
import { wtpScoreToPriceEur, WTP_MAX_EUR, CHECKOUT_MIN_EUR } from "../../../lib/wtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const F_COURSE_URL = process.env.F_COURSE_URL || "https://valintakoefpro.com";

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const examCode = typeof data?.examCode === "string" ? data.examCode.toUpperCase() : "";
  if (examCode !== "F") {
    return Response.json({ error: "wtp_only_f" }, { status: 400 });
  }

  const wtpScore = Number(data?.wtpScore);
  if (!Number.isFinite(wtpScore) || wtpScore < 0 || wtpScore > 1000) {
    return Response.json({ error: "invalid_wtp_score" }, { status: 400 });
  }

  const secret = process.env.OFFER_SIGNING_SECRET;
  if (!secret) {
    console.error("[OFFER] OFFER_SIGNING_SECRET not configured");
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const priceEur = wtpScoreToPriceEur(wtpScore);
  const amountCents = priceEur * 100;

  const token = createOfferToken(
    { exam: "F", amountCents, priceEur, wtpScore, email },
    secret
  );

  return Response.json({
    ok: true,
    token,
    priceEur,
    wtpScore,
    priceRange: { min: CHECKOUT_MIN_EUR, max: WTP_MAX_EUR },
    checkoutUrl: `${F_COURSE_URL}/?offer=${encodeURIComponent(token)}#pricing`,
  });
}
