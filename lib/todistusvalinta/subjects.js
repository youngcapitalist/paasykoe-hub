/** Kaikki ylioppilastutkinnon aineet (Studentum-tyylinen lista) → pisteytysavaimet. */
export const YO_SUBJECTS = [
  { id: "aidinkieli", label: "Äidinkieli", scoreKey: "aidinkieli", group: "kieli" },
  { id: "suomi_toisena", label: "Suomi toisena kielenä", scoreKey: "keskipitka_kieli", group: "kieli" },
  { id: "ruotsi_toisena", label: "Ruotsi toisena kielenä", scoreKey: "keskipitka_kieli", group: "kieli" },
  { id: "englanti_pitka", label: "Englanti, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "englanti_lyhyt", label: "Englanti, lyhyt", scoreKey: "lyhyt_englanti", group: "kieli" },
  { id: "toinen_kotimainen_pitka", label: "Toinen kotimainen kieli, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "toinen_kotimainen_keskipitka", label: "Toinen kotimainen kieli, keskipitkä", scoreKey: "keskipitka_kieli", group: "kieli" },
  { id: "matematiikka_pitka", label: "Matematiikka, pitkä", scoreKey: "matematiikka_pitka", group: "matematiikka" },
  { id: "matematiikka_lyhyt", label: "Matematiikka, lyhyt", scoreKey: "matematiikka_lyhyt", group: "matematiikka" },
  { id: "terveystieto", label: "Terveystieto", scoreKey: "terveystieto", group: "reaali" },
  { id: "psykologia", label: "Psykologia", scoreKey: "psykologia", group: "reaali" },
  { id: "fysiikka", label: "Fysiikka", scoreKey: "fysiikka", group: "reaali" },
  { id: "kemia", label: "Kemia", scoreKey: "kemia", group: "reaali" },
  { id: "biologia", label: "Biologia", scoreKey: "biologia", group: "reaali" },
  { id: "maantiede", label: "Maantiede", scoreKey: "maantiede", group: "reaali" },
  { id: "historia", label: "Historia", scoreKey: "historia", group: "reaali" },
  { id: "yhteiskuntaoppi", label: "Yhteiskuntaoppi", scoreKey: "yhteiskuntaoppi", group: "reaali" },
  { id: "evlut_uskonto", label: "Ev.lut uskonto", scoreKey: "uskonto", group: "reaali" },
  { id: "elamankatsomustieto", label: "Elämänkatsomustieto", scoreKey: "elamankatsomustieto", group: "reaali" },
  { id: "ortodoksi_uskonto", label: "Ortodoksiuskonto", scoreKey: "uskonto", group: "reaali" },
  { id: "filosofia", label: "Filosofia", scoreKey: "filosofia", group: "reaali" },
  { id: "venaja_pitka", label: "Venäjä, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "venaja_lyhyt", label: "Venäjä, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "ranska_pitka", label: "Ranska, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "ranska_lyhyt", label: "Ranska, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "espanja_pitka", label: "Espanja, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "espanja_lyhyt", label: "Espanja, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "saksa_pitka", label: "Saksa, pitkä", scoreKey: "pitka_kieli", group: "kieli" },
  { id: "saksa_lyhyt", label: "Saksa, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "saame_lyhyt", label: "Saame, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "italia_lyhyt", label: "Italia, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "portugali_lyhyt", label: "Portugali, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
  { id: "latina_lyhyt", label: "Latina, lyhyt", scoreKey: "lyhyt_kieli", group: "kieli" },
];

const SINGLE_SLOT_KEYS = new Set([
  "aidinkieli",
  "matematiikka_pitka",
  "matematiikka_lyhyt",
  "biologia",
  "kemia",
  "fysiikka",
  "maantiede",
  "psykologia",
  "terveystieto",
  "historia",
  "yhteiskuntaoppi",
  "filosofia",
  "uskonto",
  "elamankatsomustieto",
]);

const GRADE_RANK = { L: 6, E: 5, M: 4, C: 3, B: 2, A: 1 };

export function getSubject(id) {
  return YO_SUBJECTS.find((s) => s.id === id);
}

/** Muuntaa käyttäjän ainerivit pisteytysmoottorin grades-objektiksi. */
export function entriesToGrades(rows) {
  const grades = { _pool: [] };

  for (const row of rows) {
    if (!row.subjectId || !row.grade) continue;
    const subject = getSubject(row.subjectId);
    if (!subject) continue;

    const { scoreKey, label, id } = subject;

    if (SINGLE_SLOT_KEYS.has(scoreKey)) {
      const prev = grades[scoreKey];
      if (!prev || GRADE_RANK[row.grade] > GRADE_RANK[prev]) {
        grades[scoreKey] = row.grade;
        grades[`_label_${scoreKey}`] = label;
      }
    } else {
      grades._pool.push({
        instanceKey: id,
        scoreKey,
        grade: row.grade,
        label,
      });
    }
  }

  return grades;
}

export function hasAidinkieli(rows) {
  return rows.some((r) => r.subjectId === "aidinkieli" && r.grade);
}
