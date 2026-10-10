import type { NurtureBrand } from "./brand-config.ts";
import { examCodeUpper } from "./brand-config.ts";
import type { NurtureStep, TemplateKey } from "./sequences.ts";
import { F_AALTO_CUTOFF_PCT } from "./sequences.ts";
import { signDealToken } from "./discount-token.ts";

export type RenderContext = {
  email: string;
  firstName?: string | null;
  brand: NurtureBrand;
  step: NurtureStep;
  streamType: string;
  unsubscribeUrl: string;
  ctaUrl: string;
  /** F B-viesti 1: dynaaminen heikkous (esim. "aineistotehtävissä"). */
  weaknessHint?: string | null;
};

type EmailTpl = { subject: string; body: string; cta: string; notes?: string };

function greeting(ctx: RenderContext): string {
  if (ctx.firstName) return `Hei ${ctx.firstName},`;
  return "Hei,";
}

function weaknessPhrase(ctx: RenderContext): string {
  const w = (ctx.weaknessHint || "").trim();
  return w || "aineistotehtävissä";
}

/** Valintakoe F Pro — Hopkins-malliset Stream B -viestit. */
function templatesFStreamB(ctx: RenderContext): Partial<Record<TemplateKey, EmailTpl>> {
  const weakness = weaknessPhrase(ctx);
  const discount = ctx.step.discountPct ?? 30;

  return {
    T4_UNREAD: {
      subject: "Valintakoe F: Lähtötasotestisi tulos ja analyysi",
      body:
        `${greeting(ctx)}\n\n` +
        `Testisi on analysoitu. Valintakoe F ei testaa sitä, kuinka monta kirjaa olet lukenut ulkoa. Se testaa tiedon prosessointinopeutta ja loogista päättelyä äärimmäisen aikapaineen alla.\n\n` +
        `Datamme perusteella suurin yksittäinen riskisi karsiutua on ajan loppuminen ${weakness}.\n\n` +
        `Jos jatkat perinteistä lukemista, tämä heikkous ei korjaannu. Valintakoe F Pro on rakennettu simuloimaan kokeen aikarajoja ja pakottamaan sinut nopeammaksi niissä osioissa, joissa häviät pisteitä.\n\n` +
        `Katso tarkka tulosraporttisi ja aloita nopeutesi optimointi välittömästi.`,
      cta: "KATSO RAPORTTI JA ALOITA PRO",
    },
    T5_PAIN: {
      subject: "Miksi 70 % kauppakorkeakouluun hakijoista treenaa väärin",
      body:
        `${greeting(ctx)}\n\n` +
        `Suurin virhe, jonka voit tehdä tällä viikolla, on avata oppikirja sivulta yksi ja alkaa lukea ilman dataan perustuvaa suunnitelmaa.\n\n` +
        `Tämä toimi vanhassa pääsykokeessa. Uudessa F-kokeessa se on varma tapa epäonnistua. Kun opiskelet asioita satunnaisesti, tuhlaat satoja tunteja materiaaliin, jonka jo osaat, ja jätät kriittiset heikkoutesi (kuten nopean todennäköisyyksien laskennan) huomiotta.\n\n` +
        `F Pro -järjestelmä mittaa sekuntikellolla jokaisen vastauksesi ja syöttää sinulle vain niitä tehtävätyyppejä, joissa olet hitain. Se on puhdasta, numeerista tuloksen tekoa.`,
      cta: "KORJAA OPISKELUTEKNIIKKASI TÄNÄÄN",
    },
    T2_SMALL_STEP: {
      subject: "Yksi muutos logiikkatehtäviin (Säästää 3 minuuttia kokeessa)",
      body:
        `${greeting(ctx)}\n\n` +
        `Tässä on suora fakta Valintakoe F:n loogisesta osiosta: Älä koskaan lue aineistoa ensin.\n\n` +
        `Kokeen laatijat piilottavat tekstiin tahallaan ylimääräistä dataa kuluttaakseen aikaasi. Lue aina ensin kysymys, tunnista vaadittu muuttuja ja skannaa teksti vain sen osalta. Tämä säästää keskimäärin 3 minuuttia per osio.\n\n` +
        `PRO-järjestelmämme pakottaa sinut tähän rytmiin. Koesimulaattorimme katkaisee ajan armottomasti, jotta opit eliminoimaan turhan lukemisen paineen alla.`,
      cta: "KOKEILE KOESIMULAATTORIA PRO-TILILLÄ",
    },
    T6_FAQ: {
      subject: "Mitä oikeasti tapahtuu, kun avaat Valintakoe F Pro:n?",
      body:
        `${greeting(ctx)}\n\n` +
        `Moni kysyy, mitä PRO-paketti tarkalleen sisältää. Vastaus on yksinkertainen: kaiken tarvittavan infrastruktuurin sisäänpääsyyn.\n\n` +
        `Diagnostinen kysymyspankki: Ei satunnaisia kysymyksiä. Järjestelmä etsii aukot osaamisessasi ja pakottaa sinut paikkaamaan ne.\n\n` +
        `Koesimulaatiot: Rakennettu vastaamaan kokeen oikeaa käyttöliittymää ja aikapainetta. Kun astut koesaliin, tilanne on sinulle rutiinia.\n\n` +
        `Teoria vain tarpeeseen: Puristettu ja optimoitu teoria, jota käytät vain, kun jäät jumiin tehtävissä.\n\n` +
        `Aikaa kokeeseen on rajallisesti. Paras aika aloittaa tehokas toistojen tekeminen on tänään.`,
      cta: "AVAA KOKO JÄRJESTELMÄ",
    },
    T3_DELETE_PLAN: {
      subject: "Testitulostesi pohjalta tehty lukusuunnitelma poistuu 48h kuluttua",
      body:
        `${greeting(ctx)}\n\n` +
        `Teit lähtötasotestin kanssamme muutama viikko sitten. Järjestelmämme on pitänyt sinulle luotua personoitua heikkousanalyysiä ja lukusuunnitelmaa aktiivisena.\n\n` +
        `Koska haluamme pitää palvelinkapasiteettimme sataprosenttisesti aktiivisten treenaajien käytössä, arkistoimme inaktiiviset profiilit automaattisesti 48 tunnin kuluttua.\n\n` +
        `Jos haluat säilyttää datasi ja aloittaa treenaamisen F-kokeeseen optimoidulla putkellamme, aktivoi tilisi nyt.`,
      cta: "AKTIVOI PRO-TILI ENNEN ARKISTOINTIA",
    },
    T1_HOT_DEAL: {
      subject: `Viimeinen mahdollisuus epäreiluun etuun (PRO -${discount} %)`,
      body:
        `${greeting(ctx)}\n\n` +
        `Huomaan, ettet ole vielä tehnyt päätöstä valmistautumisestasi. Tiedämme datasta, että ne opiskelijat, jotka aloittavat simulaatiot tässä vaiheessa vuotta, saavat merkittävän etumatkan kevään hakijoihin.\n\n` +
        `Haluamme palkita hakijat, jotka ovat valmiita sitoutumaan ajoissa. Koska teit alkuperäisen testin kanssamme, saat Valintakoe F Pro -järjestelmän täyden käyttöoikeuden ${discount} % alennuksella.\n\n` +
        `Käytä koodia FAST30 kassalla. Koodi on aktiivinen tasan 48 tuntia. Tämän jälkeen hinta palautuu normaaliksi.`,
      cta: "LUNASTA EDUSI TÄSTÄ",
      notes: "FAST30 voimassa 48 tuntia.",
    },
  };
}

