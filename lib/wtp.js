// Budjettivalinta → PRO-hinta hieman alle WTP:n (päättyy 9:ään). B-minimi 149 €.

export const WTP_MIN_EUR = 0;
export const WTP_MAX_EUR = 999;
export const WTP_OFFER_MIN_EUR = 99;
export const CHECKOUT_MIN_EUR = WTP_OFFER_MIN_EUR;
export const COURSE_CODES = ["A", "B", "C", "E", "F"];
export const WTP_OFFER_EXAMS = COURSE_CODES;
export const VIP_MARKUP_EUR = 400;

/** B:n listahinta / F:n listahinta (149 € / 99 €). */
export const B_PRICE_MULTIPLIER = 149 / 99;

export const WTP_OFFER_MIN_BY_EXAM = {
  B: 149,
};

/** Ensisijainen PRO-hinta: aina hieman alle WTP-anchorin (X9). */
export const BUDGET_ANCHOR_TO_PRICE_EUR = {
  90: 99,
  220: 199,
  520: 499,
  820: 799,
  1000: 979,
};

/** Kolme kalleinta budjettitasoa sisältää live-masterclassit. */
export const LIVE_MASTERCLASS_BUDGET_ANCHORS = new Set([520, 820, 1000]);

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
        priceEur: 199,
      },
      {
        label: "300–700 €",
        hint: "Haluan kaiken datan, simulaatiot ja merkittävän etumatkan muihin hakijoihin.",
        points: 520,
        priceEur: 499,
      },
      {
        label: "Yli 700 €",
        hint: "En halua jättää mitään sattuman varaan. Vaadin parhaat työkalut ja asiantuntijoiden tuen.",
        points: 820,
        priceEur: 799,
      },
      {
        label: "1 000 €",
        hint: "Olen valmis panostamaan täysillä — haluan kaiken mitä tarjotaan ja maksimaalisen tuen.",
        points: 1000,
        priceEur: 979,
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
export function roundToNine(eur, minEur = CHECKOUT_MIN_EUR) {
  const n = Math.max(minEur, Math.min(WTP_MAX_EUR, Math.round(eur)));
  return Math.max(minEur, Math.floor((n - 9) / 10) * 10 + 9);
}

export function wtpPriceMultiplier(examCode) {
  return examCode === "B" ? B_PRICE_MULTIPLIER : 1;
}

export function wtpOfferMinEur(examCode) {
  return WTP_OFFER_MIN_BY_EXAM[examCode] ?? WTP_OFFER_MIN_EUR;
}

/** Analytiikkaan: budjettivaihtoehdon anchor-pisteet (ei vaikuta hintaan). */
export function computeWtpScore(wtpAnswers) {
  const budget = wtpAnswers.budget ?? 0;
  return Math.min(1000, Math.max(0, Math.round(budget)));
}

/** Yläraja: lähin X9-hinta alle WTP:n. Alle tuoteminimin → tuoteminimi. */
export function wtpBudgetCeilingEur(wtpScore, examCode = "F") {
  const anchor = Math.min(1000, Math.max(0, Math.round(Number(wtpScore) || 0)));
  const min = wtpOfferMinEur(examCode);
  if (anchor <= min) return min;
  return roundToNine(anchor - 1, min);
}

/** Budjettivalinnan anchor → PRO-hinta, aina ≤ WTP (hieman alle). */
export function wtpScoreToPriceEur(wtpScore, examCode = "F") {
  const ceiling = wtpBudgetCeilingEur(wtpScore, examCode);
  const min = wtpOfferMinEur(examCode);
  const anchor = Math.min(1000, Math.max(0, Math.round(Number(wtpScore) || 0)));
  const base = BUDGET_ANCHOR_TO_PRICE_EUR[anchor];
  const raw =
    base == null
      ? ceiling
      : roundToNine(base * wtpPriceMultiplier(examCode), min);
  return Math.min(raw, Math.max(min, ceiling - 20));
}

/** VIP Takuu = PRO + 400 €. */
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

/** Toinen suositus: sama WTP, hieman kalliimpi — silti budjetin alle. */
export function wtpAlignedAltPriceEur(primaryPriceEur, wtpScore, examCode = "F") {
  const ceiling = wtpBudgetCeilingEur(wtpScore, examCode);
  const min = wtpOfferMinEur(examCode);
  const primary = Math.max(min, Math.min(ceiling, Math.round(Number(primaryPriceEur) || min)));
  return ceiling > primary ? ceiling : primary;
}

export function qualifiesForCourse(examCode) {
  return COURSE_CODES.includes(examCode);
}

export function qualifiesForWtpOffer(examCode) {
  return WTP_OFFER_EXAMS.includes(examCode);
}

/** Ensisijainen kurssi: käyttäjän valinta voittaa pisteytyksen. */
export function resolvePrimaryCode(selectedTargets, algorithmCode, scores = {}) {
  const targets = Array.isArray(selectedTargets)
    ? selectedTargets
    : selectedTargets
      ? [selectedTargets]
      : [];

  // Ensimmäinen valittu myytävä koe (A/B/C/E/F) — ei score-max, ei B-oletus.
  const courseTargets = targets.filter((t) => t !== "unknown" && qualifiesForCourse(t));
  if (courseTargets.length > 0) return courseTargets[0];

  // Viimeinen keino: vain kun ei valittu myytävää koetta (unknown / D/G/H/I).
  return bestCourseFromScores(scores, algorithmCode);
}

function bestAmongCodes(codes, scores) {
  let best = null;
  let bestScore = 0;
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
  const fromScores = bestAmongCodes(COURSE_CODES, scores);
  if (fromScores) return fromScores;
  if (qualifiesForCourse(algorithmCode)) return algorithmCode;
  return null;
}

/** Kurssi mukana WTP-suosituksissa (valinta, ensisijainen tai testin ehdotus). */
export function recommendationsIncludeWtpOffer(primaryCode, algorithmCode, selectedTargets = []) {
  for (const code of selectedTargets) {
    if (qualifiesForWtpOffer(code)) return true;
  }
  return qualifiesForWtpOffer(primaryCode) || qualifiesForWtpOffer(algorithmCode);
}

/** @deprecated */
export function recommendationsIncludeF(primaryCode, algorithmCode, selectedTargets = []) {
  return recommendationsIncludeWtpOffer(primaryCode, algorithmCode, selectedTargets);
}
