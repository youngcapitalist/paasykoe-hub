// Liidien vastaanotto tasotestistä.
// Tallennus järjestyksessä: 1) Supabase (jos SUPABASE_URL + SUPABASE_KEY),
// 2) webhook (LEAD_WEBHOOK_URL, esim. Zapier/Make/CRM), 3) loki.
// Payload sisältää preferred_field + preferred_code liidiryhmittelyä varten.
//
// Jaetussa Supabase-projektissa: käytä JULKISTA (publishable/anon) avainta
// SUPABASE_KEY:ssä. Taulu paasykoe_leads + RLS (ks. supabase/leads.sql) sallii
// vain rivin lisäyksen, ei pääsyä muihin tauluihin.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COURSE_CODES = ["A", "B", "C", "E", "F"]; // alat, joille on kurssi (suositus)
const TARGET_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "unknown"]; // hakukohde

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof data?.email === "string" ? data.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const wtpScore =
    typeof data?.wtpScore === "number" && data.wtpScore >= 0 && data.wtpScore <= 1000
      ? Math.round(data.wtpScore)
      : null;
  const offeredPriceEur =
    typeof data?.offeredPriceEur === "number" && data.offeredPriceEur >= 99 && data.offeredPriceEur <= 1000
      ? Math.round(data.offeredPriceEur)
      : null;

  const lead = {
    email,
    name: typeof data?.name === "string" ? data.name.trim() || null : null,
    // ensisijainen hakukohde -> liidiryhmä (mikä tahansa 9 koetta tai "unknown")
    preferredCode: TARGET_CODES.includes(data?.preferredCode) ? data.preferredCode : null,
    preferredField: typeof data?.preferredField === "string" ? data.preferredField : null,
    // testin suositus (aina jokin kurssikoodi, voi poiketa valitusta)
    recommendedCode: COURSE_CODES.includes(data?.recommendedCode) ? data.recommendedCode : null,
    recommendedField: typeof data?.recommendedField === "string" ? data.recommendedField : null,
    painKey: typeof data?.painKey === "string" ? data.painKey : null,
    scores: data?.scores && typeof data.scores === "object" ? data.scores : null,
    wtpScore,
    offeredPriceEur,
    offerExam: COURSE_CODES.includes(data?.offerExam) ? data.offerExam : null,
    source: "tasotesti",
    receivedAt: new Date().toISOString(),
  };

  // 1) Supabase
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supaUrl && supaKey) {
    // Normalisoi: poista mahdollinen /rest/v1(/) ja loppukauttaviivat,
    // jotta sekä perus-URL että REST-endpoint kelpaavat.
    const base = supaUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
    // Ihmisluettavat kentät Supabasen taulunäkymää varten
    const bestExam =
      lead.recommendedCode && lead.recommendedField
        ? `Valintakoe ${lead.recommendedCode} — ${lead.recommendedField}`
        : null;
    const preferredExam =
      lead.preferredCode === "unknown"
        ? "En tiedä vielä"
        : lead.preferredCode && lead.preferredField
        ? `Valintakoe ${lead.preferredCode} — ${lead.preferredField}`
        : null;
    try {
      const res = await fetch(`${base}/rest/v1/valintakoe_hub_leads`, {
        method: "POST",
        headers: {
          apikey: supaKey,
          Authorization: `Bearer ${supaKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: lead.email,
          name: lead.name,
          best_exam: bestExam,
          preferred_exam: preferredExam,
          preferred_code: lead.preferredCode,
          preferred_field: lead.preferredField,
          recommended_code: lead.recommendedCode,
          recommended_field: lead.recommendedField,
          pain_key: lead.painKey,
          scores: lead.scores,
          wtp_score: lead.wtpScore,
          offered_price_eur: lead.offeredPriceEur,
          offer_exam: lead.offerExam,
          source: lead.source,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[LEAD] supabase failed", res.status, txt);
        return Response.json({ error: "supabase_failed" }, { status: 502 });
      }
      return Response.json({ ok: true });
    } catch (err) {
      console.error("[LEAD] supabase error", err);
      return Response.json({ error: "supabase_error" }, { status: 502 });
    }
  }

  // 2) Webhook
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        console.error("[LEAD] webhook responded", res.status);
        return Response.json({ error: "webhook_failed" }, { status: 502 });
      }
    } catch (err) {
      console.error("[LEAD] webhook error", err);
      return Response.json({ error: "webhook_error" }, { status: 502 });
    }
  } else {
    // 3) Ei tallennusta konfiguroituna — kirjataan lokiin, jotta liidi ei katoa.
    console.log("[LEAD]", JSON.stringify(lead));
  }

  return Response.json({ ok: true });
}
