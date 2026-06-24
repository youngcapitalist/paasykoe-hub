// Pääsykoe.fi — riippumaton tietopankki yliopistojen kansallisista valintakokeista.
// Semanttinen HTML (h1/h2/h3/p), virallinen ilme, JSON-LD (FAQPage) SEO:ta varten.

/* ---------------- ikonit / merkit ---------------- */
function Logo({ className = "h-11 w-11" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M6 18V8a2 2 0 0 1 2-2h10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <path d="M42 30v10a2 2 0 0 1-2 2H30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <circle cx="24" cy="26" r="11" fill="#FFC600" />
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
  { code: "A", field: "Kasvatusala ja psykologia", sisalto: "Soveltuvuuskoe ja aineistokoe.", alat: "Luokanopettaja, varhaiskasvatus, erityisopettaja, opinto-ohjaaja sekä psykologia ja logopedia." },
  { code: "B", field: "Lääketieteelliset alat", sisalto: "Biologian, fysiikan ja kemian lukion oppimääriin perustuva koe.", alat: "Lääketiede, hammaslääketiede ja eläinlääketiede." },
  { code: "C", field: "Tekniikka ja luonnontieteet", sisalto: "Matematiikan, fysiikan ja kemian ongelmanratkaisutaidot. Kokeessa on yhteinen osio ja eriytyviä osioita.", alat: "Insinööritieteet, tietojenkäsittely, fysiikka, kemia." },
  { code: "D", field: "Kauppatieteet", sisalto: "Taloustiedon, matematiikan ja historian soveltaminen. Perustuu lukion oppimäärään ja ennakkomateriaaliin.", alat: "Kauppatieteet ja taloustiede." },
  { code: "E", field: "Oikeustiede", sisalto: "Juridisen tiedon omaksuminen ja soveltaminen. Perustuu ennakkoon julkaistavaan aineistoon.", alat: "Oikeustiede (Helsinki, Turku, Joensuu, Rovaniemi)." },
  { code: "F", field: "Yhteiskuntatieteet", sisalto: "Yhteiskuntaopin ja historian oppimääriin sekä aineistoon perustuva koe.", alat: "Valtio-oppi, sosiologia, viestintä." },
  { code: "G", field: "Kielet ja viestintä", sisalto: "Kielellinen päättely ja aineiston ymmärtäminen.", alat: "Vieraat kielet, käännöstiede." },
  { code: "H", field: "Humanistiset tieteet", sisalto: "Aineistokoe, joka mittaa kulttuurista ja historiallista ymmärrystä.", alat: "Historia, kulttuurintutkimus, taiteiden tutkimus." },
  { code: "I", field: "Liikunta- ja terveystieteet", sisalto: "Terveystiedon oppimäärä ja fyysiset soveltuvuuskokeet (alakohtainen).", alat: "Liikuntapedagogiikka, fysioterapia." },
];

// ⇩⇩⇩ VAIHDA NÄMÄ OMIIN KURSSILINKKEIHISI ⇩⇩⇩
// Korvaa "#" omilla URL-osoitteillasi (esim. https://kurssisi.fi/laaketiede).
const COURSES = [
  {
    code: "B",
    field: "Lääketiede & hammaslääketiede",
    title: "Lääkiksen valmennuskurssi 2026",
    href: "#", // TODO: oma linkki
    rating: 4.9,
    reviews: 1284,
    students: "6 200+",
    success: "Sisäänpäässeistä 8/10 valmistautui kurssillamme",
    price: "490 €",
    oldPrice: "790 €",
    seatsLeft: 7,
    closing: "Ilmoittautuminen sulkeutuu 31.1.",
    popular: true,
    perks: [
      "Yli 1 200 koetehtävää ja 12 simuloitua koetta",
      "Henkilökohtainen palaute alan opettajilta",
      "Sisäänpääsytakuu — tai seuraava kurssi veloituksetta",
    ],
  },
  {
    code: "E",
    field: "Oikeustiede",
    title: "Oikiksen valmennuskurssi 2026",
    href: "#", // TODO: oma linkki
    rating: 4.8,
    reviews: 742,
    students: "3 400+",
    success: "94 % suosittelee kurssia ystävälleen",
    price: "390 €",
    oldPrice: "590 €",
    seatsLeft: 12,
    closing: "Vain kevään ryhmä jäljellä",
    popular: false,
    perks: [
      "Aineiston soveltaminen ja vastaustekniikka haltuun",
      "Viikoittaiset live-klinikat ja tallenteet",
      "Aiempien vuosien mallivastaukset analysoituna",
    ],
  },
  {
    code: "D",
    field: "Kauppatieteet",
    title: "Kauppiksen valmennuskurssi 2026",
    href: "#", // TODO: oma linkki
    rating: 4.9,
    reviews: 968,
    students: "5 100+",
    success: "Korkein keskimääräinen pistemäärä alalla",
    price: "350 €",
    oldPrice: "520 €",
    seatsLeft: 9,
    closing: "Early bird -hinta päättyy pian",
    popular: false,
    perks: [
      "Matematiikka, taloustieto ja historia yhdessä paketissa",
      "Ennakkomateriaalin tiivistykset ja muistilistat",
      "Sisäänpääsytakuu kirjallisella ehdolla",
    ],
  },
  {
    code: "A",
    field: "Psykologia & kasvatusala",
    title: "Psykologian valmennuskurssi 2026",
    href: "#", // TODO: oma linkki
    rating: 4.8,
    reviews: 531,
    students: "2 800+",
    success: "Soveltuvuus- ja aineistokoe rinnakkain harjoiteltuna",
    price: "350 €",
    oldPrice: "490 €",
    seatsLeft: 15,
    closing: "Ryhmäkoko rajattu henkilökohtaisen ohjauksen vuoksi",
    popular: false,
    perks: [
      "Aineistokokeen lukutekniikka ja aikataulutus",
      "Harjoituskokeet aidoissa koeolosuhteissa",
      "Mentorina alalle päässyt opiskelija",
    ],
  },
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
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -left-40 top-0 -z-0 h-[560px] w-[560px] -translate-y-1/3 rounded-full bg-gold" />
      <div className="relative z-10 mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <h1 className="max-w-4xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-navy md:text-6xl">
          Yliopistojen kansalliset valintakokeet 2026–2027
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-navy/85 md:text-xl">
          Yliopistot järjestävät yhdeksän kansallista valintakoetta (eli pääsykoetta). Kansalliset
          valintakokeet ovat digitaalisia ja ne suoritetaan omalla kannettavalla tietokoneella yliopiston
          tiloissa. Tälle sivulle on koottu riippumaton ja ajantasainen tietopankki uudistuneista
          valintakokeista, koesisällöistä ja niihin valmistautumisesta. Valintakokeilla valitaan noin puolet
          uusista opiskelijoista kanditason opintoihin.
        </p>
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
                  Valintakoe {e.code}
                  <span className="block text-sm font-semibold text-navy/60">{e.field}</span>
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-navy/80">
                <strong className="font-semibold text-navy">Sisältö:</strong> {e.sisalto}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-navy/80">
                <strong className="font-semibold text-navy">Koulutusalat:</strong> {e.alat}
              </p>
            </article>
          ))}
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
          soveltaminen on edelleen keskiössä. Riippumattomien tilastojen mukaan järjestelmällinen
          valmistautuminen, vanhojen kokeiden simulointi ja oikeanlaisen vastaustekniikan harjoittelu ovat
          ratkaisevassa asemassa sisäänpääsyssä.
        </p>

        <Courses />
      </div>
    </section>
  );
}

