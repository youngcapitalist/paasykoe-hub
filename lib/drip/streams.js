/** Follow-up -sekvenssit per tuote/koe. Vaihe 0 = heti quiz-jälkeen (erillinen posti). */

import { examSampleForCode } from "./exam-samples.js";

const LAUDATUR_BULLETS = [
  "Teoria osa-alueittain — ei satunnaista selaamista",
  "AI-professori jokaisessa aineessa, 24/7",
  "1000+ harjoitustehtävää ja harkkakoe ennen yo-koetta",
  "Henkilökohtainen hinta — ei julkisesti saatavilla",
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
            `Kirjoitat <strong>${subjects}</strong> — hyvä lähtökohta. ` +
            `Moni jättää yo-valmistautumisen liian myöhään; aikainen aloitus antaa selkeän edun.<br><br>` +
            `Ensimmäinen viikko kannattaa aloittaa yhdestä aineesta kerrallaan: teoria → AI-professori → harjoitustehtävät. ` +
            `Näin et huku materiaaliin, vaan näet nopeasti edistymisen.`
          );
        },
        bullets: LAUDATUR_BULLETS,
        urgency: (p) =>
          p.priceEur
            ? `Henkilökohtainen hintasi ${p.priceEur} € — voimassa rajoitetun ajan.`
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
          "Henkilökohtainen tarjous — et saa samaa hintaa uudelleen",
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
              ? `Paketissasi säästät arviolta <strong>${savings} €</strong> verrattuna ainekohtaisiin paketteihin. `
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
          `Hintasi <strong>${p.priceEur} €</strong> on voimassa vielä hetken. ` +
          `Kun suljemme tarjousikkunan, et voi enää lunastaa samaa hintaa — ` +
          `joudut maksamaan normaalin listahinnan.<br><br>` +
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
  const painLead = (p) => {
    if (p?.painHook) return `${p.painHook}<br><br>`;
    return "";
  };
  const fieldCtx = (p) => {
    const field = p?.recommendedField || p?.preferredField || fieldLabel;
    return field;
  };

  return [
    {
      delayHours: 24,
      subject: (p) => `Valintakoe ${code} — suunnitelmasi (${p.priceEur || ""} €)`.trim(),
      headline: "Näin aloitat valmistautumisen",
      body: (p) =>
        painLead(p) +
        `Valmennus kohti <strong>${fieldCtx(p)}</strong> on valmis. ` +
        `Valintakoe ${code} on kilpailtu — systemaattinen harjoittelu erottaa hakijat, jotka pääsevät ensimmäisellä yrityksellä.<br><br>` +
        `Aloita teoriasta, siirry AI-professorin kanssa harjoittelemaan ja tee simuloituja kokeita oikeaan tempoan.`,
      bullets: (p) => [
        "Teoria ja harjoituskokeet samassa alustassa",
        "AI-professorit kehityskohteisiin",
        p?.priceEur ? `Henkilökohtainen hinta ${p.priceEur} €` : "Henkilökohtainen tarjous",
      ],
      urgency: (p) =>
        p?.priceEur ? `Tarjouksesi ${p.priceEur} € — voimassa rajoitetun ajan.` : null,
      cta: "Avaa minun suunnitelmani",
    },
    {
      delayHours: 48,
      subject: (p) => `Tarjouksesi ${p.priceEur || ""} € vanhenee pian — Valintakoe ${code}`.trim(),
      headline: "Tarjous ei ole ikuisesti voimassa",
      body: () =>
        "Moni hakija odottaa liian kauan ennen kuin aloittaa valmistautumisen. " +
        "Valintakoe mittaa systemaattisuutta — ja sitä voi treenata, jos aloitat ajoissa.<br><br>" +
        "Henkilökohtainen hintasi on voimassa rajoitetun ajan. Et näe samaa hintaa uudelleen, jos tarjous vanhenee.",
      bullets: [
        "Harjoituskokeet oikeaan koetilanteeseen",
        "Selkeä etenemispolku viikko kerrallaan",
        "Peru markkinointi yhdellä klikkauksella",
      ],
      urgency: (p) =>
        p.priceEur ? `⚠️ ${p.priceEur} € -tarjous vanhenee pian — lunasta ennen kuin se poistuu.` : null,
      cta: "Lunasta tarjoukseni",
    },
    {
      delayHours: 72,
      sampleOnly: true,
      subject: () => {
        const s = examSampleForCode(code);
        return s?.kind === "teoria"
          ? `Ilmainen teoriaosuus — Valintakoe ${code}`
          : `Kokeile AI-professoria — Valintakoe ${code}`;
      },
      headline: () => examSampleForCode(code)?.headline || "Kokeile ilmaiseksi",
      body: () => {
        const s = examSampleForCode(code);
        if (s?.kind === "teoria") {
          return (
            `Ennen kuin päätät, voit tutustua ensimmäiseen teoriaosuuteen ilmaiseksi: <strong>${s.title}</strong>.<br><br>` +
            `Näet miten materiaali on rakennettu ja voitko seurata sitä. Henkilökohtainen tarjouksesi odottaa alla — voit palata siihen milloin tahansa.`
          );
        }
        return (
          `Teoriaosiota ei ole vielä avattu kaikille, mutta voit kokeilla <strong>AI-professoreita</strong> ilmaiseksi — ` +
          `kysy mitä tahansa valintakoe-aiheista ja näe miten valmennus tukee valmistautumista.<br><br>` +
          `Henkilökohtainen tarjouksesi odottaa alla.`
        );
      },
      bullets: () => {
        const s = examSampleForCode(code);
        if (s?.kind === "teoria") {
          return [
            "Avoin teoriaosuus — ei rekisteröitymistä",
            "Näe miten materiaali on rakennettu",
            "Tarjouksesi odottaa alla",
          ];
        }
        return [
          "Kysy AI-professorilta vapaasti",
          "Näe miten valmennus tukee valmistautumista",
          "Henkilökohtainen tarjouksesi odottaa alla",
        ];
      },
      urgency: null,
      cta: () => examSampleForCode(code)?.cta || "Kokeile ilmaiseksi",
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
      rescueDiscount: 0.33,
      subject: (p) =>
        p.rescuePriceEur
          ? `Viimeinen viesti: -${p.rescuePct} % Valintakoe ${code} (${p.rescuePriceEur} €)`
          : `Viimeinen muistutus — ${p.priceEur} € (Valintakoe ${code})`,
      headline: "Suljemme tarjouksesi — viimeinen mahdollisuus",
      body: (p) =>
        p.rescuePriceEur
          ? `Tämä on viimeinen viestimme — sen jälkeen tarjouksesi poistuu.<br><br>` +
            `Koska teit testin loppuun asti, annamme kertaluonteisen <strong>-${p.rescuePct} %</strong> alennuksen: ` +
            `<strong>${p.rescuePriceEur} €</strong> (aiemmin ${p.originalPriceEur} €). ` +
            `Tätä hintaa ei toisteta.<br><br>` +
            `Linkki on voimassa 7 päivää — sen jälkeen palaat normaalihintaan.`
          : `Tämä on viimeinen muistutuksemme.<br><br>` +
            `Tarjouksesi <strong>${p.priceEur} €</strong> perustuu testivastauksiisi. ` +
            `Kun suljemme tarjousikkunan, et voi enää lunastaa samaa hintaa.<br><br>` +
            `Jos ${fieldLabel} on unelmiesi ala, nyt on aika sitoutua.`,
      bullets: [
        "Aloitat heti maksun jälkeen",
        "Ei piilokuluja — kertamaksu",
        "Peru markkinointi yhdellä klikkauksella — emme lähetä enempää viestejä",
      ],
      urgency: (p) =>
        p.rescuePriceEur
          ? `🔴 Kertaluonteinen ${p.rescuePriceEur} € -hinta on voimassa 7 päivää. Tämän jälkeen linkki ei enää toimi.`
          : `🔴 Viimeinen mahdollisuus: ${p.priceEur} € ennen tarjouksen sulkeutumista.`,
      cta: (p) => (p.rescuePriceEur ? `Lunasta -${p.rescuePct} % nyt` : "Siirry kassalle"),
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
