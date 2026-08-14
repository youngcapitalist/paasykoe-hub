/** Hakukohteet todistusvalinnan vertailuun — rajat: lib/todistusvalinta/thresholds.json (Vipunen/Opintopolku). */
import thresholdsData from "./thresholds.json";

export const THRESHOLDS_META = thresholdsData.meta;

export const FIELD_GROUPS = [
  { id: "all", label: "Kaikki alat" },
  { id: "kauppatieteet", label: "Kauppatieteet" },
  { id: "laaketiede", label: "Lääketiede ja terveys" },
  { id: "tekniikka", label: "Tekniikka ja DI" },
  { id: "biologia", label: "Biologia ja ympäristö" },
  { id: "kasvatus", label: "Kasvatusala" },
  { id: "psykologia", label: "Psykologia" },
  { id: "oikeus", label: "Oikeus ja yhteiskunta" },
  { id: "humanistiset", label: "Humanistiset" },
  { id: "kielet", label: "Kielet" },
];

/** @type {import("./thresholds.json").programs extends infer P ? Array<{id: string} & Record<string, unknown>> : never} */
const PROGRAM_DEFS = [
  {
    id: "aalto-kauppa",
    title: "Kauppatieteet, kauppatieteiden kandidaatti ja maisteri (3 v + 2 v)",
    university: "Aalto-yliopisto",
    subtitle: "Kauppatieteiden kandidaatti, Kauppatieteiden maisteri",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "tampere-kauppa",
    title: "Kauppatieteet",
    university: "Tampereen yliopisto",
    subtitle: "Kauppatieteiden kandidaatti ja maisteri",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "turku-kauppa",
    title: "Kauppatieteet",
    university: "Turun yliopisto",
    subtitle: "Kauppatieteiden kandidaatti ja maisteri, Turku",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "lut-kauppa",
    title: "Kauppatieteet",
    university: "LUT-yliopisto",
    subtitle: "Kauppatieteiden kandidaatti ja maisteri",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "hanken",
    title: "Kauppatieteet",
    university: "Hanken, Helsingfors",
    subtitle: "Kauppatieteiden kandidaatti ja maisteri",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "jyv-kauppa",
    title: "Kauppatieteet",
    university: "Jyväskylän yliopisto",
    subtitle: "Kauppatieteiden kandidaatti",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "oulu-kauppa",
    title: "Kauppatieteet",
    university: "Oulun yliopisto",
    subtitle: "Kauppatieteiden kandidaatti",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "vaasa-kauppa",
    title: "Kauppatieteet",
    university: "Vaasan yliopisto",
    subtitle: "Kauppatieteiden kandidaatti",
    field: "kauppatieteet",
    tableId: "A",
    examCode: "F",
  },
  {
    id: "helsinki-laak",
    title: "Lääketiede",
    university: "Helsingin yliopisto",
    subtitle: "Lääketieteen lisensiaatti",
    field: "laaketiede",
    tableId: "K",
    examCode: "B",
  },
  {
    id: "tampere-laak",
    title: "Lääketiede",
    university: "Tampereen yliopisto",
    subtitle: "Lääketieteen lisensiaatti",
    field: "laaketiede",
    tableId: "K",
    examCode: "B",
  },
  {
    id: "turku-laak",
    title: "Lääketiede",
    university: "Turun yliopisto",
    subtitle: "Lääketieteen lisensiaatti",
    field: "laaketiede",
    tableId: "K",
    examCode: "B",
  },
  {
    id: "oulu-laak",
    title: "Lääketiede",
    university: "Oulun yliopisto",
    subtitle: "Lääketieteen lisensiaatti",
    field: "laaketiede",
    tableId: "K",
    examCode: "B",
  },
  {
    id: "helsinki-hammas",
    title: "Hammaslääketiede",
    university: "Helsingin yliopisto",
    subtitle: "Hammaslääketieteen lisensiaatti",
    field: "laaketiede",
    tableId: "K",
    examCode: "B",
  },
  {
    id: "helsinki-farmasia",
    title: "Farmasia, proviisori",
    university: "Helsingin yliopisto",
    subtitle: "Proviisorin koulutusohjelma",
    field: "laaketiede",
    tableId: "I",
    examCode: "B",
  },
  {
    id: "aalto-di",
    title: "Diplomi-insinööri, tuotantotalous",
    university: "Aalto-yliopisto",
    subtitle: "Tekniikan kandidaatti ja diplomi-insinööri",
    field: "tekniikka",
    tableId: "J",
    examCode: "A",
  },
  {
    id: "tampere-di",
    title: "Diplomi-insinööri, konetekniikka",
    university: "Tampereen yliopisto",
    subtitle: "Tekniikan kandidaatti ja diplomi-insinööri",
    field: "tekniikka",
    tableId: "J",
    examCode: "A",
  },
  {
    id: "oulu-di",
    title: "Diplomi-insinööri, konetekniikka",
    university: "Oulun yliopisto",
    subtitle: "Tekniikan kandidaatti ja diplomi-insinööri",
    field: "tekniikka",
    tableId: "J",
    examCode: "A",
  },
  {
    id: "lut-di",
    title: "Diplomi-insinööri, konetekniikka",
    university: "LUT-yliopisto",
    subtitle: "Tekniikan kandidaatti ja diplomi-insinööri",
    field: "tekniikka",
    tableId: "J",
    examCode: "A",
  },
  {
    id: "helsinki-tkt",
    title: "Tietojenkäsittelytiede",
    university: "Helsingin yliopisto",
    subtitle: "Luonnontieteiden kandidaatti ja maisteri",
    field: "tekniikka",
    tableId: "H",
    examCode: "A",
  },
  {
    id: "helsinki-bio",
    title: "Biologia",
    university: "Helsingin yliopisto",
    subtitle: "Luonnontieteiden kandidaatti ja maisteri",
    field: "biologia",
    tableId: "I",
    examCode: "C",
  },
  {
    id: "helsinki-kasvatus",
    title: "Kasvatustiede, luokanopettaja",
    university: "Helsingin yliopisto",
    subtitle: "Kasvatustieteen maisteri",
    field: "kasvatus",
    tableId: "A",
    examCode: "E",
  },
  {
    id: "helsinki-psy",
    title: "Psykologia",
    university: "Helsingin yliopisto",
    subtitle: "Psykologian maisteri",
    field: "psykologia",
    tableId: "C",
    examCode: null,
  },
  {
    id: "helsinki-oikeus",
    title: "Oikeustiede",
    university: "Helsingin yliopisto",
    subtitle: "Oikeustieteen kandidaatti ja maisteri, Helsinki",
    field: "oikeus",
    tableId: "E",
    examCode: null,
  },
  {
    id: "turku-oikeus",
    title: "Oikeustiede",
    university: "Turun yliopisto",
    subtitle: "Oikeustieteen kandidaatti",
    field: "oikeus",
    tableId: "E",
    examCode: null,
  },
  {
    id: "helsinki-historia",
    title: "Historia",
    university: "Helsingin yliopisto",
    subtitle: "Humanististen tieteiden kandidaatti",
    field: "humanistiset",
    tableId: "F",
    examCode: null,
  },
  {
    id: "helsinki-englanti",
    title: "Englannin kieli",
    university: "Helsingin yliopisto",
    subtitle: "Kielten kandidaatti",
    field: "kielet",
    tableId: "G",
    examCode: null,
  },
];

