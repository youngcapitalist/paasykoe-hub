// Pääsykoe.fi — virallisen yliopistohaku/Opintopolku-tyylin mukainen pohja.
// Teksti on toistaiseksi lorem ipsumia; fokus on UI:ssa ja tyyleissä.

/* ---------- pienet ikoni-/merkkikomponentit ---------- */
function Logo({ className = "h-11 w-11" }) {
  // Square-frame + keltainen ympyrä (virallisen tunnuksen henki)
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M6 18V8a2 2 0 0 1 2-2h10"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path
        d="M42 30v10a2 2 0 0 1-2 2H30"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <circle cx="24" cy="26" r="11" fill="#FFC600" />
    </svg>
  );
}

function ArrowCircle() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/40">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

const FlagFI = () => (
  <svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20">
    <rect width="18" height="12" fill="#fff" />
    <rect x="5" width="3" height="12" fill="#0A2540" />
    <rect y="4.5" width="18" height="3" fill="#0A2540" />
  </svg>
);
const FlagSE = () => (
  <svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20">
    <rect width="18" height="12" fill="#0A2540" />
    <rect x="5" width="3" height="12" fill="#FFC600" />
    <rect y="4.5" width="18" height="3" fill="#FFC600" />
  </svg>
);
const FlagEN = () => (
  <svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20">
    <rect width="18" height="12" fill="#0A2540" />
    <path d="M0 0l18 12M18 0L0 12" stroke="#fff" strokeWidth="2" />
    <path d="M9 0v12M0 6h18" stroke="#fff" strokeWidth="3" />
    <path d="M9 0v12M0 6h18" stroke="#C8102E" strokeWidth="1.5" />
  </svg>
);

const NAV = ["Etusivu", "Koulutukset & hakeminen", "Todistusvalinta", "Valintakokeet", "Yhteystiedot"];

