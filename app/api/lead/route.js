// Liidien vastaanotto tasotestistä.
// Jos ympäristömuuttuja LEAD_WEBHOOK_URL on asetettu (esim. Zapier/Make/CRM),
// liidi lähetetään sinne. Muuten se kirjataan lokiin (näkyy palvelulokeissa).
// Payload sisältää preferredField + preferredCode liidiryhmittelyä varten.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CODES = ["A", "B", "C", "E", "F"];

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

  const lead = {
    email,
    name: typeof data?.name === "string" ? data.name.trim() || null : null,
    // ensisijainen hakukohde -> liidiryhmä
    preferredCode: ALLOWED_CODES.includes(data?.preferredCode) ? data.preferredCode : null,
    preferredField: typeof data?.preferredField === "string" ? data.preferredField : null,
    // testin suositus (voi poiketa valitusta)
    recommendedCode: ALLOWED_CODES.includes(data?.recommendedCode) ? data.recommendedCode : null,
    recommendedField: typeof data?.recommendedField === "string" ? data.recommendedField : null,
    painKey: typeof data?.painKey === "string" ? data.painKey : null,
    scores: data?.scores && typeof data.scores === "object" ? data.scores : null,
    source: "tasotesti",
    receivedAt: new Date().toISOString(),
  };

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
    // Ei webhookia konfiguroituna — kirjataan lokiin, jotta liidi ei katoa.
    console.log("[LEAD]", JSON.stringify(lead));
  }

  return Response.json({ ok: true });
}
