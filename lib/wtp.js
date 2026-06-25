// WTP-piste 0–1000 → hinta 0–1000 € (koe F). Kysymykset eivät paljasta hinnoittelua.

export const WTP_MIN_EUR = 0;
export const WTP_MAX_EUR = 1000;
/** Stripe vaatii vähintään ~0,50 €; käytännön minimi kurssille. */
export const CHECKOUT_MIN_EUR = 29;

export const WTP_QUESTIONS = [
  {
    id: "support",
    q: "Millaista valmennusta haet?",
    options: [
      { label: "Itsenäinen opiskelu — materiaalit ja tehtävät riittävät", points: 100 },
      { label: "Strukturoitu polku ja palautetta tehtävistä", points: 280 },
      { label: "Henkilökohtaista ohjausta ja nopeita vastauksia", points: 480 },
      { label: "Intensiivistä tukea — lähes kuin lähiopetus", points: 700 },
      { label: "Kaikki mitä tarjotaan — haluan parhaan mahdollisen tuen", points: 950 },
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

/** Laskee WTP-pisteen 0–1000. Pääpaino valmennustason kysymyksessä (~85 %). */
export function computeWtpScore(wtpAnswers, painKey) {
  const support = wtpAnswers.support ?? wtpAnswers.budget ?? 0;
  const commitment = wtpAnswers.commitment ?? 0;
  const priority = wtpAnswers.priority ?? 0;
  const pain = PAIN_BOOST[painKey] ?? 0;
  const raw = support * 0.85 + (commitment + priority) * 0.12 + pain * 0.5;
  return Math.min(WTP_MAX_EUR, Math.max(WTP_MIN_EUR, Math.round(raw)));
}

/** Hinta € suoraan pisteestä (0–1000), Stripe-minimi alaraja. */
export function wtpScoreToPriceEur(wtpScore) {
  const price = Math.min(WTP_MAX_EUR, Math.max(WTP_MIN_EUR, Math.round(wtpScore)));
  if (price === 0) return CHECKOUT_MIN_EUR;
  return Math.max(CHECKOUT_MIN_EUR, price);
}

export function formatPriceEur(eur) {
  return `${eur} €`;
}

/** Onko tulos tai valinta F-kurssille (WTP-funnel). */
export function qualifiesForFOffer(resultCode, futureTarget, preferredCode) {
  return resultCode === "F" || futureTarget === "F" || preferredCode === "F";
}
