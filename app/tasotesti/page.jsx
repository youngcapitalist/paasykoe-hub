// Maksuton tasotesti — kysyy kiinnostuksista ja kipupisteistä ja suosittelee
// käyttäjälle parhaiten sopivan alan, koulutuksen ja valmennuskurssin.
import Quiz from "./Quiz";

export const metadata = {
  title: "Ilmainen tasotesti — löydä sinulle sopiva ala ja valmennuskurssi | Pääsykoe.fi",
  description:
    "Vastaa muutamaan kysymykseen kiinnostuksistasi ja saat henkilökohtaisen suosituksen sinulle parhaiten sopivasta koulutusalasta, koulutuksesta ja valmennuskurssista.",
};

function Logo({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M6 18V8a2 2 0 0 1 2-2h10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <path d="M42 30v10a2 2 0 0 1-2 2H30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <circle cx="24" cy="26" r="11" fill="#FFC600" />
    </svg>
  );
}

export default function TasotestiPage() {
  return (
    <main>
      <header className="bg-navy text-white">
        <div className="mx-auto flex h-[88px] max-w-site items-center gap-4 px-6 md:px-8">
          <a href="/" className="flex shrink-0 items-center gap-3" aria-label="Pääsykoe.fi etusivulle">
            <Logo />
            <span className="font-heading text-sm font-semibold text-white/80 hover:text-gold">← Takaisin etusivulle</span>
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-40 top-0 -z-0 h-[480px] w-[480px] -translate-y-1/3 rounded-full bg-gold/90" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 md:px-8 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-pill bg-navy px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-gold">
            Maksuton · 2 minuuttia
          </span>
          <h1 className="mt-5 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-navy md:text-5xl">
            Mikä ala on juuri sinua varten?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-navy/85">
            Suurin virhe pääsykokeissa on valmistautua väärään kokeeseen. Vastaa muutamaan kysymykseen, niin
            kerromme sinulle parhaiten sopivan alan, koulutuksen ja valmennuskurssin — ilmaiseksi ja ilman
            sitoutumista.
          </p>

          <div className="mt-10">
            <Quiz />
          </div>

          <p className="mt-6 text-center text-xs text-navy/40">
            Tasotesti on suuntaa antava ja perustuu antamiisi vastauksiin.
          </p>
        </div>
      </section>
    </main>
  );
}
