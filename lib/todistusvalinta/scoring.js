/**
 * Yliopistojen todistusvalinnan pisteytys 2026 (UNIFI / yliopistovalinnat.fi).
 * Laskenta: parhaat aineet taulukon sääntöjen mukaan.
 */

export const GRADES = ["L", "E", "M", "C", "B", "A"];
const GI = { L: 0, E: 1, M: 2, C: 3, B: 4, A: 5 };

const P = {
  aidinkieli: [36.1, 32.5, 28.8, 21.7, 10.8, 5.4],
  matematiikka_pitka: {
    default: [28.9, 28.6, 26.0, 20.2, 8.7, 4.3],
    H: [37.9, 34.1, 30.3, 22.7, 11.4, 5.7],
    I: [37.9, 34.1, 30.3, 22.7, 11.4, 5.7],
    J: [39.7, 35.7, 31.8, 25.1, 11.9, 6.0],
    K: [37.9, 34.1, 30.3, 22.7, 11.4, 5.7],
  },
  matematiikka_lyhyt: [28.2, 25.4, 22.5, 16.9, 8.4, 4.1],
  painotettu_luonnontiede: [34.0, 30.6, 27.2, 20.4, 10.2, 5.1],
  kemia_painotettu_K: [32.3, 29.1, 25.8, 19.4, 9.7, 4.8],
  maantiede_painotettu: [34.0, 30.6, 27.2, 20.4, 10.2, 5.1],
  psykologia_painotettu: [34.0, 30.6, 27.2, 20.4, 10.2, 5.1],
  terveystieto_painotettu: [34.0, 30.6, 27.2, 20.4, 10.2, 5.1],
  muu: [24.5, 19.6, 14.7, 9.8, 7.4, 3.7],
  muu_kevyt: [20.0, 16.0, 12.0, 8.0, 6.0, 3.0],
  pitka_kieli: [28.3, 25.5, 22.6, 17.0, 8.5, 4.2],
  keskipitka_kieli: [25.0, 20.0, 15.0, 10.0, 7.5, 3.8],
  lyhyt_kieli: [24.5, 19.6, 14.7, 9.8, 7.4, 3.7],
  lyhyt_englanti: [20.0, 16.0, 12.0, 8.0, 6.0, 3.0],
};

const REAALI = new Set([
  "biologia",
  "kemia",
  "fysiikka",
  "maantiede",
  "historia",
  "filosofia",
  "psykologia",
  "terveystieto",
  "yhteiskuntaoppi",
  "uskonto",
  "elamankatsomustieto",
]);

function pt(scale, grade) {
  if (!grade || !(grade in GI)) return 0;
  return scale[GI[grade]] ?? 0;
}

function mathEntry(grades, tableKey) {
  const pitka = grades.matematiikka_pitka;
  const lyhyt = grades.matematiikka_lyhyt;
  const scales = P.matematiikka_pitka[tableKey] || P.matematiikka_pitka.default;
  const pPitka = pitka ? pt(scales, pitka) : 0;
  const pLyhyt = lyhyt ? pt(P.matematiikka_lyhyt, lyhyt) : 0;
  if (pPitka >= pLyhyt && pitka) return { key: "matematiikka_pitka", grade: pitka, points: pPitka };
  if (lyhyt) return { key: "matematiikka_lyhyt", grade: lyhyt, points: pLyhyt };
  return null;
}

function subjectPoints(key, grade, { weighted = false, tableKey = "default" } = {}) {
  if (!grade) return 0;
  if (key === "aidinkieli") return pt(P.aidinkieli, grade);
  if (key === "matematiikka_pitka") {
    const scales = P.matematiikka_pitka[tableKey] || P.matematiikka_pitka.default;
    return pt(scales, grade);
  }
  if (key === "matematiikka_lyhyt") return pt(P.matematiikka_lyhyt, grade);
  if (key === "kemia" && weighted) return pt(P.kemia_painotettu_K, grade);
  if (["biologia", "fysiikka", "kemia"].includes(key) && weighted) return pt(P.painotettu_luonnontiede, grade);
  if (key === "maantiede" && weighted) return pt(P.maantiede_painotettu, grade);
  if (key === "psykologia" && weighted) return pt(P.psykologia_painotettu, grade);
  if (key === "terveystieto" && weighted) return pt(P.terveystieto_painotettu, grade);
  if (key === "pitka_kieli") return pt(P.pitka_kieli, grade);
  if (key === "keskipitka_kieli") return pt(P.keskipitka_kieli, grade);
  if (key === "lyhyt_kieli") return pt(P.lyhyt_kieli, grade);
  if (key === "lyhyt_englanti") return pt(P.lyhyt_englanti, grade);
  if (["filosofia", "historia", "maantiede", "psykologia", "terveystieto", "yhteiskuntaoppi", "uskonto", "elamankatsomustieto"].includes(key)) {
    return pt(P.muu_kevyt, grade);
  }
  return pt(P.muu, grade);
}

