"use client";

import { useMemo, useState } from "react";
import { COURSES, getCourse, EXAM_TARGETS } from "../courses";

const COURSE_CODES = ["A", "B", "C", "E", "F"]; // alat, joille on kurssi
const targetField = (code) =>
  code === "unknown" ? "En tiedä vielä" : EXAM_TARGETS.find((t) => t.code === code)?.field || null;

/* ---------------- kysymykset ---------------- */
// type "pain"     -> kipupiste, ei pisteytä alaa vaan personoi tuloksen
// type "interest" -> kiinnostus/vahvuus, pisteyttää alat (koodi -> pisteet)
const QUESTIONS = [
  {
    type: "pain",
    q: "Mikä painaa mieltäsi juuri nyt eniten?",
    options: [
      { label: "Pelkään, etten pääse sisään ollenkaan", key: "fear", reassure: "Pelko on aiheellinen — paikoista kilpaillaan kovasti. Hyvä uutinen: sisäänpääsy ei ole sattumaa vaan valmistautumisen tulosta." },
      { label: "En tiedä, mille alalle minun pitäisi hakea", key: "unsure", reassure: "Et ole yksin — moni epäröi. Tämä testi antaa sinulle selkeän suunnan jo tänään." },
      { label: "Aika tuntuu loppuvan kesken ennen koetta", key: "time", reassure: "Aikaa on juuri sen verran kuin sen käyttää oikein. Strukturoitu valmennus säästää kuukausien hapuilun." },
      { label: "Pärjäänkö muita hakijoita paremmin?", key: "compete", reassure: "Erottuminen ratkaisee. Ne, jotka harjoittelevat oikeaa vastaustekniikkaa, ovat etulyöntiasemassa." },
    ],
  },
  {
    type: "interest",
    q: "Mikä kouluaineissa sytytti sinut eniten?",
    options: [
      { label: "Matematiikka, fysiikka ja logiikka", scores: { A: 2 } },
      { label: "Kemia, biologia ja ihmiskeho", scores: { B: 2 } },
      { label: "Luonto, eläimet ja ympäristö", scores: { C: 2 } },
      { label: "Ihmiset, psykologia ja opettaminen", scores: { E: 2 } },
      { label: "Talous, yhteiskunta ja yrittäjyys", scores: { F: 2 } },
    ],
  },
  {
    type: "interest",
    q: "Millaisessa työssä näet itsesi 10 vuoden päästä?",
    options: [
      { label: "Kehittämässä teknologiaa tai ohjelmistoja", scores: { A: 2 } },
      { label: "Hoitamassa potilaita tai tutkimassa lääkkeitä", scores: { B: 2 } },
      { label: "Tutkimassa luontoa ja ratkomassa ympäristöongelmia", scores: { C: 2 } },
      { label: "Opettamassa ja tukemassa ihmisten kasvua", scores: { E: 2 } },
      { label: "Johtamassa yritystä tai tekemässä kauppaa", scores: { F: 2 } },
    ],
  },
  {
    type: "interest",
    q: "Mikä tuntuu sinusta palkitsevimmalta?",
    options: [
      { label: "Vaikean ongelman ratkaiseminen", scores: { A: 2 } },
      { label: "Konkreettinen ihmisten auttaminen", scores: { B: 2, E: 1 } },
      { label: "Oivallus siitä, miten elämä ja luonto toimivat", scores: { C: 2 } },
      { label: "Toisen ihmisen onnistumisen näkeminen", scores: { E: 2 } },
      { label: "Tavoitteen saavuttaminen ja menestyminen", scores: { F: 2 } },
    ],
  },
  {
    type: "interest",
    q: "Mikä kuvaa sinua parhaiten?",
    options: [
      { label: "Analyyttinen ja looginen", scores: { A: 2, F: 1 } },
      { label: "Sinnikäs ja tarkka", scores: { B: 2 } },
      { label: "Utelias ja tutkiva", scores: { C: 2 } },
      { label: "Empaattinen ja kannustava", scores: { E: 2 } },
      { label: "Tavoitteellinen ja ulospäinsuuntautunut", scores: { F: 2 } },
    ],
  },
  {
    type: "target",
    q: "Missä hakukohteessa näkisit itsesi tulevaisuudessa?",
    options: [
      ...EXAM_TARGETS.map((t) => ({ label: `Valintakoe ${t.code} — ${t.field}`, code: t.code })),
      { label: "En tiedä vielä", code: "unknown" },
    ],
  },
];