/* ---------------- tähtiarvostelu ---------------- */
function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" aria-label={`Arvosana ${rating} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < Math.round(rating) ? "fill-gold" : "fill-line"}`} aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

/* ---------------- valmennuskurssit (Cialdini-vaikuttaminen) ---------------- */
// Vaikuttamisen periaatteet kohdennettuna (Cialdini):
//  • Auktoriteetti  – alan opettajat, asiantuntijasisältö
//  • Sosiaalinen todiste – opiskelijamäärät, arvostelut, suositteluprosentti
//  • Niukkuus – rajatut paikat ja sulkeutuva ilmoittautuminen
//  • Sitoutuminen – ilmainen tasotesti madaltaa kynnystä ensiaskeleeseen
//  • Vastavuoroisuus – ilmainen materiaali lahjana
//  • Riskinpoisto – sisäänpääsytakuu
function Courses() {
  return (
    <div id="valmennusmateriaalit" data-slot="valmennusmateriaalit" className="mt-14">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-pill bg-navy px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-gold">
          Asiantuntijoiden suosittelemat
        </span>
        <h3 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-navy md:text-3xl">
          Valmennuskurssit, joilla pääset sisään — etkä jää varasijalle
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-navy/85">
          Joka vuosi tuhannet hakijat kilpailevat samoista paikoista. Ratkaiseva ero ei ole lahjakkuus vaan
          oikea valmistautuminen. Alla olevat kurssit ovat alalle päässeiden opiskelijoiden ja opettajien
          rakentamia — juuri sen kokeen voittamiseen, jota sinä tavoittelet.
        </p>
      </div>

      {/* Luottamuspalkki: auktoriteetti + sosiaalinen todiste */}
      <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-3">
        {[
          ["17 500+", "valmentautunutta hakijaa"],
          ["94 %", "suosittelisi kurssia ystävälleen"],
          ["Alan opettajat", "ja sisään päässeet mentorit"],
        ].map(([big, small]) => (
          <div key={small} className="text-center">
            <dt className="font-heading text-2xl font-extrabold text-navy">{big}</dt>
            <dd className="mt-1 text-sm text-navy/70">{small}</dd>
          </div>
        ))}
      </dl>

      {/* Kurssikortit */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {COURSES.map((c) => (
          <article
            key={c.code}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(10,37,64,0.28)] ${
              c.popular ? "border-gold ring-2 ring-gold/40" : "border-line"
            }`}
          >
            {c.popular && (
              <span className="absolute -top-3 left-6 rounded-pill bg-gold px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-wider text-navy">
                Suosituin valinta
              </span>
            )}

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{c.code}</span>
              <div>
                <h4 className="font-heading text-lg font-bold leading-tight text-navy">{c.title}</h4>
                <span className="text-sm font-semibold text-navy/60">{c.field}</span>
              </div>
            </div>

            {/* Sosiaalinen todiste */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/70">
              <Stars rating={c.rating} />
              <span className="font-semibold text-navy">{c.rating}/5</span>
              <span>({c.reviews} arvostelua)</span>
              <span aria-hidden>·</span>
              <span>{c.students} opiskelijaa</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-navy/80">{c.success}</p>

            {/* Hyödyt: auktoriteetti + riskinpoisto */}
            <ul className="mt-4 space-y-2 text-[15px] text-navy/80">
              {c.perks.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 fill-gold" aria-hidden><path d="M8 13.2l-3.1-3.1-1.4 1.4L8 16 17 7l-1.4-1.4z" /></svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            {/* Niukkuus */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold/15 px-3 py-1 text-xs font-bold text-navy ring-1 ring-gold/40">
                <span className="h-2 w-2 rounded-full bg-gold" /> Vain {c.seatsLeft} paikkaa jäljellä
              </span>
              <span className="text-xs font-semibold text-navy/60">{c.closing}</span>
            </div>

            {/* Hinta + ankkuri (vertailuhinta) */}
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5">
              <div>
                <span className="font-heading text-2xl font-extrabold text-navy">{c.price}</span>
                <span className="ml-2 text-sm font-semibold text-navy/40 line-through">{c.oldPrice}</span>
              </div>
              <a
                href={c.href}
                className="inline-flex items-center gap-2 rounded-pill bg-navy px-5 py-3 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
              >
                Varaa paikkasi
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Vastavuoroisuus + sitoutuminen: ilmainen ensiaskel */}
      <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-navy px-6 py-7 text-white md:flex-row md:items-center">
        <div>
          <h4 className="font-heading text-lg font-bold text-gold">Et ole vielä varma alasta?</h4>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/80">
            Lataa veloituksetta tasotesti ja katso jo tänään, kuinka lähellä sisäänpääsyä olet. Ilman
            sitoutumista — mutta useimmat aloittavat juuri tästä.
          </p>
        </div>
        <a
          href="#"
          className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-gold px-5 py-3 font-heading text-sm font-bold text-navy transition-colors hover:bg-gold-dark"
        >
          Lataa ilmainen tasotesti
        </a>
      </div>
    </div>
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
            Riippumaton tietopankki yliopistojen kansallisista valintakokeista 2026–2027.
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
        <div className="mx-auto max-w-site px-6 py-5 text-xs text-white/50 md:px-8">© 2026 Pääsykoe.fi — riippumaton tietopankki.</div>
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
        <Preparation />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
