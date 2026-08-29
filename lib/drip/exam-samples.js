/** Ilmainen teoria- tai professori-näyte valintakoe-drippiin (72 h). */

const UTM = "utm_source=drip&utm_medium=sample72h";

export const EXAM_SAMPLES = {
  B: {
    kind: "teoria",
    url: `https://valintakoeb.fi/teoria/fysikaalinen-kemia-atomit-ja-sidokset?${UTM}`,
    title: "Fysikaalinen kemia: atomit ja sidokset",
    headline: "Kokeile ensimmäistä teoriaosiota ilmaiseksi",
    cta: "Avaa teoriaosuus",
  },
  F: {
    kind: "teoria",
    url: `https://valintakoefpro.com/teoria/taloustieteen-perusteet?${UTM}`,
    title: "Taloustieteen perusteet",
    headline: "Kokeile ensimmäistä teoriaosiota ilmaiseksi",
    cta: "Avaa teoriaosuus",
  },
  A: {
    kind: "professor",
    url: `https://valintakoea.fi/professorit?${UTM}`,
    title: "AI-professorit",
    headline: "Kokeile AI-professoreita ilmaiseksi",
    cta: "Kysy professorilta",
  },
  C: {
    kind: "professor",
    url: `https://valintakoec.fi/professorit?${UTM}`,
    title: "AI-professorit",
    headline: "Kokeile AI-professoreita ilmaiseksi",
    cta: "Kysy professorilta",
  },
  E: {
    kind: "professor",
    url: `https://valintakoee.fi/professorit?${UTM}`,
    title: "AI-professorit",
    headline: "Kokeile AI-professoreita ilmaiseksi",
    cta: "Kysy professorilta",
  },
};

export function examSampleForCode(code) {
  if (!code || typeof code !== "string") return null;
  return EXAM_SAMPLES[code.toUpperCase()] || null;
}
