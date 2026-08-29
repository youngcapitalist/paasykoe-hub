/** Ensimmäinen tarjousposti valintakoe-tasotestin jälkeen (Resend / jono). */

import { unsubscribeUrl } from "./drip/unsubscribe-token.js";
import { sendEmailViaQueue } from "./drip/email-queue.js";
import { offerBoxHtml, bulletsHtml, urgencyHtml } from "./drip/email-blocks.js";
import { getStream } from "./drip/streams.js";
import { painDripHook } from "./hub-quiz-labels.js";

export async function sendValintakoeQuizOfferEmail({
  email,
  examCode,
  priceEur,
  vipPriceEur,
  checkoutUrl,
  painKey,
  painLabel,
  recommendedField,
  preferredField,
}) {
  if (!email || !examCode || !priceEur || !checkoutUrl) return { skipped: true };

  const streamId = `valintakoe_${examCode.toLowerCase()}`;
  const streamConfig = getStream(streamId);
  const brand = streamConfig?.brand || `Valintakoe ${examCode}`;
  const from = process.env.RESEND_FROM || `${brand} <onboarding@resend.dev>`;
  const apiKey = process.env.RESEND_API_KEY;

  const unsubOrigin =
    process.env.DRIP_UNSUBSCRIBE_ORIGIN?.replace(/\/$/, "") || "https://laudaturpro.fi";
  const unsub = unsubscribeUrl(email, streamId, unsubOrigin);
  const cta = checkoutUrl.startsWith("http") ? checkoutUrl : `${streamConfig?.siteUrl || ""}${checkoutUrl}`;

  const payload = {
    personalTitle: `Valintakoe ${examCode} — henkilökohtainen tarjous`,
    priceEur,
    listPriceEur: vipPriceEur && vipPriceEur > priceEur ? vipPriceEur : undefined,
    recommendedField: recommendedField || preferredField,
    preferredField,
  };

  const hook = painDripHook(painKey);
  const intro = hook
    ? `${hook}<br><br>`
    : painLabel
      ? `${painLabel}<br><br>`
      : "";

  const bullets = [
    "Teoria ja harjoituskokeet samassa alustassa",
    "AI-professori kehityskohteisiin — rajattomasti",
    "Simuloidut kokeet oikeaan tempoan",
    `Henkilökohtainen hintasi ${priceEur} € — ei julkisesti saatavilla`,
  ];

  const html = `<!DOCTYPE html>
<html lang="fi">
<body style="margin:0;background:#f4f6f8;font-family:system-ui,sans-serif;color:#0A2540">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#0A2540;color:#fff;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#D4AF37">Vain sinulle</p>
      <h1 style="margin:12px 0 0;font-size:26px;line-height:1.2">Valintakoe ${examCode} — suunnitelmasi on valmis</h1>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 24px;border:1px solid #e5e7eb;border-top:0">
      <p style="margin:0 0 16px;line-height:1.65;color:#334155;font-size:15px">
        ${intro}
        Tässä on <strong>henkilökohtainen tarjouksesi</strong> tasotestin tulosten perusteella.
        Linkki ja hinta ovat sidottu juuri sinun valintoihisi — et näe samaa hintaa julkisesti.
      </p>
      ${offerBoxHtml(payload, cta)}
      ${bulletsHtml(bullets)}
      ${urgencyHtml("Tarjous voimassa 7 päivää. Sen jälkeen henkilökohtaista hintaa ei voi lunastaa samoilla valinnoilla.")}
      <a href="${cta}" style="display:block;text-align:center;background:#D4AF37;color:#0A2540;font-weight:800;text-decoration:none;padding:16px 24px;border-radius:999px;font-size:15px">Avaa minun suunnitelmani</a>
      <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;text-align:center">
        <a href="${unsub}" style="color:#64748b">Peru markkinointi (${brand})</a>
        · Jos olet jo asiakas, voit jättää tämän huomiotta
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin:16px 0 0">Pääsykoe.fi · valintakokeisiin 2027</p>
  </div>
</body>
</html>`;

  const subject = `Valintakoe ${examCode} — henkilökohtainen tarjouksesi ${priceEur} €`;

  if (!apiKey) {
    return sendEmailViaQueue({
      to: email,
      from,
      subject,
      html,
      label: `valintakoe_first_offer_${examCode.toLowerCase()}`,
      unsubscribeUrl: unsub,
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("[EMAIL] resend failed", res.status, err.slice(0, 200));
    return { error: "send_failed" };
  }
  return { ok: true };
}
