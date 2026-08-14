export const NAV_LINKS = [
  { label: "Etusivu", href: "/" },
  { label: "Koulutukset & hakeminen", href: "/#kokeet-otsikko" },
  { label: "Todistusvalinta", href: "/todistusvalinta/laskuri" },
  { label: "Valintakokeet", href: "/#kokeet-otsikko" },
  { label: "Yhteystiedot", href: "/#faq-otsikko" },
];

export const EXAMS = [
  { code: "A", field: "Tekniikka ja luonnontieteet", href: "https://valintakoea.fi", alat: "Fysiikka, kemia, matemaattiset tieteet, nanotiede, tietojenkäsittelytieteet ja tekniikka." },
  { code: "B", field: "Lääke- ja terveystieteet", href: "https://valintakoeb.fi", alat: "Biokemia ja molekyylibiotieteet, biolääketiede, eläinlääketiede, farmasia, hammaslääketiede ja ravitsemustiede." },
  { code: "C", field: "Biologia ja ympäristötieteet", href: "https://valintakoec.fi", alat: "Biologia ja ympäristötieteet, elintarviketieteet, geotieteet, maantiede, maatalous- ja metsätieteet." },
  { code: "D", field: "Psykologia ja hyvinvointi", alat: "Logopedia, psykologia, terveystieteet ja hoitotiede sekä valmennustieteet ja liikuntabiologia." },
  { code: "E", field: "Kasvatusala", href: "https://valintakoee.fi", alat: "Kasvatustieteet ja liikuntapedagogiikka." },
  { code: "F", field: "Kauppatieteet", href: "https://valintakoefpro.com", alat: "Kauppatieteet, taloustiede, tietojärjestelmätiede sekä ympäristö- ja elintarviketalous." },
  { code: "G", field: "Oikeus- ja yhteiskuntatieteet", alat: "Hallintotiede, oikeustiede, sosiaalitieteet, viestintätieteet ja yhteiskuntatieteet sekä liikunnan yhteiskuntatieteet." },
  { code: "H", field: "Humanistiset tieteet", alat: "Filosofia, historia, kulttuurien tutkimus, taiteiden tutkimus ja teologia." },
  { code: "I", field: "Kielet", alat: "Kielet, kielitieteet ja kirjallisuustieteet." },
];

export const FOOTER_COLUMNS = [
  {
    title: "Koulutukset & hakeminen",
    links: [
      { label: "Hakeminen", href: "https://opintopolku.fi" },
      { label: "Aikataulut", href: "/#kokeet-otsikko" },
      { label: "Hakukohteet", href: "https://opintopolku.fi" },
    ],
  },
  {
    title: "Todistusvalinta",
    links: [
      { label: "Laskuri", href: "/todistusvalinta/laskuri" },
      { label: "Yo-valmennus (LaudaturPro)", href: "https://laudaturpro.fi/aloita?utm_source=paasykoe&utm_medium=footer" },
      { label: "Pisteytys 2026", href: "https://yliopistovalinnat.fi/todistusvalinnan-pisteytykset-vuodesta-2026" },
      { label: "Usein kysyttyä", href: "/#faq-otsikko" },
    ],
  },
  {
    title: "Valintakokeet",
    links: [
      { label: "Yhdeksän koetta", href: "/#kokeet-otsikko" },
      { label: "Ilmainen tasotesti", href: "/tasotesti" },
      { label: "FAQ", href: "/#faq-otsikko" },
    ],
  },
];