function collectOptional(grades, exclude, tableKey) {
  const keys = [
    "biologia",
    "kemia",
    "fysiikka",
    "historia",
    "maantiede",
    "psykologia",
    "terveystieto",
    "yhteiskuntaoppi",
    "filosofia",
    "uskonto",
    "elamankatsomustieto",
    "pitka_kieli",
    "keskipitka_kieli",
    "lyhyt_kieli",
    "lyhyt_englanti",
  ];
  const items = [];
  for (const key of keys) {
    if (exclude.has(key) || !grades[key]) continue;
    items.push({
      key,
      grade: grades[key],
      points: subjectPoints(key, grades[key], { tableKey }),
      reaali: REAALI.has(key),
      label: grades[`_label_${key}`] || null,
    });
  }
  for (const p of grades._pool || []) {
    if (exclude.has(p.instanceKey)) continue;
    items.push({
      key: p.instanceKey,
      grade: p.grade,
      points: subjectPoints(p.scoreKey, p.grade, { tableKey }),
      reaali: REAALI.has(p.scoreKey),
      label: p.label,
    });
  }
  return items.sort((a, b) => b.points - a.points);
}

function bestWeighted(grades, keys, tableKey, kemiaWeighted = false) {
  let best = null;
  for (const key of keys) {
    if (!grades[key]) continue;
    const points = subjectPoints(key, grades[key], {
      weighted: true,
      tableKey,
      ...(key === "kemia" && kemiaWeighted ? {} : {}),
    });
    const actual =
      key === "kemia" && tableKey === "K"
        ? subjectPoints(key, grades[key], { weighted: true })
        : subjectPoints(key, grades[key], { weighted: true });
    if (!best || actual > best.points) {
      best = { key, grade: grades[key], points: actual };
    }
  }
  return best;
}

function sumFixed(parts) {
  return parts.reduce((s, p) => s + (p?.points ?? 0), 0);
}