const TOTAL = QUESTIONS.length;

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

export default function Quiz() {
  const [step, setStep] = useState(0); // 0..TOTAL-1, sitten TOTAL = tulos
  const [scores, setScores] = useState({});
  const [pain, setPain] = useState(null);
  const [futureTarget, setFutureTarget] = useState(null); // valittu hakukohde (A–I tai "unknown")

  // liidigate
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferredCode, setPreferredCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isResult = step >= TOTAL;
  const question = QUESTIONS[step];

  const result = useMemo(() => {
    if (!isResult) return null;
    // korkein pistemäärä; tasapeli ratkeaa COURSES-järjestyksen mukaan
    let best = null;
    for (const c of COURSES) {
      const s = scores[c.code] || 0;
      if (best === null || s > best.s) best = { code: c.code, s };
    }
    return getCourse(best.code);
  }, [isResult, scores]);

  function answer(opt) {
    if (question.type === "pain") {
      setPain(opt);
    } else if (question.type === "target") {
      setFutureTarget(opt.code);
      // jos valittu hakukohde vastaa kurssia, painota suositusta sen mukaan
      if (COURSE_CODES.includes(opt.code)) {
        setScores((prev) => ({ ...prev, [opt.code]: (prev[opt.code] || 0) + 2 }));
      }
    } else if (opt.scores) {
      setScores((prev) => {
        const next = { ...prev };
        for (const [code, pts] of Object.entries(opt.scores)) next[code] = (next[code] || 0) + pts;
        return next;
      });
    }
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setScores({});
    setPain(null);
    setFutureTarget(null);
    setSubmitted(false);
    setEmail("");
    setName("");
    setPreferredCode("");
    setConsent(false);
    setError(null);
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submitLead(e) {
    e.preventDefault();
    if (!emailValid || !consent || submitting) return;
    setSubmitting(true);
    setError(null);
    const chosen = preferredCode || futureTarget || result.code;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          preferredCode: chosen,
          preferredField: targetField(chosen),
          recommendedCode: result.code,
          recommendedField: result.field,
          painKey: pain?.key || null,
          scores,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setSubmitted(true);
    } catch (err) {
      setError("Lähetys ei onnistunut. Tarkista yhteys ja yritä uudelleen.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- liidigate (sähköposti ennen tulosta) ---------------- */
  if (isResult && result && !submitted) {
    const chosen = preferredCode || futureTarget || result.code;
    return (
      <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-pill bg-gold/15 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy ring-1 ring-gold/40">
          Tuloksesi on valmis
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-navy md:text-3xl">
          Löysimme sinulle sopivimman alan 🎯
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-navy/80">
          Kerro mihin lähetämme henkilökohtaisen suosituksesi ja kurssitarjouksesi. Saat tuloksen heti
          ruudulle ja vahvistuksen sähköpostiisi.
        </p>

        <form onSubmit={submitLead} className="mt-6 space-y-4">
          <div>
            <label htmlFor="lead-name" className="text-sm font-semibold text-navy">Etunimi <span className="font-normal text-navy/40">(valinnainen)</span></label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-navy"
              placeholder="Etunimi"
            />
          </div>

          <div>
            <label htmlFor="lead-email" className="text-sm font-semibold text-navy">Sähköposti</label>
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-navy"
              placeholder="nimi@esimerkki.fi"
            />
          </div>

          <div>
            <label htmlFor="lead-target" className="text-sm font-semibold text-navy">Ensisijainen hakukohteesi</label>
            <select
              id="lead-target"
              value={chosen}
              onChange={(e) => setPreferredCode(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-navy"
            >
              {EXAM_TARGETS.map((t) => (
                <option key={t.code} value={t.code}>
                  Valintakoe {t.code} — {t.field}
                </option>
              ))}
              <option value="unknown">En tiedä vielä</option>
            </select>
            <p className="mt-1.5 text-xs text-navy/50">Esitäytetty valintasi / testituloksen perusteella — voit vaihtaa.</p>
          </div>

          <label className="flex items-start gap-3 text-sm text-navy/75">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-navy"
            />
            <span>Haluan suosituksen ja kurssiviestit sähköpostiini ja hyväksyn tietojeni käsittelyn tätä tarkoitusta varten.</span>
          </label>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!emailValid || !consent || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Lähetetään…" : "Näytä tulokseni"}
            {!submitting && (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </button>
          <p className="text-center text-xs text-navy/40">Emme jaa tietojasi kolmansille osapuolille. Voit perua viestit milloin tahansa.</p>
        </form>
      </div>
    );
  }

  /* ---------------- tulos ---------------- */
  if (isResult && result) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-pill bg-gold/15 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy ring-1 ring-gold/40">
          Henkilökohtainen suosituksesi
        </span>

        {pain?.reassure && (
          <p className="mt-5 rounded-xl bg-mist px-5 py-4 text-[15px] leading-relaxed text-navy/80">
            {pain.reassure}
          </p>
        )}

        <h2 className="mt-6 font-heading text-2xl font-extrabold leading-tight text-navy md:text-3xl">
          Sinulle parhaiten sopiva ala: <span className="text-navy">{result.field}</span>
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-navy/80">{result.recommend}</p>

        <div className="mt-6 rounded-xl border border-line bg-mist/60 p-5">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/60">Soveltuvat koulutukset</h3>
          <p className="mt-1.5 text-[15px] text-navy/80">{result.koulutus}</p>
        </div>

        {/* Suositeltu kurssi */}
        <div className="mt-8 rounded-2xl border-2 border-gold bg-white p-6 ring-2 ring-gold/30">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{result.code}</span>
            <div>
              <h3 className="font-heading text-lg font-bold leading-tight text-navy">{result.title}</h3>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-navy/70">
                <Stars rating={result.rating} />
                <span className="font-semibold text-navy">{result.rating}/5</span>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-[15px] text-navy/80">
            {result.perks.map((p) => (
              <li key={p} className="flex gap-2.5">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 fill-gold" aria-hidden><path d="M8 13.2l-3.1-3.1-1.4 1.4L8 16 17 7l-1.4-1.4z" /></svg>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-navy/60">{result.closing}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-5">
            <span className="font-heading text-2xl font-extrabold text-navy">{result.price}</span>
            <span className="text-sm font-semibold text-navy/40 line-through">{result.oldPrice}</span>
            <span className="ml-auto text-sm font-semibold text-navy/60">VIP {result.vipPrice} · vain {result.seatsLeft} paikkaa</span>
          </div>

          <a
            href={result.href}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
          >
            Varaa paikkasi {result.title.split(" ")[0].toLowerCase()}-kurssille
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>

        <button onClick={restart} className="mt-6 text-sm font-semibold text-navy/60 underline underline-offset-4 hover:text-navy">
          Tee testi uudelleen
        </button>
      </div>
    );
  }

  /* ---------------- kysymysnäkymä ---------------- */
  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
      {/* edistymispalkki */}
      <div className="flex items-center justify-between text-xs font-semibold text-navy/50">
        <span>Kysymys {step + 1} / {TOTAL}</span>
        <span>{Math.round((step / TOTAL) * 100)} %</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-mist">
        <div className="h-full rounded-pill bg-gold transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
      </div>

      <h2 className="mt-7 font-heading text-xl font-extrabold leading-snug text-navy md:text-2xl">
        {question.q}
      </h2>

      <div className="mt-6 space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => answer(opt)}
            className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4 text-left text-[15px] font-medium text-navy transition-colors hover:border-navy hover:bg-mist"
          >
            <span>{opt.label}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-navy/40 transition-colors group-hover:bg-navy group-hover:text-gold">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
