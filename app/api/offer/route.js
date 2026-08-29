import { createOfferToken } from "../../../lib/offer-token";
import {
  wtpScoreToPriceEur,
  wtpScoreToVipPriceEur,
  wtpScoreIncludesLiveMasterclasses,
  WTP_MAX_EUR,
  wtpOfferMinEur,
  qualifiesForWtpOffer,
} from "../../../lib/wtp";
import { getCourse } from "../../../app/courses";
import { enrollInDrip } from "../../../lib/drip/enroll.js";
import { canSendDrip } from "../../../lib/drip/eligibility.js";
import { streamFromExamCode } from "../../../lib/drip/streams.js";
import { painDripHook, wtpBudgetLabelFromScore } from "../../../lib/hub-quiz-labels.js";
import { sendValintakoeQuizOfferEmail } from "../../../lib/quiz-offer-email.js";

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

  const priceEur = wtpScoreToPriceEur(wtpScore, examCode);
  const vipPriceEur = wtpScoreToVipPriceEur(priceEur);
  const liveMasterclasses = wtpScoreIncludesLiveMasterclasses(wtpScore);
  const amountCents = priceEur * 100;
  const vipAmountCents = vipPriceEur * 100;

  const token = createOfferToken(
    {
      exam: examCode,
      amountCents,
      priceEur,
      vipAmountCents,
      vipPriceEur,
      wtpScore,
      email,
      liveMasterclasses,
    },
    secret
  );

  const base = course.href.replace(/\/$/, "");
  const checkoutUrl = `${base}/?offer=${encodeURIComponent(token)}#pricing`;

  const streamConfig = streamFromExamCode(examCode);
  let dripEnrolled = false;
  if (streamConfig) {
    const dripEligible = await canSendDrip(email, streamConfig.id);
    if (dripEligible.ok) {
      const quizMeta = data?.quizMeta && typeof data.quizMeta === "object" ? data.quizMeta : {};
      const painKey = typeof data?.painKey === "string" ? data.painKey : quizMeta.pain_key || null;
      const painLabel =
        typeof data?.painLabel === "string"
          ? data.painLabel
          : quizMeta.pain_label || null;
      const budgetLabel =
        quizMeta.wtp_budget_label || wtpBudgetLabelFromScore(wtpScore) || null;
      const recommendedField =
        typeof data?.recommendedField === "string" ? data.recommendedField : null;
      const preferredField = typeof data?.preferredField === "string" ? data.preferredField : null;

      const drip = await enrollInDrip({
        email,
        stream: streamConfig.id,
        payload: {
          personalTitle: `Valintakoe ${examCode} — henkilökohtainen tarjous`,
          priceEur,
          checkoutUrl,
          examCode,
          painKey,
          painLabel,
          painHook: painDripHook(painKey),
          wtpScore,
          wtpBudgetLabel: budgetLabel,
          wtpCommitmentLabel: quizMeta.wtp_commitment_label || null,
          wtpPriorityLabel: quizMeta.wtp_priority_label || null,
          recommendedField,
          preferredField,
        },
      }).catch((err) => {
        console.error("[DRIP] enroll failed", err);
        return { error: "enroll_exception" };
      });
      if (drip?.ok) dripEnrolled = true;
      if (drip?.error) console.error("[DRIP] enroll rejected", drip);
    }
  }

  const mail = await sendValintakoeQuizOfferEmail({
    email,
    examCode,
    priceEur,
    vipPriceEur,
    checkoutUrl,
    painKey: typeof data?.painKey === "string" ? data.painKey : data?.quizMeta?.pain_key || null,
    painLabel: typeof data?.painLabel === "string" ? data.painLabel : data?.quizMeta?.pain_label || null,
    recommendedField: typeof data?.recommendedField === "string" ? data.recommendedField : null,
    preferredField: typeof data?.preferredField === "string" ? data.preferredField : null,
  }).catch((err) => {
    console.error("[EMAIL] first offer failed", err);
    return { error: "send_exception" };
  });
  if (mail?.error) console.error("[EMAIL] first offer rejected", mail);

  return Response.json({
    ok: true,
    token,
    examCode,
    priceEur,
    vipPriceEur,
    wtpScore,
    liveMasterclasses,
    priceRange: { min: wtpOfferMinEur(examCode), max: WTP_MAX_EUR },
    checkoutUrl,
    emailSent: !!mail?.ok,
    dripEnrolled,
  });
}