export function calculateCertificateScore(tableId, grades) {
  const breakdown = [];
  const used = new Set();

  const add = (item, slot) => {
    if (!item) return;
    breakdown.push({ ...item, slot, label: item.label || grades[`_label_${item.key}`] || null });
    used.add(item.key);
  };

  const tableKey = tableId;

  if (tableId === "K") {
    const math = mathEntry(grades, "K");
    add(math, "Matematiikka");
    add(
      grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
      "Äidinkieli",
    );
    add(
      grades.biologia
        ? { key: "biologia", grade: grades.biologia, points: subjectPoints("biologia", grades.biologia, { weighted: true }) }
        : null,
      "Biologia",
    );
    add(
      grades.kemia
        ? { key: "kemia", grade: grades.kemia, points: subjectPoints("kemia", grades.kemia, { weighted: true }) }
        : null,
      "Kemia",
    );
    const extras = collectOptional(grades, used, tableKey).slice(0, 2);
    if (extras.length === 2 && !extras.some((e) => e.reaali)) {
      const reaali = collectOptional(grades, used, tableKey).find((e) => e.reaali);
      if (reaali) extras[1] = reaali;
    }
    extras.forEach((e, i) => add(e, `Muu aine ${i + 1}`));
    const total = sumFixed(breakdown);
    return { total: round1(total), maxPoints: 193.1, breakdown, tableId };
  }

  if (tableId === "J") {
    const math = mathEntry(grades, "J");
    add(math, "Matematiikka");
    add(
      grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
      "Äidinkieli",
    );
    const luonto = bestWeighted(grades, ["fysiikka", "kemia"], "J");
    add(luonto, "Fysiikka tai kemia");
    collectOptional(grades, used, tableKey)
      .slice(0, 2)
      .forEach((e, i) => add(e, `Muu aine ${i + 1}`));
    return { total: round1(sumFixed(breakdown)), maxPoints: 172.1, breakdown, tableId };
  }

  if (tableId === "I") {
    const math = mathEntry(grades, "I");
    add(math, "Matematiikka");
    add(
      grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
      "Äidinkieli",
    );
    const luonto = bestWeighted(grades, ["biologia", "kemia", "fysiikka"], "I");
    add(luonto, "Biologia, kemia tai fysiikka");
    collectOptional(grades, used, tableKey)
      .slice(0, 2)
      .forEach((e, i) => add(e, `Muu aine ${i + 1}`));
    return { total: round1(sumFixed(breakdown)), maxPoints: 161.3, breakdown, tableId };
  }

  if (tableId === "C") {
    const math = mathEntry(grades, "default");
    add(math, "Matematiikka");
    add(
      grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
      "Äidinkieli",
    );
    add(
      grades.psykologia
        ? { key: "psykologia", grade: grades.psykologia, points: subjectPoints("psykologia", grades.psykologia, { weighted: true }) }
        : null,
      "Psykologia",
    );
    collectOptional(grades, used, tableKey)
      .slice(0, 2)
      .forEach((e, i) => add(e, `Muu aine ${i + 1}`));
    return { total: round1(sumFixed(breakdown)), maxPoints: 152.3, breakdown, tableId };
  }

  if (tableId === "D") {
    add(
      grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
      "Äidinkieli",
    );
    add(
      grades.terveystieto
        ? { key: "terveystieto", grade: grades.terveystieto, points: subjectPoints("terveystieto", grades.terveystieto, { weighted: true }) }
        : null,
      "Terveystieto",
    );
    collectOptional(grades, used, tableKey)
      .slice(0, 3)
      .forEach((e, i) => add(e, `Muu aine ${i + 1}`));
    return { total: round1(sumFixed(breakdown)), maxPoints: 152.3, breakdown, tableId };
  }

  // A, E, F, G, H and default: äidinkieli + math + 3 best others
  const math = mathEntry(grades, tableId === "H" ? "H" : "default");
  add(math, "Matematiikka");
  add(
    grades.aidinkieli ? { key: "aidinkieli", grade: grades.aidinkieli, points: subjectPoints("aidinkieli", grades.aidinkieli) } : null,
    "Äidinkieli",
  );
  collectOptional(grades, used, tableKey)
    .slice(0, 3)
    .forEach((e, i) => add(e, `Muu aine ${i + 1}`));

  const maxMap = { A: 142.8, E: 142.8, F: 142.8, G: 142.8, H: 142.8 };
  return { total: round1(sumFixed(breakdown)), maxPoints: maxMap[tableId] ?? 142.8, breakdown, tableId };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

const GRADE_RANK = { L: 6, E: 5, M: 4, C: 3, B: 2, A: 1 };

export function checkThresholds(fieldId, grades) {
  const issues = [];
  const g = (k) => grades[k];
  const rank = (k) => (g(k) ? GRADE_RANK[g(k)] : 0);

  if (fieldId === "F" || fieldId === "E") {
    if (!g("matematiikka_pitka") && !g("matematiikka_lyhyt")) {
      issues.push("Kauppatieteissä ja kasvatusalalla matematiikka (pitkä tai lyhyt) tulee olla suoritettuna.");
    }
  }
  if (fieldId === "A") {
    if (!g("matematiikka_pitka") && !g("matematiikka_lyhyt")) {
      issues.push("Tekniikan alalla pitkä matematiikka sekä fysiikka tai kemia tulee olla suoritettuna.");
    } else if (!g("fysiikka") && !g("kemia")) {
      issues.push("Tekniikan alalla tarvitaan fysiikka tai kemia.");
    } else {
      const mathOk = g("matematiikka_pitka") || (g("matematiikka_lyhyt") && rank("matematiikka_lyhyt") >= GRADE_RANK.C);
      const sci = g("fysiikka") || g("kemia");
      const sciGrade = rank("fysiikka") >= rank("kemia") ? g("fysiikka") : g("kemia");
      const sciOk = sciGrade && GRADE_RANK[sciGrade] >= GRADE_RANK.C;
      if (!mathOk || !sciOk) {
        issues.push("Tekniikan alan kynnysehto: pitkä matikka + fysiikka/kemia hyväksyttynä, toisesta vähintään C.");
      }
    }
  }
  if (fieldId === "C") {
    if (!g("biologia")) issues.push("Biologian ja ympäristötieteiden alalla biologia tulee olla suoritettuna.");
  }
  if (fieldId === "B" && !g("biologia") && !g("kemia")) {
    issues.push("Lääketieteellisillä aloilla biologia ja kemia kannattaa olla mukana pisteytyksessä.");
  }

  return issues;
}

export function assessResult(field, score) {
  const ratio = score.total / field.maxPoints;
  const competitive = field.competitive / field.maxPoints;

  if (score.total < field.minimum) {
    return {
      level: "below_minimum",
      title: "Todistuspisteet eivät riitä todistusvalintaan",
      summary:
        "Pisteesi jäävät alle tyypillisen vähimmäispistemäärän. Todistusvalinnassa et todennäköisesti tule huomioiduksi — valintakoe on realistinen reitti opiskelupaikkaan.",
    };
  }
  if (ratio < competitive) {
    return {
      level: "needs_exam",
      title: "Todistus ei todennäköisesti riitä — valintakoe kannattaa",
      summary:
        "Pisteesi ovat hyväksyttävällä tasolla, mutta kilpailu on kovaa. Useimmissa hakukohteissa tarvitset vahvan valintakokeen tuloksen päästäksesi sisään.",
    };
  }
  return {
    level: "strong_certificate",
    title: "Vahva todistusvalintaposition",
    summary:
      "Pisteesi ovat kilpailukykyisiä todistusvalinnassa. Silti kaikki paikat eivät aina riitä pelkällä todistuksella — tarkista hakukohtekohtaiset rajat Opintopolusta.",
  };
}

const SCORING_TABLES = ["A", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

/** Laske pisteet kaikilla pisteytystaulukoilla kerralla (hakukohteiden vertailuun). */
export function computeAllTableScores(grades) {
  const scores = {};
  for (const tableId of SCORING_TABLES) {
    scores[tableId] = calculateCertificateScore(tableId, grades);
  }
  return scores;
}
