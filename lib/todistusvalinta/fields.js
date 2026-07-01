import { getCourse } from "../../app/courses";

/** Hakualat → pisteytystaulukko + valintakoe + kurssilinkki */
export const CERTIFICATE_FIELDS = [
  {
    id: "B",
    examCode: "B",
    label: "Lääke- ja terveystieteet",
    tableId: "K",
    maxPoints: 193.1,
    minimum: 95,
    competitive: 168,
    hint: "Lääketiede, hammaslääketiede, farmasia, eläinlääketiede…",
  },
  {
    id: "A",
    examCode: "A",
    label: "Tekniikka ja luonnontieteet (DI)",
    tableId: "J",
    maxPoints: 172.1,
    minimum: 75,
    competitive: 135,
    hint: "Diplomi-insinööri, fysiikka, kemia, tietojenkäsittelytiede…",
  },
  {
    id: "C",
    examCode: "C",
    label: "Biologia ja ympäristötieteet",
    tableId: "I",
    maxPoints: 161.3,
    minimum: 70,
    competitive: 125,
    hint: "Biologia, ympäristötieteet, geotiede, metsätiede…",
  },
  {
    id: "F",
    examCode: "F",
    label: "Kauppatieteet",
    tableId: "A",
    maxPoints: 142.8,
    minimum: 55,
    competitive: 105,
    hint: "Kauppatieteet, taloustiede, tietojärjestelmätiede…",
  },
  {
    id: "E",
    examCode: "E",
    label: "Kasvatusala",
    tableId: "A",
    maxPoints: 142.8,
    minimum: 50,
    competitive: 95,
    hint: "Luokanopettaja, varhaiskasvatus, erityisopettaja…",
  },
  {
    id: "D_psy",
    examCode: null,
    label: "Psykologia",
    tableId: "C",
    maxPoints: 152.3,
    minimum: 55,
    competitive: 100,
    hint: "Psykologian koulutusohjelmat",
  },
  {
    id: "D_terv",
    examCode: null,
    label: "Terveystieteet ja hoitotiede",
    tableId: "D",
    maxPoints: 152.3,
    minimum: 55,
    competitive: 100,
    hint: "Hoitotiede, terveystieteet, liikuntapedagogiikka…",
  },
  {
    id: "G",
    examCode: null,
    label: "Oikeus- ja yhteiskuntatieteet",
    tableId: "E",
    maxPoints: 142.8,
    minimum: 50,
    competitive: 98,
    hint: "Oikeustiede, hallintotiede, viestintätieteet…",
  },
  {
    id: "H",
    examCode: null,
    label: "Humanistiset tieteet",
    tableId: "F",
    maxPoints: 142.8,
    minimum: 48,
    competitive: 92,
    hint: "Historia, filosofia, kulttuurien tutkimus…",
  },
  {
    id: "I",
    examCode: null,
    label: "Kielet",
    tableId: "G",
    maxPoints: 142.8,
    minimum: 48,
    competitive: 95,
    hint: "Kielten ja kielitieteiden ohjelmat",
  },
];

export function getCertificateField(id) {
  return CERTIFICATE_FIELDS.find((f) => f.id === id);
}

export function courseForField(field) {
  if (!field?.examCode) return null;
  return getCourse(field.examCode);
}

