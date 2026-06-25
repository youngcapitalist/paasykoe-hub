// WTP-piste 0–1000 → hinta 0–1000 € (päättyy 9:ään). Kysymykset eivät paljasta hinnoittelua.

export const WTP_MIN_EUR = 0;
export const WTP_MAX_EUR = 999;
export const CHECKOUT_MIN_EUR = 29;
export const COURSE_CODES = ["A", "B", "C", "E", "F"];
export const WTP_OFFER_EXAM = "F";
export const VIP_MARKUP_MIN = 300;
export const VIP_MARKUP_MAX = 600;

export const WTP_QUESTIONS = [
  {
    id: "budget",
    q: "Millaisella panostuksella voisit lähteä valmistautumaan, jos löytäisit sopivan kurssin?",
    options: [
      { label: "Alle 100 €", points: 80 },
      { label: "100–200 €", points: 200 },
      { label: "200–400 €", points: 400 },
      { label: "400–700 €", points: 650 },
      { label: "Yli 700 €", points: 850 },
    ],
  },
  {
    id: "commitment",
    q: "Mikä kuvaa tilannettasi parhaiten?",
    options: [
      { label: "Tutkin vaihtoehtoja, en ole vielä varma", points: 40 },
      { label: "Olen päättänyt alan ja haluan valmistautua", points: 120 },
      { label: "Yritän uudelleen — haluan varmasti sisään", points: 200 },
      { label: "Tämä on unelmani — panostan täysillä", points: 280 },
    ],
  },
  {
    id: "priority",
    q: "Kuinka tärkeää sinulle on päästä sisään?",
    options: [
      { label: "Mukava bonus, mutta ei ratkaise kaikkea", points: 30 },
      { label: "Tärkeää, mutta en panosta kaikkea", points: 100 },
      { label: "Erittäin tärkeää — teen mitä tarvitaan", points: 180 },
      { label: "Kaikki tai ei mitään — haluan varmuuden", points: 260 },
    ],
  },
];

const PAIN_BOOST = { fear: 80, compete: 70, time: 55, unsure: 20 };

/** Pyöristää alaspäin lähimpään X9-hintaan (esim. 681 → 679). */
export function roundToNine(eur) {
  const n = Math.max(CHECKOUT_MIN_EUR, Math.min(WTP_MAX_EUR, Math.round(eur)));
  return Math.floor(n / 10) * 10 + 9;
}

export function computeWtpScore(wtpAnswers, painKey) {
  const budget = wtpAnswers.budget ?? 0;
  const commitment = wtpAnswers.commitment ?? 0;
  const priority = wtpAnswers.priority ?? 0;
  const pain = PAIN_BOOST[painKey] ?? 0;
  const raw = budget * 0.85 + (commitment + priority) * 0.12 + pain * 0.5;
  return Math.min(1000, Math.max(0, Math.round(raw)));
}

export function wtpScoreToPriceEur(wtpScore) {
  const raw = Math.min(1000, Math.max(0, Math.round(wtpScore)));
  if (raw === 0) return roundToNine(CHECKOUT_MIN_EUR);
  return roundToNine(raw);
}

/** VIP = PRO + 300–600 € (wtp-piste skaalaa markupin). */
export function wtpScoreToVipPriceEur(proPriceEur, wtpScore) {
  const t = Math.min(1000, Math.max(0, wtpScore)) / 1000;
  const markup = VIP_MARKUP_MIN + t * (VIP_MARKUP_MAX - VIP_MARKUP_MIN);
  return roundToNine(proPriceEur + markup);
}

export function formatPriceEur(eur) {
  return `${eur} €`;
}

export function qualifiesForCourse(examCode) {
  return COURSE_CODES.includes(examCode);
}

/** Personoitu WTP-hinta vain F-kurssille (vaihe 1). */
export function qualifiesForWtpOffer(examCode) {
  return examCode === WTP_OFFER_EXAM;
}

/** F mukana suosituksissa (ensisijainen tai testin ehdotus). */
export function recommendationsIncludeF(primaryCode, algorithmCode) {
  return qualifiesForWtpOffer(primaryCode) || qualifiesForWtpOffer(algorithmCode);
}

/** Ensisijainen kurssi = käyttäjän valitsema hakukohde (jos kurssi on olemassa). */
export function resolvePrimaryCode(futureTarget, algorithmCode) {
  if (futureTarget && futureTarget !== "unknown" && qualifiesForCourse(futureTarget)) {
    return futureTarget;
  }
  if (qualifiesForCourse(algorithmCode)) return algorithmCode;
  return null;
}
