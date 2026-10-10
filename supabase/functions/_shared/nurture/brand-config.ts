/** Per-koe brändäys nurture-sähköposteille (domain, värit, linkit). */

export type ExamCode = "a" | "b" | "c" | "e" | "f";

export type NurtureBrand = {
  exam: ExamCode;
  siteName: string;
  siteUrl: string;
  fromDomain: string;
  fieldLabel: string;
  accentColor: string;
  headerBg: string;
  buttonBg: string;
  buttonText: string;
};

const FIELD_LABELS: Record<ExamCode, string> = {
  a: "tekniikkaa ja luonnontieteitä",
  b: "lääke- ja terveystieteitä",
  c: "biologiaa ja ympäristötieteitä",
  e: "kasvatusalaa",
  f: "kauppatieteitä",
};

const BRANDS: Record<ExamCode, NurtureBrand> = {
  a: {
    exam: "a",
    siteName: "Valintakoe A Pro",
    siteUrl: "https://valintakoea.fi",
    fromDomain: "valintakoea.fi",
    fieldLabel: FIELD_LABELS.a,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  b: {
    exam: "b",
    siteName: "Valintakoe B Pro",
    siteUrl: "https://valintakoeb.fi",
    fromDomain: "valintakoeb.fi",
    fieldLabel: FIELD_LABELS.b,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  c: {
    exam: "c",
    siteName: "Valintakoe C Pro",
    siteUrl: "https://valintakoec.fi",
    fromDomain: "valintakoec.fi",
    fieldLabel: FIELD_LABELS.c,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  e: {
    exam: "e",
    siteName: "Valintakoe E Pro",
    siteUrl: "https://valintakoee.fi",
    fromDomain: "valintakoee.fi",
    fieldLabel: FIELD_LABELS.e,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  f: {
    exam: "f",
    siteName: "Valintakoe F Pro",
    siteUrl: "https://valintakoefpro.com",
    fromDomain: "valintakoefpro.com",
    fieldLabel: FIELD_LABELS.f,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
};

export function getNurtureBrand(exam: string): NurtureBrand {
  const key = exam.toLowerCase() as ExamCode;
  return BRANDS[key] ?? BRANDS.f;
}

export function examFromLeadSource(source: string): ExamCode {
  const s = (source || "").toLowerCase();
  if (s.startsWith("valintakoea") || s.startsWith("hub_a")) return "a";
  if (s.startsWith("valintakoeb") || s.startsWith("hub_b")) return "b";
  if (s.startsWith("valintakoec") || s.startsWith("hub_c")) return "c";
  if (s.startsWith("valintakoee") || s.startsWith("hub_e")) return "e";
  return "f";
}

/** Jaettu nurture-lähetysdomain (Resend). Vaihda pääsykoe.fi kun verified. */
export function nurtureFromDomain(): string {
  return Deno.env.get("NURTURE_FROM_DOMAIN") ?? "valintakoefpro.com";
}

/** Lähettäjä: koe-kohtainen nimi, jaettu verified-domain. */
export function fromHeader(brand: NurtureBrand): string {
  return `${brand.siteName} <noreply@${nurtureFromDomain()}>`;
}

export function examCodeUpper(exam: string): string {
  return exam.toUpperCase();
}
