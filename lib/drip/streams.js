/** Follow-up -sekvenssit per tuote/koe. Vaihe 0 = heti quiz-jälkeen (erillinen posti). */

const LAUDATUR_BULLETS = [
  "Teoria osa-alueittain — ei satunnaista selaamista",
  "AI-professori jokaisessa aineessa, 24/7",
  "1000+ harjoitustehtävää ja harkkakoe ennen yo-koetta",
  "Henkilökohtainen hinta quiz-valintojesi perusteella",
];

export const DRIP_STREAMS = {
  laudaturpro: {
    id: "laudaturpro",
    brand: "LaudaturPro",
    siteUrl: "https://laudaturpro.fi",
    fromName: "LaudaturPro",
    steps: [
      {
        delayHours: 24,
        subject: (p) => `${p.personalTitle || "Yo-suunnitelmasi"} — ensimmäinen viikkosi alkaa tästä`,
        headline: "Näin ensimmäinen viikkosi näyttää",
        body: (p) => {
          const subjects = (p.selectedLabels || []).join(", ") || "useita aineita";
          return (
            `Huomasimme testissäsi, että kirjoitat: <strong>${subjects}</strong>. ` +
            `Moni jättää yo-valmistautumisen liian myöhään — sinulla on nyt selkeä etumatka, ` +
            `koska suunnitelmasi on jo rakennettu valintojesi mukaan.<br><br>` +
            `Ensimmäinen viikko kannattaa aloittaa yhdestä aineesta kerrallaan: teoria → AI-professori → harjoitustehtävät. ` +
            `Näin et huku materiaaliin, vaan näet nopeasti edistymisen.`
          );
        },
        bullets: LAUDATUR_BULLETS,
        urgency: (p) =>
          p.priceEur
            ? `Henkilökohtainen hintasi ${p.priceEur} € on sidottu valintoihisi — se ei ole julkisesti saatavilla.`
            : null,
        cta: "Avaa minun suunnitelmani",
      },
      {
        delayHours: 48,
        subject: (p) => `Muistutus: ${p.priceEur || ""} € tarjouksesi vanhenee pian`.trim(),
        headline: "Suunnitelmasi poistuu pian",
        body: () =>
          "Tiedämme, että uuden valmennuksen tilaaminen tuntuu isolta päätökseltä — varsinkin ennen kuin olet kokeillut. " +
          "Siksi rakensimme sinulle henkilökohtaisen paketin, ei geneeristä tarjousta.<br><br>" +
          "Olemme nähneet saman kuvion tuhansilla yo-valmentautujilla: ne, jotka aloittavat systemaattisesti 3–6 kuukautta ennen koetta, " +
          "parantavat arvosanaansa selkeimmin. Satunnainen YouTube-selaaminen ei tuo samaa tulosta kuin rakennettu polku.",
        bullets: [
          "Tarjouksesi perustuu quiz-vastauksiisi — et saa samaa hintaa uudelleen",
          "3 ilmaista tehtävää ennen sitoutumista (kokeile ensin)",
          "Kaikki aineet samassa paikassa — ei useita tilauksia",
        ],
        urgency: (p) =>
          p.priceEur
            ? `⚠️ Henkilökohtainen ${p.priceEur} € -hintasi ei ole ikuisesti voimassa. Kun suunnitelma poistuu, joudut aloittamaan alusta.`
            : "Tarjous ei ole ikuisesti voimassa.",
        cta: "Lunasta tarjoukseni nyt",
      },
      {
        delayHours: 96,
        subject: () => "Miksi muut valitsevat henkilökohtaisen yo-paketin?",
        headline: "Et ole yksin valmistautumassa",
        body: (p) => {
          const savings =
            p.listPriceEur && p.priceEur && p.listPriceEur > p.priceEur ? p.listPriceEur - p.priceEur : null;
          return (
            "Yo-kokeeseen valmistautuminen on yksinäistä, jos ympärillä ei ole selkeää suunnitelmaa. " +
            "LaudaturPro yhdistää teorian, rajattoman AI-harjoittelun ja harkkakokeet — ilman satunnaista materiaalin keräämistä.<br><br>" +
            (savings
              ? `Sinun quiz-pohjaisessa paketissasi säästät <strong>${savings} €</strong> verrattuna ainekohtaisiin paketteihin. `
              : "") +
            "Sama rakenne, jota käyttävät opiskelijat, jotka tavoittelevat laudatur-tasoa tai haluavat varmistaa L:n arvosanan."
          );
        },
        bullets: [
          "AI-professori selittää, missä menit pieleen — ei vain oikeaa vastausta",
          "Harkkakoe ennen oikeaa yo-koetta (syksy 2026)",
          "Teoria ja harjoitus samassa näkymässä",
        ],
        urgency: () => "Paikkoja ei rajata, mutta henkilökohtainen hintasi on voimassa vain rajoitetun ajan.",
        cta: "Katso minun tarjoukseni",
      },
      {
        delayHours: 168,
        subject: (p) => `Viimeinen muistutus — ${p.priceEur} € (tänään)`,
        headline: "Viimeinen mahdollisuus lunastaa hintasi",
        body: (p) =>
          `Tämä on viimeinen muistutuksemme henkilökohtaisesta tarjouksestasi.<br><br>` +
          `Hintasi <strong>${p.priceEur} €</strong> perustuu testissä tekemiisi valintoihin. ` +
          `Kun suljemme tämän tarjousikkunan, et voi enää lunastaa samaa hintaa samoilla valinnoilla — ` +
          `joudut aloittamaan quizin alusta tai maksamaan normaalin listahinnan.<br><br>` +
          `Jos olet jo päättänyt kirjoittaa yo-kokeen keväällä tai syksyllä 2026, nyt on paras hetki aloittaa — ` +
          `ei viime tingassa.`,
        bullets: [
          "Peru markkinointi yhdellä klikkauksella — kurssi ei muutu, jos olet jo asiakas",
          "Maksat kerran — pääsy yo-kokeisiin asti",
          "Aloitat heti maksun jälkeen",
        ],
        urgency: (p) =>
          `🔴 Viimeinen mahdollisuus: ${p.priceEur} € tarjouksesi vanhenee. Tämän jälkeen linkki ei enää toimi samalla hinnalla.`,
        cta: "Siirry kassalle nyt",
      },
    ],
  },
  valintakoe_a: {
    id: "valintakoe_a",
    brand: "ValintakoeAPro",
    siteUrl: "https://valintakoea.fi",
    fromName: "Valintakoe A Pro",
    steps: valintakoeSteps("A", "tekniikkaa ja luonnontieteitä"),
  },
  valintakoe_b: {
    id: "valintakoe_b",
    brand: "ValintakoeBPro",
    siteUrl: "https://valintakoeb.fi",
    fromName: "Valintakoe B Pro",
    steps: valintakoeSteps("B", "lääke- ja terveystieteitä"),
  },
  valintakoe_c: {
    id: "valintakoe_c",
    brand: "ValintakoeCPro",
    siteUrl: "https://valintakoec.fi",
    fromName: "Valintakoe C Pro",
    steps: valintakoeSteps("C", "biologiaa ja ympäristötieteitä"),
  },
  valintakoe_e: {
    id: "valintakoe_e",
    brand: "ValintakoeEPro",
    siteUrl: "https://valintakoee.fi",
    fromName: "Valintakoe E Pro",
    steps: valintakoeSteps("E", "kasvatusalaa"),
  },
  valintakoe_f: {
    id: "valintakoe_f",
    brand: "ValintakoeFPro",
    siteUrl: "https://valintakoefpro.com",
    fromName: "Valintakoe F Pro",
    steps: valintakoeSteps("F", "kauppatieteitä"),
  },
};