/** Valintakoe F Pro — maintenance-luuppi (3 viestiä). */
function templatesFMaintenance(ctx: RenderContext): Partial<Record<TemplateKey, EmailTpl>> {
  const cutoff = F_AALTO_CUTOFF_PCT;
  return {
    M1_CUTOFF: {
      subject: `Aalto-yliopiston pisteraja oli noin ${cutoff} % – Riittääkö nopeutesi?`,
      body:
        `${greeting(ctx)}\n\n` +
        `Kylmä muistutus edellisen vuoden pisterajoista.\n\n` +
        `Keskimäärin sisäänpääsy vaati noin ${cutoff} % oikeita vastauksia. Manuaalinen opiskelu ei skaalaudu tähän. Varmista rutiinisi F Pro -simulaattorilla.`,
      cta: "VARMISTA RUTIINISI SIMULAATTORILLA",
    },
    M2_GAP_YEAR: {
      subject: "Välivuoden todellinen hinta on yli 30 000 euroa",
      body:
        `${greeting(ctx)}\n\n` +
        `Jokainen välivuosi viivästyttää valmistumista ja siirtää ensimmäisen vuoden asiantuntijapalkkaa (keskimäärin 30k–40k €). F Pro:n hinta on mikroskooppinen investointi tähän verrattuna.\n\n` +
        `Älä riskeeraa vuotta elämästäsi väärän opiskelutekniikan takia.`,
      cta: "ALOITA F PRO NYT",
    },
    M3_PROBABILITY: {
      subject: "Miten vältät todennäköisyyslaskennan ansat F-kokeessa",
      body:
        `${greeting(ctx)}\n\n` +
        `Lyhyt tekninen vinkki: älä laske “kaikkia tapauksia” ennen kuin olet rajannut ehdot. F-kokeessa todennäköisyystehtävät piilottavat ylimääräisiä ehtoja juuri siksi, että hakija hukkaa minuutin turhaan haarukointiin.\n\n` +
        `Kirjoita ensin ehto (mikä muuttuja on kiinnitetty), sitten laske. Pro-käyttäjämme tekevät näitä toistoja satoja kertoja viikossa, kunnes ne tulevat selkärangasta. Liity mukaan.`,
      cta: "LIITY F PRO -HARJOITTELUUN",
    },
  };
}

