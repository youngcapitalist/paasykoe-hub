// WTP (willingness-to-pay) pisteytys 0–1000 → hinta 99–999 € (koe F).

export const WTP_MIN_EUR = 99;
export const WTP_MAX_EUR = 999;

export const WTP_QUESTIONS = [
  {
    id: "budget",
    q: "Kuinka paljon olet valmis investoimaan valmistautumiseen?",
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
      { label: "Tutkin vaihtoehtoja, en ole vielä varma", points: 60 },
      { label: "Olen päättänyt alan ja haluan valmistautua", points: 200 },
      { label: "Yritän uudelleen — haluan varmasti sisään", points: 350 },
      { label: "Tämä on unelmani — investoin täysillä", points: 500 },
    ],
  },
  {
    id: "priority",
    q: "Kuinka tärkeää sinulle on päästä sisään?",
    options: [
      { label: "Mukava bonus, mutta ei elämäni riipu siitä", points: 50 },
      { label: "Tärkeää, mutta en panosta kaikkea", points: 180 },
      { label: "Erittäin tärkeää — teen mitä tarvitaan", points: 320 },
      { label: "Kaikki tai ei mitään — haluan parhaan tuen", points: 450 },
    ],
  },
];

const PAIN_BOOST = {
  fear: 100,
  compete: 90,
  time: 70,
  unsure: 30,
};

/** Laskee WTP-pisteen 0–1000 vastauksista ja kipupisteestä. */
export function computeWtpScore(wtpAnswers, painKey) {
  let score = 0;
  for (const q of WTP_QUESTIONS) {
    score += wtpAnswers[q.id] ?? 0;
  }
  score += PAIN_BOOST[painKey] ?? 0;
  return Math.min(1000, Math.max(0, score));
}

/** Muuntaa WTP-pisteen hinnaksi 99–999 € (lineaarinen). */
export function wtpScoreToPriceEur(wtpScore) {
  const t = Math.min(1000, Math.max(0, wtpScore)) / 1000;
  return Math.round(WTP_MIN_EUR + t * (WTP_MAX_EUR - WTP_MIN_EUR));
}

export function formatPriceEur(eur) {
  return `${eur} €`;
}
