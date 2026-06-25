// Budjettivalinta → kiinteä PRO-hinta (päättyy 9:ään, hieman alle valitun tason).

export const WTP_MIN_EUR = 0;
export const WTP_MAX_EUR = 999;
export const WTP_OFFER_MIN_EUR = 99;
export const CHECKOUT_MIN_EUR = WTP_OFFER_MIN_EUR;
export const COURSE_CODES = ["A", "B", "C", "E", "F"];
export const WTP_OFFER_EXAM = "F";
export const VIP_MARKUP_EUR = 400;

/** Budjettivaihtoehdon anchor-pisteet → PRO-hinta (€). */
export const BUDGET_ANCHOR_TO_PRICE_EUR = {
  90: 99,
  220: 249,
  520: 549,
  820: 649,
  1000: 949,
};

/** Kolme kalleinta budjettitasoa sisältää live-masterclassit. */
export const LIVE_MASTERCLASS_BUDGET_ANCHORS = new Set([520, 820, 1000]);

export const WTP_CALENDLY_URL = "https://calendly.com/valintakoefpro-info/30min";
export const WTP_CONSULTATION_MIN_EUR = 500;

/** Yli 500 € -paketeissa tarjotaan myös kartoituspuhelu (sama kolme ylintä tasoa). */
export function wtpPriceIncludesConsultation(priceEur) {
  return typeof priceEur === "number" && priceEur > WTP_CONSULTATION_MIN_EUR;
}

export const WTP_QUESTIONS = [
  {
    id: "budget",
    q: "Millaisen taloudellisen investoinnin olet valmis tekemään varmistaaksesi paikkasi ja saavuttaaksesi kilpailuedun muihin hakijoihin nähden?",
    options: [
      {
        label: "Alle 100 €",
        hint: "Haen vain perusmateriaaleja ja luotan täysin omaan, itsenäiseen työhöni.",
        points: 90,
        priceEur: 99,
      },
      {
        label: "100–300 €",
        hint: "Olen valmis sijoittamaan laadukkaaseen teknologiaan ja rakenteeseen säästääkseni aikaa.",
        points: 220,
        priceEur: 249,
      },
      {
        label: "300–700 €",
        hint: "Haluan kaiken datan, simulaatiot ja merkittävän etumatkan muihin hakijoihin.",
        points: 520,
        priceEur: 549,
      },
      {
        label: "Yli 700 €",
        hint: "En halua jättää mitään sattuman varaan. Vaadin parhaat työkalut ja asiantuntijoiden tuen.",
        points: 820,
        priceEur: 649,
      },
      {
        label: "1 000 €",
        hint: "Olen valmis panostamaan täysillä — haluan kaiken mitä tarjotaan ja maksimaalisen tuen.",
        points: 1000,
        priceEur: 949,
      },
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

export const WTP_BUDGET_QUESTION = WTP_QUESTIONS[0];
export const WTP_EXTRA_QUESTIONS = WTP_QUESTIONS.slice(1);

/** Pyöristää alaspäin lähimpään X9-hintaan (esim. 681 → 679). */
export function roundToNine(eur) {
  const n = Math.max(CHECKOUT_MIN_EUR, Math.min(WTP_MAX_EUR, Math.round(eur)));
  return Math.floor(n / 10) * 10 + 9;
}

/** Analytiikkaan: budjettivaihtoehdon anchor-pisteet (ei vaikuta hintaan). */
export function computeWtpScore(wtpAnswers) {
  const budget = wtpAnswers.budget ?? 0;
  return Math.min(1000, Math.max(0, Math.round(budget)));
}

/** Budjettivalinnan anchor → kiinteä PRO-hinta. */
export function wtpScoreToPriceEur(wtpScore) {
  const anchor = Math.min(1000, Math.max(0, Math.round(wtpScore)));
  const mapped = BUDGET_ANCHOR_TO_PRICE_EUR[anchor];
  if (mapped != null) return mapped;
  return roundToNine(CHECKOUT_MIN_EUR);
}

/** VIP Takuu = PRO + 400 € (PRO päättyy 9:ään → VIP myös). */
export function wtpScoreToVipPriceEur(proPriceEur) {
  return proPriceEur + VIP_MARKUP_EUR;
}

/** Live-masterclassit vain kolmella kalleimmalla budjettitasolla. */
export function wtpScoreIncludesLiveMasterclasses(wtpScore) {
  const anchor = Math.min(1000, Math.max(0, Math.round(wtpScore)));
  return LIVE_MASTERCLASS_BUDGET_ANCHORS.has(anchor);
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

/** Ensisijainen kurssi: valittujen kohteiden ja pisteytyksen perusteella. */
export function resolvePrimaryCode(selectedTargets, algorithmCode, scores = {}) {
  const targets = Array.isArray(selectedTargets)
    ? selectedTargets
    : selectedTargets
      ? [selectedTargets]
      : [];

  if (!targets.length || targets.includes("unknown")) {
    return bestCourseFromScores(scores, algorithmCode);
  }

  const courseTargets = targets.filter((t) => qualifiesForCourse(t));
  if (courseTargets.length > 0) {
    const fromSelection = bestAmongCodes(courseTargets, scores);
    if (fromSelection) return fromSelection;
  }

  return bestCourseFromScores(scores, algorithmCode);
}

function bestAmongCodes(codes, scores) {
  let best = null;
  let bestScore = -1;
  for (const code of codes) {
    const s = scores[code] || 0;
    if (s > bestScore) {
      bestScore = s;
      best = code;
    }
  }
  return best;
}

function bestCourseFromScores(scores, algorithmCode) {
  if (qualifiesForCourse(algorithmCode)) return algorithmCode;
  return bestAmongCodes(COURSE_CODES, scores);
}

/** F mukana suosituksissa (valinta, ensisijainen tai testin ehdotus). */
export function recommendationsIncludeF(primaryCode, algorithmCode, selectedTargets = []) {
  if (selectedTargets.includes(WTP_OFFER_EXAM)) return true;
  return qualifiesForWtpOffer(primaryCode) || qualifiesForWtpOffer(algorithmCode);
}
