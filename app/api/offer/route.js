import { createOfferToken } from "../../../lib/offer-token";
import {
  wtpScoreToPriceEur,
  wtpScoreToVipPriceEur,
  WTP_MAX_EUR,
  CHECKOUT_MIN_EUR,
  qualifiesForWtpOffer,
} from "../../../lib/wtp";
import { getCourse } from "../../../app/courses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!qualifiesForWtpOffer(examCode)) {
    return Response.json({ error: "invalid_exam" }, { status: 400 });
  }

  const course = getCourse(examCode);
  if (!course?.href) {
    return Response.json({ error: "no_course_url" }, { status: 400 });
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
  const vipPriceEur = wtpScoreToVipPriceEur(priceEur, wtpScore);
  const amountCents = priceEur * 100;
  const vipAmountCents = vipPriceEur * 100;

  const token = createOfferToken(
    { exam: examCode, amountCents, priceEur, vipAmountCents, vipPriceEur, wtpScore, email },
    secret
  );

  const base = course.href.replace(/\/$/, "");

  return Response.json({
    ok: true,
    token,
    examCode,
    priceEur,
    vipPriceEur,
    wtpScore,
    priceRange: { min: CHECKOUT_MIN_EUR, max: WTP_MAX_EUR },
    checkoutUrl: `${base}/?offer=${encodeURIComponent(token)}#pricing`,
  });
}