export const PROGRAMS = PROGRAM_DEFS.filter((p) => thresholdsData.programs[p.id]).map((p) => ({
  ...p,
  thresholds: thresholdsData.programs[p.id],
}));

const DISPLAY_YEARS = [2026];

export function matchPrograms({ query, fieldFilter, favorites, scores, firstTimer }) {
  const q = query.trim().toLowerCase();

  return PROGRAMS.filter((p) => {
    if (fieldFilter !== "all" && p.field !== fieldFilter) return false;
    if (q) {
      const hay = `${p.title} ${p.university} ${p.subtitle}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  })
    .map((p) => {
      const userScore = scores[p.tableId]?.total ?? 0;
      const maxPoints = scores[p.tableId]?.maxPoints ?? 0;
      const t2026 = p.thresholds[2026];
      const firstOnly = t2026?.firstOnly ?? false;
      const bar = firstOnly || firstTimer ? t2026.firstMin : t2026.min;
      const years = DISPLAY_YEARS.map((year) => {
        const t = p.thresholds[year];
        const yBar = t.firstOnly || firstTimer ? t.firstMin : t.min;
        return { year, userScore, bar: yBar, maxPoints, ok: userScore >= yBar };
      });
      const likely2026 = years[0]?.ok ?? false;
      return { ...p, userScore, maxPoints, years, likely2026, firstOnly };
    })
    .sort((a, b) => {
      if (favorites.has(a.id) !== favorites.has(b.id)) return favorites.has(a.id) ? -1 : 1;
      return b.userScore - a.userScore;
    });
}
