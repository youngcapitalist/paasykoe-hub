/** Tasotesti / hub-quiz — kipupisteet ja WTP-vastaukset ihmisluettavasti (Studio + drip). */

export const PAIN_LABELS = {
  fear: "Pelkää, ettei pääse sisään ollenkaan",
  unsure: "Ei tiedä, mille alalle hakea",
  time: "Aika tuntuu loppuvan kesken ennen koetta",
  compete: "Epävarmuus — pärjääkö muita hakijoita paremmin",
};

/** Yleisiä aloituksia drippiin — ei viitata käyttäjän vastauksiin (ei stalkkaus-sävyä). */
export const PAIN_DRIP_HOOKS = {
  fear:
    "Moni pelkää ettei pääse sisään — ymmärrettävää, kun paikoista kilpaillaan. Hyvä uutinen: ero tulee usein harjoittelusta, ei tuurista.",
  unsure:
    "Alavalinta voi tuntua epäselvältä. Kun suunta on selvä, valmennus auttaa keskittymään oikeisiin asioihin ilman hajanaista selaamista.",
  time:
    "Aikaa ennen koetta on rajallisesti. Strukturoitu harjoittelu auttaa käyttämään sen tehokkaasti — oikeat asiat oikeassa järjestyksessä.",
  compete:
    "Valintakokeessa erotellaan hakijoita tarkasti. Harjoittelu ja vastaustekniikka ovat se, mikä nostaa pisteitä — siihen tämä valmennus on rakennettu.",
};

const LAUDATUR_PRODUCTS = {
  "laudatur-pro": "Laudatur Pro (koko yo-valmennus)",
  "laudatur-boost": "Laudatur Boost",
  "matikka-pitka": "Matikka pitkä",
  "matikka-lyhyt": "Matikka lyhyt",
  "matikka-pakkaus": "Matikka-paketti",
  aidinkieli: "Äidinkieli",
  englanti: "Englanti",
  "kielet-pakkaus": "Kielipaketti",
  fysiikka: "Fysiikka",
  kemia: "Kemia",
  biologia: "Biologia",
  "luonnontiede-pakkaus": "Luonnontiedepaketti",
  psykologia: "Psykologia",
  historia: "Historia",
  terveystieto: "Terveystieto",
  yhteiskuntaoppi: "Yhteiskuntaoppi",
};

/** WTP budjetti-anchor (wtp_score) → valinta. */
export const WTP_BUDGET_BY_SCORE = {
  90: "Alle 100 €",
  220: "100–300 €",
  520: "300–700 €",
  820: "Yli 700 €",
  1000: "1 000 €",
};

export function painLabelFromKey(painKey) {
  const key = String(painKey || "").trim();
  if (!key) return null;
  if (PAIN_LABELS[key]) return PAIN_LABELS[key];
  if (LAUDATUR_PRODUCTS[key]) return LAUDATUR_PRODUCTS[key];
  if (key.startsWith("yo-yhteispaketti:")) {
    const parts = key.slice("yo-yhteispaketti:".length).split(",").filter(Boolean);
    const names = parts.map((p) => LAUDATUR_PRODUCTS[p] || p).join(" + ");
    return names ? `Yhteispaketti: ${names}` : "Yo-yhteispaketti";
  }
  return key;
}

export function painDripHook(painKey) {
  const key = String(painKey || "").trim();
  if (key && PAIN_DRIP_HOOKS[key]) return PAIN_DRIP_HOOKS[key];
  return null;
}

export function wtpBudgetLabelFromScore(wtpScore) {
  if (wtpScore == null || wtpScore === "") return null;
  const n = Math.round(Number(wtpScore));
  return WTP_BUDGET_BY_SCORE[n] || null;
}

/** Muodosta quiz_meta tallennusta ja drippiä varten. */
export function buildQuizMeta({
  painKey,
  painLabel,
  wtpAnswers,
  wtpQuestions,
  selectedTargets,
  algorithmCode,
  scores,
}) {
  const wtp = {};
  if (wtpAnswers && wtpQuestions) {
    for (const q of wtpQuestions) {
      const points = wtpAnswers[q.id];
      if (points == null) continue;
      const opt = q.options?.find((o) => o.points === points);
      if (opt?.label) wtp[`${q.id}_label`] = opt.label;
    }
  }
  const budgetLabel = wtpBudgetLabelFromScore(wtpAnswers?.budget ?? null);

  const examScores = {};
  if (scores && typeof scores === "object") {
    for (const [k, v] of Object.entries(scores)) {
      if (/^[A-Z]$/.test(k) && Number(v) > 0) examScores[k] = v;
    }
  }

  return {
    pain_key: painKey || null,
    pain_label: painLabel || painLabelFromKey(painKey),
    wtp_budget_label: budgetLabel || wtp.budget_label || null,
    wtp_commitment_label: wtp.commitment_label || null,
    wtp_priority_label: wtp.priority_label || null,
    selected_targets: Array.isArray(selectedTargets) ? selectedTargets : [],
    algorithm_code: algorithmCode || null,
    exam_scores: examScores,
  };
}
