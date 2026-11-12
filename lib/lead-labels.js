/** Ihmisluettavat labelit marketing_leads / _liidit -näkymille. */

export const SOURCE_EXAM = {
  valintakoea: "A",
  valintakoeb: "B",
  valintakoec: "C",
  valintakoee: "E",
  exam_2026_answers_pdf: "F",
  exam_2027_prep: "F",
  f_2026_lead: "F",
  f_2026_customer: "F",
  official_2026_skill_test: "B",
};

export const MAGNET_LABEL = {
  "2026_seo_valmistautuminen": "Edellisen vuoden koe PDF (valmistautumisopas)",
  "2026_exam_pdf": "Edellisen vuoden koe PDF (etusivu)",
  "2026_seo_vastaukset": "2026 vastaukset / tulokset (SEO-sivu)",
  official_2026_skill_test: "Virallinen 2026-taitotesti",
  artikkeli_pdf: "Artikkelin PDF-lataus",
  "article_koe-c-2027-pisterajat-rakenne-ja-paasyvaatimukset": "Artikkeli: Koe C 2027 pisterajat",
  "article_koe-c-oikeat-vastaukset-ja-mallivastaukset": "Artikkeli: Koe C oikeat vastaukset",
  "article_laaketieteen-valintakoe-2027-pisterajat-ja-paasyvaatimukset":
    "Artikkeli: lääkis 2027 pisterajat",
  "article_laaketieteen-valintakoe-oikeat-vastaukset-ja-mallivastaukset":
    "Artikkeli: lääkis oikeat vastaukset",
};

export function examFromLead({ source, metadata, koe }) {
  if (koe) return String(koe).toUpperCase();
  const fromMeta = metadata?.exam;
  if (typeof fromMeta === "string") {
    const m = fromMeta.match(/koe\s*([A-Ia-i])/i);
    if (m) return m[1].toUpperCase();
  }
  return SOURCE_EXAM[source] || "?";
}

export function magnetFromLead({ source, metadata, magnet, magnet_koodi }) {
  if (magnet) return magnet;
  const code =
    magnet_koodi ||
    (typeof metadata?.lead_magnet === "string" ? metadata.lead_magnet : "");
  if (code && MAGNET_LABEL[code]) return MAGNET_LABEL[code];
  if (code) return code;
  if (source === "exam_2026_answers_pdf") return "Edellisen vuoden koe / vastaukset PDF";
  if (source === "official_2026_skill_test") return "Virallinen 2026-taitotesti";
  return "Liidi (ei magnet-koodia)";
}

export function trafficFromLead({ metadata, liikenne, referrer }) {
  if (liikenne) return liikenne;
  const ref =
    referrer || (typeof metadata?.referrer === "string" ? metadata.referrer : "");
  if (!ref) return "Suora / tuntematon";
  if (/google\./i.test(ref)) return "Google";
  if (/bing\./i.test(ref)) return "Bing";
  if (/duckduckgo/i.test(ref)) return "DuckDuckGo";
  if (/yahoo\./i.test(ref)) return "Yahoo";
  if (/paasykoe|xn--psykoe/i.test(ref)) return "Pääsykoe.fi hub";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

export function sourceTypeFromLead(row) {
  if (row.lahde_tyyppi) return row.lahde_tyyppi;
  const code =
    row.magnet_koodi ||
    (typeof row.metadata?.lead_magnet === "string" ? row.metadata.lead_magnet : "");
  const source = row.source || row.lahde || "";
  if (source === "tasotesti") return "Tasotesti";
  if (source === "laudaturpro_quiz") return "Laudatur-kysely";
  if (
    ["2026_seo_valmistautuminen", "2026_exam_pdf", "artikkeli_pdf"].includes(code) ||
    source === "exam_2026_answers_pdf" ||
    /pdf/i.test(code || "")
  ) {
    return "PDF-lataus";
  }
  if (code === "official_2026_skill_test" || source === "official_2026_skill_test") {
    return "Taitotesti";
  }
  if (
    code === "2026_seo_vastaukset" ||
    String(code).startsWith("article_") ||
    source === "pisterajat_turku_aalto_2026"
  ) {
    return "SEO / artikkeli";
  }
  return "Muu liidi";
}

export function isDownloadLead(row) {
  const type = sourceTypeFromLead(row);
  if (["PDF-lataus", "Taitotesti", "SEO / artikkeli", "Tasotesti"].includes(type)) return true;
  const code =
    row.magnet_koodi ||
    (typeof row.metadata?.lead_magnet === "string" ? row.metadata.lead_magnet : "");
  if (code) return true;
  if (row.magnet && /PDF|lataus|taitotesti|tasotesti|vastaukset/i.test(row.magnet)) return true;
  return ["exam_2026_answers_pdf", "official_2026_skill_test", "tasotesti"].includes(
    row.source || row.lahde
  );
}

export function whenFi(iso) {
  const d = new Date(iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (d.getTime() >= start.getTime()) {
    return `tänään ${d.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Helsinki",
    })}`;
  }
  const days = Math.floor(diff / day);
  if (days === 1) return "eilen";
  if (days < 7) return `${days} pv sitten`;
  return d.toLocaleDateString("fi-FI", { timeZone: "Europe/Helsinki" });
}