function valintakoeSteps(code, fieldLabel) {
  return [
    {
      delayHours: 24,
      subject: (p) => `Valintakoe ${code} — suunnitelmasi (${p.priceEur || ""} €)`.trim(),
      headline: "Näin aloitat valmistautumisen",
      body: (p) =>
        `Testisi perusteella rakennettu valmennus kohti <strong>${fieldLabel}</strong> odottaa. ` +
        `Valintakoe ${code} on kilpailtu — systemaattinen harjoittelu erottaa hakijat, jotka pääsevät ensimmäisellä yrityksellä.<br><br>` +
        `Aloita teoriasta, siirry AI-professorin kanssa harjoittelemaan ja tee simuloituja kokeita oikeaan tempoan.`,
      bullets: (p) => [
        "Teoria ja harjoituskokeet samassa alustassa",
        "AI-professorit kehityskohteisiin",
        p?.priceEur ? `Henkilökohtainen hinta ${p.priceEur} €` : "Henkilökohtainen quiz-pohjainen hinta",
      ],
      urgency: (p) => (p.priceEur ? `Tarjouksesi ${p.priceEur} € perustuu testivastauksiisi.` : null),
      cta: "Avaa minun suunnitelmani",
    },
    {
      delayHours: 48,
      subject: (p) => `Tarjouksesi ${p.priceEur || ""} € vanhenee pian — Valintakoe ${code}`.trim(),
      headline: "Tarjous ei ole ikuisesti voimassa",
      body: () =>
        "Moni hakija odottaa liian kauan ennen kuin aloittaa valmistautumisen. " +
        "Valintakoe mittaa systemaattisuutta — ja sitä voi treenata, jos aloitat ajoissa.<br><br>" +
        "Henkilökohtainen hintasi perustuu testissä antamiisi vastauksiin. Et näe samaa hintaa uudelleen, jos suunnitelma poistuu.",
      bullets: [
        "Harjoituskokeet oikeaan koetilanteeseen",
        "Selkeä etenemispolku viikko kerrallaan",
        "Peru markkinointi yhdellä klikkauksella",
      ],
      urgency: (p) =>
        p.priceEur ? `⚠️ ${p.priceEur} € -hintasi sidottu testiin — lunasta ennen kuin se vanhenee.` : null,
      cta: "Lunasta tarjoukseni",
    },
    {
      delayHours: 96,
      subject: () => `Miksi Valintakoe ${code} -valmennus toimii?`,
      headline: "Harjoittele oikeita asioita",
      body: (p) => {
        const savings =
          p.listPriceEur && p.priceEur && p.listPriceEur > p.priceEur ? p.listPriceEur - p.priceEur : null;
        return (
          "Et tee satunnaisia tehtäviä — AI ohjaa kehityskohteisiin ja harjoituskokeet valmistavat oikeaan koetilanteeseen.<br><br>" +
          (savings ? `Paketissasi säästät arviolta <strong>${savings} €</strong> verrattuna listahintaan. ` : "") +
          `Tuhannet hakijat kilpailevat samoista paikoista — ero tulee valmistautumisesta, ei tuuristista.`
        );
      },
      bullets: [
        "AI-professori selittää virheet",
        "Teoria + harjoitus + koesimulaatiot",
        "Mentorointi ja materiaalit samassa paketissa",
      ],
      urgency: () => "Henkilökohtainen tarjous on voimassa rajoitetun ajan.",
      cta: "Katso tarjoukseni",
    },
    {
      delayHours: 168,
      subject: (p) => `Viimeinen muistutus — ${p.priceEur} € (Valintakoe ${code})`,
      headline: "Viimeinen muistutus",
      body: (p) =>
        `Tämä on viimeinen muistutuksemme.<br><br>` +
        `Tarjouksesi <strong>${p.priceEur} €</strong> on voimassa vielä hetken. ` +
        `Sen jälkeen henkilökohtaista hintaa ei voi lunastaa samoilla testivastauksilla.<br><br>` +
        `Jos ${fieldLabel} on unelmiesi ala, nyt on aika sitoutua — ei viime tingassa ennen koetta.`,
      bullets: [
        "Aloitat heti maksun jälkeen",
        "Ei piilokuluja — kertamaksu",
        "Peru markkinointi koska tahansa",
      ],
      urgency: (p) => `🔴 Viimeinen mahdollisuus: ${p.priceEur} € ennen tarjouksen sulkeutumista.`,
      cta: "Siirry kassalle",
    },
  ];
}

export function streamFromExamCode(code) {
  if (!code || typeof code !== "string") return null;
  const key = `valintakoe_${code.toLowerCase()}`;
  return DRIP_STREAMS[key] || null;
}

export function getStream(streamId) {
  return DRIP_STREAMS[streamId] || null;
}
