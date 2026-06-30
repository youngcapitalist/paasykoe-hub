// Budjettivalinta → kiinteä PRO-hinta (päättyy 9:ään). B = F-hinnat × (149/99).

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

/** Budjettivaihtoehdon anchor-pisteet → F-tason PRO-hinta (€). */
export const BUDGET_ANCHOR_TO_PRICE_EUR = {
  90: 99,
  220: 249,
  520: 549,
  820: 649,
  1000: 949,
};

/** Kolme kalleinta budjettitasoa sisältää live-masterclassit. */
export const LIVE_MASTERCLASS_BUDGET_ANCHORS = new Set([520, 820, 1000]);

export const WTP_CALENDLY_URL = "https://calendly.com/valintakoefpro-info/15min";
export const WTP_CONSULTATION_EMAIL_BY_EXAM = {
  A: "info@valintakoea.fi",
  B: "info@valintakoeb.fi",
  C: "info@valintakoec.fi",
  E: "info@valintakoee.fi",
  F: "info@valintakoefpro.com",
};

export function wtpConsultationEmail(examCode = "F") {
  return WTP_CONSULTATION_EMAIL_BY_EXAM[examCode] ?? WTP_CONSULTATION_EMAIL_BY_EXAM.F;
}
export const WTP_CONSULTATION_MIN_EUR = 500;

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
export function roundToNine(eur, minEur = CHECKOUT_MIN_EUR) {
  const n = Math.max(minEur, Math.min(WTP_MAX_EUR, Math.round(eur)));
  return Math.floor(n / 10) * 10 + 9;
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

/** Budjettivalinnan anchor → kiinteä PRO-hinta (F-taso tai B-kerroin). */
export function wtpScoreToPriceEur(wtpScore, examCode = "F") {
  const anchor = Math.min(1000, Math.max(0, Math.round(wtpScore)));
  const base = BUDGET_ANCHOR_TO_PRICE_EUR[anchor];
  const min = wtpOfferMinEur(examCode);
  if (base == null) return roundToNine(min, min);
  const mult = wtpPriceMultiplier(examCode);
  return roundToNine(base * mult, min);
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

/** Yli 500 € (F-taso) — B: sama logiikka skaalatulla hinnalla. */
export function wtpPriceIncludesConsultation(priceEur, examCode = "F") {
  if (typeof priceEur !== "number") return false;
  const threshold = WTP_CONSULTATION_MIN_EUR * wtpPriceMultiplier(examCode);
  return priceEur > threshold;
}

export function formatPriceEur(eur) {
  return `${eur} €`;
}

export function qualifiesForCourse(examCode) {
  return COURSE_CODES.includes(examCode);
}

export function qualifiesForWtpOffer(examCode) {
  return WTP_OFFER_EXAMS.includes(examCode);
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