/* ---------- yläpalkki ---------- */
function TopNav() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex h-[88px] max-w-site items-center gap-8 px-6 md:px-8">
        <a href="#" className="flex shrink-0 items-center" aria-label="Pääsykoe.fi">
          <Logo />
        </a>
        <nav className="hidden flex-1 items-center gap-7 lg:flex">
          {NAV.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`font-heading text-[15px] font-semibold transition-colors ${
                i === 3 ? "text-gold" : "text-white/90 hover:text-gold"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <button aria-label="Suomeksi"><FlagFI /></button>
            <button aria-label="På svenska"><FlagSE /></button>
            <button aria-label="In English"><FlagEN /></button>
          </div>
          <button aria-label="Haku" className="ml-2 text-white/90 hover:text-gold">
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* keltainen ympyrä bleedaa vasemmalta */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -z-0 h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-gold" />
      <div className="relative z-10 mx-auto grid max-w-site items-center gap-10 px-6 py-16 md:px-8 md:py-24 lg:grid-cols-2">
        <div>
          <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-navy md:text-6xl lg:text-7xl">
            Opiskelijaksi
            <br />
            yliopistoon?
          </h1>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-between gap-4 rounded-pill bg-navy py-3.5 pl-7 pr-3.5 font-heading text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark"
            >
              Tutustu todistusvalinnan pisteytyksiin
              <ArrowCircle />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-between gap-4 rounded-pill bg-navy py-3.5 pl-7 pr-3.5 font-heading text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark"
            >
              Osallistu valintakokeeseen
              <ArrowCircle />
            </a>
          </div>
        </div>
        {/* kuvapaikka */}
        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] w-full rounded-2xl bg-mist ring-1 ring-line" />
        </div>
      </div>
    </section>
  );
}

/* ---------- sivuotsikkokaista (esim. "Valintakokeet") ---------- */
function PageHeader() {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold" />
      <div className="relative z-10 mx-auto max-w-site px-6 py-16 md:px-8 md:py-20">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-navy md:text-6xl">
          Valintakokeet
        </h1>
      </div>
    </section>
  );
}

/* ---------- valintakokeet: info per koe + hienovarainen valmennuslinkki ---------- */
const EXAMS = [
  {
    code: "F",
    field: "Kauppatieteellinen ala",
    desc: "Kauppatieteiden kandidaattikoulutusten yhteisvalinta. Mukana mm. Aalto-yliopiston kauppakorkeakoulu, Hanken, Tampere, Turku, Jyväskylä, LUT, Oulu, Vaasa ja Itä-Suomen yliopisto.",
    href: "https://valintakoefpro.com",
    prep: "Harjoitustehtävät ja koesimulaatiot",
  },
  {
    code: "A",
    field: "Tekniikka ja luonnontieteet",
    desc: "Tekniikan ja luonnontieteiden alojen valintakoe. Käytössä useiden yliopistojen diplomi-insinööri- ja luonnontieteiden hauissa.",
    href: "https://valintakoea.fi",
    prep: "Harjoitustehtävät ja koesimulaatiot",
  },
  {
    code: "B",
    field: "Lääketiede ja bioalat",
    desc: "Lääketieteellisten alojen ja bioalojen valintakoe. Mittaa luonnontieteellistä osaamista ja soveltamiskykyä.",
    href: "https://valintakoeb.fi",
    prep: "Harjoitustehtävät ja koesimulaatiot",
  },
  {
    code: "C",
    field: "Luonnonvara- ja ympäristöalat",
    desc: "Luonnonvara-, ympäristö- ja maataloustieteellisten alojen valintakoe.",
    href: "https://valintakoec.fi",
    prep: "Harjoitustehtävät ja koesimulaatiot",
  },
  {
    code: "E",
    field: "Kasvatustieteet",
    desc: "Kasvatusalan valintakoe (VAKAVA-koe). Käytössä kasvatustieteellisten alojen yhteisvalinnassa.",
    href: "https://valintakoee.fi",
    prep: "Harjoitustehtävät ja koesimulaatiot",
  },
];

function ExamList() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-site px-6 md:px-8">
        <p className="mb-10 max-w-3xl text-[17px] leading-relaxed text-navy/80">
          Yliopistot järjestävät kansallisia valintakokeita (pääsykokeita) koulutusaloittain.
          Alla on koottu, mille aloille kullakin kokeella voi hakea sekä mistä löydät
          valmistautumismateriaalia.
        </p>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {EXAMS.map((e) => (
            <article key={e.code} className="grid gap-5 bg-white p-6 md:grid-cols-[auto_1fr] md:gap-7 md:p-8">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy font-heading text-2xl font-extrabold text-gold">
                {e.code}
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-navy">
                  Koe {e.code} — {e.field}
                </h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-navy/75">
                  {e.desc}
                </p>
                <a
                  href={e.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-navy-light"
                >
                  {e.prep}
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- navy infolaatikko ---------- */
function InfoBox() {
  return (
    <section className="bg-white pb-16 md:pb-20">
      <div className="mx-auto max-w-site px-6 md:px-8">
        <div className="rounded-2xl bg-navy px-6 py-12 text-center text-white md:px-16 md:py-16">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            Lorem ipsum dolor sit amet consectetur
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/80">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam. <span className="font-semibold text-gold">Lorem ipsum dolor</span>.
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
            adipisci velit, sed quia non numquam eius modi tempora incidunt.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- yliopistologot ---------- */
function LogoGrid() {
  return (
    <section className="bg-white pb-20">
      <div className="mx-auto max-w-site px-6 md:px-8">
        <p className="mx-auto mb-12 max-w-3xl text-center text-[17px] leading-relaxed text-navy/80">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua hakijoille.
        </p>
        <div className="grid grid-cols-2 items-center gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="grid h-16 w-full max-w-[150px] place-items-center rounded-lg bg-mist text-xs font-semibold uppercase tracking-wider text-navy/30">
                Logo
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */
function Footer() {
  const cols = [
    ["Koulutukset & hakeminen", ["Lorem ipsum", "Dolor sit amet", "Consectetur"]],
    ["Todistusvalinta", ["Adipiscing elit", "Sed do eiusmod", "Tempor"]],
    ["Valintakokeet", ["Ut labore", "Et dolore", "Magna aliqua"]],
  ];
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.
          </p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">
              {title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-site px-6 py-5 text-xs text-white/50 md:px-8">
          © 2026 Pääsykoe.fi — Lorem ipsum dolor sit amet.
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main>
      <TopNav />
      <Hero />
      <PageHeader />
      <ExamList />
      <InfoBox />
      <LogoGrid />
      <Footer />
    </main>
  );
}