function templatesGeneric(ctx: RenderContext): Record<TemplateKey, EmailTpl> {
  const code = examCodeUpper(ctx.brand.exam);
  const field = ctx.brand.fieldLabel;
  const discount = ctx.step.discountPct ?? 25;
  const reason = ctx.step.discountReason ?? "olet mukana listallamme";

  return {
    T1_HOT_DEAL: {
      subject: `Viimeinen mahdollisuus: -${discount} % Koe ${code} -valmennukseen`,
      body:
        `${greeting(ctx)}\n\n` +
        `Tiedämme, että maksullisen valmennuksen tilaaminen tuntuu isolta päätökseltä — varsinkin ennen kuin olet nähnyt, miten tehtävät oikeasti tuntuvat.\n\n` +
        `Koska ${reason}, saat kertaluonteisen -${discount} % alennuksen. Et näe tätä hintaa julkisesti.\n\n` +
        `Voimassa 7 päivää.`,
      cta: `LUNASTA -${discount} %`,
      notes: "Voimassa 7 päivää.",
    },
    T2_SMALL_STEP: {
      subject: "1 % parempi tänään",
      body:
        `${greeting(ctx)}\n\n` +
        `Iso tulos alkaa pienestä: yksi tehtävä. Yksi kysymys AI-professorille. Yksi virhe, jonka korjaat heti.\n\n` +
        `Tilisi on valmis. Suunnitelmasi odottaa.`,
      cta: "JATKA SUUNNITELMAA",
    },
    T3_DELETE_PLAN: {
      subject: "Henkilökohtainen suunnitelmasi poistuu pian ☹️",
      body:
        `${greeting(ctx)}\n\n` +
        `Plan ID: ${ctx.email.slice(0, 8)} · Tyyppi: Koe ${code} -valmennus · Sähköposti: ${ctx.email}\n\n` +
        `Emme ole kuulleet sinusta vähään aikaan. Jos tavoitteesi on muuttunut, se on täysin ok — poistamme suunnitelman.\n\n` +
        `Jos haluat vielä päästä ${field} opiskelemaan, tallenna suunnitelmasi ennen kuin linkki vanhenee.`,
      cta: "TALLENNA SUUNNITELMA",
    },
    T4_UNREAD: {
      subject:
        ctx.streamType === "B"
          ? "Sinulle on valmis vastaus"
          : "AI-professori vastasi kysymykseesi",
      body:
        `${greeting(ctx)}\n\n` +
        (ctx.streamType === "B"
          ? `Moni Koe ${code} -hakija kysyy ensin: "Mistä aloitan?" Sinulle on valmis vastaus — yksi konkreettinen ensimmäinen askel kohti ${field}.\n\n`
          : `AI-professorisi on valmis auttamaan. Kysymyksesi ei jää roikkumaan — saat selityksen, ei vain oikeaa vastausta.\n\n`) +
        `Avaa tili ja kokeile yhtä tehtävää tänään. Viisi minuuttia riittää.`,
      cta: ctx.streamType === "B" ? "KOKEILE ILMAISEKSI" : "LUE VASTAUS",
    },
    T5_PAIN: {
      subject: `Moni Koe ${code} -hakija tekee saman virheen`,
      body:
        `${greeting(ctx)}\n\n` +
        `He lukevat teoriaa satunnaisesti. Tekevät pari vanhaa koetta. Sitten ihmettelevät, miksi pisteet eivät nouse.\n\n` +
        `Valintakoe ${code} mittaa systemaattisuutta — ei tuuria. Siksi rakennettu harjoittelu ja AI-palaute voittavat YouTube-selailun.\n\n` +
        `Yksi tehtävä, viisi minuuttia.`,
      cta: "KOKEILE ILMAISEKSI",
    },
    T6_FAQ: {
      subject:
        ctx.streamType === "B" || ctx.streamType === "maintenance"
          ? "Mitä PRO sisältää — ja milloin aloittaa?"
          : "Mitä saat PROlla vs. ilmainen tili",
      body:
        `${greeting(ctx)}\n\n` +
        (ctx.streamType === "C"
          ? `Ilmainen tili: rajattu tehtävämäärä ja perus-AI. PRO: rajaton harjoittelu, koesimulaatiot, AI-professori ilman rajoituksia ja henkilökohtainen etenemispolku kohti ${field}.\n\n`
          : `PRO sisältää: teoria osa-alueittain, rajaton AI-harjoittelu, koesimulaatiot ja selkeän viikkorytmin. Paras aika aloittaa on nyt — ei viime tingassa ennen koetta.\n\n`) +
        `Kysymyksiä? Vastaa tähän viestiin tai avaa sovellus.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M1_CUTOFF: {
      subject: `Aalto-yliopiston pisteraja oli noin ${F_AALTO_CUTOFF_PCT} % – Riittääkö nopeutesi?`,
      body: `${greeting(ctx)}\n\nKeskimäärin sisäänpääsy vaati noin ${F_AALTO_CUTOFF_PCT} % oikeita vastauksia.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M2_GAP_YEAR: {
      subject: "Välivuoden todellinen hinta on yli 30 000 euroa",
      body: `${greeting(ctx)}\n\nÄlä riskeeraa vuotta elämästäsi väärän opiskelutekniikan takia.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M3_PROBABILITY: {
      subject: "Miten vältät todennäköisyyslaskennan ansat F-kokeessa",
      body: `${greeting(ctx)}\n\nPro-käyttäjämme tekevät näitä toistoja satoja kertoja viikossa.`,
      cta: "KATSO PRO-PAKETTI",
    },
  };
}

function resolveTemplate(ctx: RenderContext): EmailTpl {
  const exam = ctx.brand.exam;
  if (exam === "f" && ctx.streamType === "B") {
    const f = templatesFStreamB(ctx)[ctx.step.template];
    if (f) return f;
  }
  if (exam === "f" && ctx.streamType === "maintenance") {
    const f = templatesFMaintenance(ctx)[ctx.step.template];
    if (f) return f;
  }
  return templatesGeneric(ctx)[ctx.step.template];
}

export function renderNurtureEmail(ctx: RenderContext): { subject: string; html: string; text: string } {
  const tpl = resolveTemplate(ctx);
  const { brand, ctaUrl, unsubscribeUrl } = ctx;

  const bodyHtml = tpl.body
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;color:#334155;font-size:15px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const notesHtml = tpl.notes
    ? `<p style="margin:0 0 16px;font-size:13px;color:#64748b">${tpl.notes}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fi">
<body style="margin:0;background:#f4f6f8;font-family:system-ui,sans-serif;color:#0A2540">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:${brand.headerBg};color:#fff;border-radius:16px 16px 0 0;padding:24px;text-align:center">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${brand.accentColor}">${brand.siteName}</p>
      <h1 style="margin:12px 0 0;font-size:20px;line-height:1.3;font-weight:700">${tpl.subject}</h1>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;border:1px solid #e5e7eb;border-top:0">
      ${bodyHtml}
      ${notesHtml}
      <a href="${ctaUrl}" style="display:block;text-align:center;background:${brand.buttonBg};color:${brand.buttonText};font-weight:800;text-decoration:none;padding:16px 24px;border-radius:999px;font-size:15px;margin-top:8px">${tpl.cta}</a>
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.5">
        <a href="${unsubscribeUrl}" style="color:#64748b">Peru markkinointi (${brand.siteName})</a>
        · Jos olet jo asiakas, voit jättää tämän huomiotta
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `${tpl.subject}\n\n${tpl.body}\n\n${tpl.cta}: ${ctaUrl}\n\nPeru: ${unsubscribeUrl}`;

  return { subject: tpl.subject, html, text };
}

/** Map hub pain → F-heikkousfraasi viestiin 1. */
export function weaknessHintFromPain(painKey?: string | null): string {
  const k = (painKey || "").toLowerCase();
  if (k === "time") return "aineistotehtävissä (ajan hallinta)";
  if (k === "compete") return "loogisessa päättelyssä aikapaineessa";
  if (k === "fear") return "aineistotehtävissä";
  return "aineistotehtävissä";
}

export async function ctaUrlForStep(
  brand: NurtureBrand,
  streamType: string,
  step: NurtureStep,
  email?: string,
): Promise<string> {
  const base = brand.siteUrl.replace(/\/$/, "");
  const isFHopkinsCta =
    brand.exam === "f" &&
    (streamType === "B" || streamType === "maintenance") &&
    (step.template === "T1_HOT_DEAL" ||
      step.template === "T3_DELETE_PLAN" ||
      step.template === "T6_FAQ" ||
      step.template.startsWith("M"));

  if (step.template === "T1_HOT_DEAL") {
    const discount = step.discountPct ?? 25;
    const params = new URLSearchParams({
      utm_source: "nurture",
      utm_medium: `${streamType}_hot_deal`,
      utm_campaign: brand.exam,
    });
    if (brand.exam === "f") params.set("code", "FAST30");
    if (email) {
      try {
        const ttlMs = brand.exam === "f" ? 48 * 60 * 60 * 1000 : undefined;
        const token = await signDealToken(email, brand.exam, discount, ttlMs);
        params.set("token", token);
      } catch {
        /* token optional if secret missing in dev */
      }
    }
    return `${base}/hinnoittelu?${params.toString()}`;
  }

  if (isFHopkinsCta) {
    return `${base}/hinnoittelu?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
  }

  if (streamType === "B") {
    return `${base}/auth?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
  }
  return `${base}/?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
}
