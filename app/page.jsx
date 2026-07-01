// Pääsykoe.fi — tietopankki yliopistojen kansallisista valintakokeista.
// Semanttinen HTML (h1/h2/h3/p), virallinen ilme, JSON-LD (FAQPage) SEO:ta varten.

import CoursesGrid from "./components/CoursesGrid";
import Quiz from "./tasotesti/Quiz";
import { SiteNav, SiteFooter } from "./components/SiteChrome";
import { EXAMS } from "./config/site";

const FAQ = [
  { q: "Voinko osallistua useampaan valintakokeeseen?", a: "Kyllä. Voit hakea usealle eri koulutusalalle ja osallistua niitä vastaaviin kokeisiin. Huomioi kuitenkin koepäivien mahdolliset päällekkäisyydet kevään aikatauluissa." },
  { q: "Ovatko kokeet digitaalisia?", a: "Kyllä, kaikki yhdeksän kansallista valintakoetta tehdään digitaalisesti omalla kannettavalla tietokoneella valvotussa koetilanteessa." },
  { q: "Mitä eroa on todistusvalinnalla ja valintakokeella?", a: "Todistusvalinnassa opiskelupaikka myönnetään suoraan ylioppilastutkintotodistuksen arvosanojen perusteella. Valintakokeella valitaan ne hakijat (noin 50 %), jotka eivät saaneet paikkaa todistuksella tai jotka eivät ole ylioppilaita." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ---------------- yläpalkki ---------------- */
/* ---------------- hero ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className="relative z-10 mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <h1 className="max-w-4xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-navy md:text-6xl">
          Yliopistojen kansalliset valintakokeet 2026–2027
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-navy/85 md:text-xl">
          Yliopistot järjestävät yhdeksän kansallista valintakoetta (eli pääsykoetta). Kansalliset
          valintakokeet ovat digitaalisia ja ne suoritetaan omalla kannettavalla tietokoneella yliopiston
          tiloissa. Tälle sivulle on koottu ajantasainen tietopankki uudistuneista
          valintakokeista, koesisällöistä ja niihin valmistautumisesta. Valintakokeilla valitaan noin puolet
          uusista opiskelijoista kanditason opintoihin.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href="#tasotesti"
            className="inline-flex items-center gap-2 rounded-pill bg-navy px-6 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
          >
            Tee ilmainen tasotesti
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a
            href="/todistusvalinta/laskuri"
            className="inline-flex items-center gap-2 rounded-pill border-2 border-navy px-6 py-3.5 font-heading text-sm font-bold text-navy transition-colors hover:bg-mist"
          >
            Todistusvalintalaskuri
          </a>
          <span className="text-sm font-semibold text-navy/60">Maksuton · henkilökohtainen suositus</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- yhdeksän koetta (grid) ---------------- */
function ExamGrid() {
  return (
    <section className="bg-white py-14 md:py-20" aria-labelledby="kokeet-otsikko">
      <div className="mx-auto max-w-site px-6 md:px-8">
        <h2 id="kokeet-otsikko" className="font-heading text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
          Yhdeksän kansallista valintakoetta
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EXAMS.map((e) => (
            <article key={e.code} className="flex flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(10,37,64,0.18)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy font-heading text-xl font-extrabold text-gold">{e.code}</span>
                <h3 className="font-heading text-lg font-bold leading-snug text-navy">
                  {e.href ? (
                    <a href={e.href} className="text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-navy-light">
                      Valintakoe {e.code}
                    </a>
                  ) : (
                    <>Valintakoe {e.code}</>
                  )}
                  <span className="block text-sm font-semibold text-navy/60">{e.field}</span>
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-navy/80">
                <strong className="font-semibold text-navy">Koulutusalat:</strong> {e.alat}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-pill bg-mist px-3 py-1.5 text-xs font-semibold text-navy/70">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Koeaika: kevät 2027 — päivämäärää ei ole vielä julkaistu
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- tasotesti (upotettu etusivulle) ---------------- */
function TasotestiSection() {
  return (
    <section id="tasotesti" className="scroll-mt-24 bg-navy py-14 md:py-20" aria-labelledby="tasotesti-otsikko">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <span className="inline-flex items-center gap-2 rounded-pill bg-gold px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy">
          Maksuton · 2 minuuttia
        </span>
        <h2 id="tasotesti-otsikko" className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Mikä koe on juuri sinua varten?
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/80">
          Et tiedä mille alalle hakisit? Vastaa muutamaan kysymykseen, niin kerromme sinulle parhaiten
          sopivan alan, koulutuksen ja valmennuskurssin — ilmaiseksi ja ilman sitoutumista.
        </p>
        <div className="mt-8">
          <Quiz />
        </div>
      </div>
    </section>
  );
}

/* ---------------- valmistautuminen ---------------- */
function Preparation() {
  return (
    <section className="bg-mist py-14 md:py-20" aria-labelledby="valmistautuminen-otsikko">
      <div className="mx-auto max-w-site px-6 md:px-8">
        <h2 id="valmistautuminen-otsikko" className="font-heading text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
          Miten valintakokeisiin kannattaa valmistautua?
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy/85">
          Vaikka uudet valintakokeet perustuvat vahvemmin lukion oppimääriin (kuten LOPS 2021), aineistojen
          soveltaminen on edelleen keskiössä. Tilastojen mukaan järjestelmällinen
          valmistautuminen, vanhojen kokeiden simulointi ja oikeanlaisen vastaustekniikan harjoittelu ovat
          ratkaisevassa asemassa sisäänpääsyssä.
        </p>

        <CoursesGrid />
      </div>
    </section>
  );
}

/* ---------------- FAQ (accordion, native <details>) ---------------- */
function Faq() {
  return (
    <section className="bg-white py-14 md:py-20" aria-labelledby="faq-otsikko">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <h2 id="faq-otsikko" className="font-heading text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
          Usein kysytyt kysymykset
        </h2>
        <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-heading text-base font-semibold text-navy">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy/5 text-navy transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-navy/80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
export default function Page() {
  return (
    <>
      {/* JSON-LD (FAQPage) SEO:ta varten */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main>
        <SiteNav activePath="/" />
        <Hero />
        <ExamGrid />
        <TasotestiSection />
        <Preparation />
        <Faq />
        <SiteFooter />
      </main>
    </>
  );
}
