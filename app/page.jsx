// Pääsykoe.fi — tietopankki yliopistojen kansallisista valintakokeista.
// Semanttinen HTML (h1/h2/h3/p), virallinen ilme, JSON-LD (FAQPage) SEO:ta varten.

import CoursesGrid from "./components/CoursesGrid";
import Quiz from "./tasotesti/Quiz";

/* ---------------- ikonit / merkit ---------------- */
function Logo({ className = "h-11 w-11" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M6 18V8a2 2 0 0 1 2-2h10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <path d="M42 30v10a2 2 0 0 1-2 2H30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <circle cx="24" cy="26" r="11" fill="#6ee7b7" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
const FlagFI = () => (<svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20"><rect width="18" height="12" fill="#fff" /><rect x="5" width="3" height="12" fill="#0A2540" /><rect y="4.5" width="18" height="3" fill="#0A2540" /></svg>);
const FlagSE = () => (<svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20"><rect width="18" height="12" fill="#0A2540" /><rect x="5" width="3" height="12" fill="#FFC600" /><rect y="4.5" width="18" height="3" fill="#FFC600" /></svg>);
const FlagEN = () => (<svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20"><rect width="18" height="12" fill="#0A2540" /><path d="M0 0l18 12M18 0L0 12" stroke="#fff" strokeWidth="2" /><path d="M9 0v12M0 6h18" stroke="#fff" strokeWidth="3" /><path d="M9 0v12M0 6h18" stroke="#C8102E" strokeWidth="1.5" /></svg>);

const NAV = ["Etusivu", "Koulutukset & hakeminen", "Todistusvalinta", "Valintakokeet", "Yhteystiedot"];

/* ---------------- data ---------------- */
const EXAMS = [
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
function TopNav() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex h-[88px] max-w-site items-center gap-8 px-6 md:px-8">
        <a href="#" className="flex shrink-0 items-center" aria-label="Pääsykoe.fi"><Logo /></a>
        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Päävalikko">
          {NAV.map((item, i) => (
            <a key={item} href="#" className={`font-heading text-[15px] font-semibold transition-colors ${i === 3 ? "text-gold" : "text-white/90 hover:text-gold"}`}>{item}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <button aria-label="Suomeksi"><FlagFI /></button>
            <button aria-label="På svenska"><FlagSE /></button>
            <button aria-label="In English"><FlagEN /></button>
          </div>
          <button aria-label="Haku" className="ml-2 text-white/90 hover:text-gold"><SearchIcon /></button>
        </div>
      </div>
    </header>
  );
}

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
          <span className="text-sm font-semibold text-navy/60">2 min · maksuton · saat henkilökohtaisen suosituksen</span>
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
function Footer() {
  const cols = [
    ["Koulutukset & hakeminen", ["Hakeminen", "Aikataulut", "Hakukohteet"]],
    ["Todistusvalinta", ["Pisteytys", "Vertailu", "Usein kysyttyä"]],
    ["Valintakokeet", ["Yhdeksän koetta", "Valmistautuminen", "FAQ"]],
  ];
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Tietopankki yliopistojen kansallisista valintakokeista 2026–2027.
          </p>
        </div>
        {cols.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">{title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {links.map((l) => (<li key={l}><a href="#" className="hover:text-white">{l}</a></li>))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-site px-6 py-5 text-xs text-white/50 md:px-8">© 2026 Pääsykoe.fi — tietopankki.</div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <>
      {/* JSON-LD (FAQPage) SEO:ta varten */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main>
        <TopNav />
        <Hero />
        <ExamGrid />
        <TasotestiSection />
        <Preparation />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
