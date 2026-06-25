"use client";

import { useMemo, useState } from "react";
import { COURSES, getCourse, EXAM_TARGETS } from "../courses";
import {
  WTP_QUESTIONS,
  computeWtpScore,
  wtpScoreToPriceEur,
  wtpScoreToVipPriceEur,
  formatPriceEur,
  resolvePrimaryCode,
  recommendationsIncludeF,
  WTP_OFFER_EXAM,
} from "../../lib/wtp";
import { persistHubOffer } from "../../lib/wtp-persist";

const COURSE_CODES = ["A", "B", "C", "E", "F"];
const targetField = (code) =>
  code === "unknown" ? "En tiedä vielä" : EXAM_TARGETS.find((t) => t.code === code)?.field || null;

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

const QUIZ_LENGTH = QUESTIONS.length;

function algorithmCodeFromScores(scores) {
  let best = null;
  for (const c of COURSES) {
    const s = scores[c.code] || 0;
    if (best === null || s > best.s) best = c.code;
  }
  return best;
}

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

function CoursePricing({ course, wtpOffer, wtpForThisCourse }) {
  if (wtpForThisCourse && wtpOffer?.priceEur) {
    return (
      <div className="mt-5 border-t border-line pt-5 space-y-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-gold/20 px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider text-navy ring-1 ring-gold/50">
            Kurssitarjous
          </span>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-heading text-2xl font-extrabold text-navy">PRO {formatPriceEur(wtpOffer.priceEur)}</span>
            <span className="font-heading text-lg font-bold text-navy/70">VIP {formatPriceEur(wtpOffer.vipPriceEur ?? wtpScoreToVipPriceEur(wtpOffer.priceEur))}</span>
          </div>
        </div>
        <a
          href={wtpOffer.checkoutUrl}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
        >
          Siirry kurssisivulle
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-5">
        <span className="font-heading text-2xl font-extrabold text-navy">{course.price}</span>
        <span className="text-sm font-semibold text-navy/40 line-through">{course.oldPrice}</span>
        <span className="ml-auto text-sm font-semibold text-navy/60">VIP {course.vipPrice}</span>
      </div>
      <a
        href={course.href}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
      >
        Varaa paikkasi kurssille
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </a>
    </>
  );
}

export default function Quiz() {
  const [phase, setPhase] = useState("quiz"); // quiz | email | wtp | result
  const [step, setStep] = useState(0);
  const [wtpStep, setWtpStep] = useState(0);
  const [scores, setScores] = useState({});
  const [pain, setPain] = useState(null);
  const [futureTarget, setFutureTarget] = useState(null);
  const [wtpAnswers, setWtpAnswers] = useState({});

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [wtpOffer, setWtpOffer] = useState(null);

  const algoCode = useMemo(() => algorithmCodeFromScores(scores), [scores]);
  const algorithmCourse = useMemo(() => (algoCode ? getCourse(algoCode) : null), [algoCode]);
  const primaryCode = useMemo(
    () => (futureTarget !== null ? resolvePrimaryCode(futureTarget, algoCode) : null),
    [futureTarget, algoCode]
  );
  const primaryCourse = primaryCode ? getCourse(primaryCode) : null;
  const fInRecommendations = recommendationsIncludeF(primaryCode, algoCode);
  const showAltSuggestion =
    algorithmCourse && primaryCourse && algorithmCourse.code !== primaryCourse.code;
  const fCourse = getCourse(WTP_OFFER_EXAM);

  const question = phase === "wtp" ? WTP_QUESTIONS[wtpStep] : QUESTIONS[step];

  function answerQuiz(opt) {
    const q = QUESTIONS[step];
    if (q.type === "pain") {
      setPain(opt);
    } else if (q.type === "target") {
      setFutureTarget(opt.code);
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
    if (step + 1 >= QUIZ_LENGTH) {
      setPhase("email");
    } else {
      setStep((s) => s + 1);
    }
  }

  function answerWtp(opt) {
    setWtpAnswers((prev) => ({ ...prev, [question.id]: opt.points }));
    if (wtpStep + 1 >= WTP_QUESTIONS.length) {
      finalizeAndShowResult();
    } else {
      setWtpStep((s) => s + 1);
    }
  }

  function restart() {
    setPhase("quiz");
    setStep(0);
    setWtpStep(0);
    setScores({});
    setPain(null);
    setFutureTarget(null);
    setWtpAnswers({});
    setEmail("");
    setError(null);
    setWtpOffer(null);
    setSubmitting(false);
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function finalizeAndShowResult() {
    if (!emailValid || submitting) return;
    setSubmitting(true);
    setError(null);
    const chosen = futureTarget && futureTarget !== "unknown" ? futureTarget : primaryCode || algoCode;
    const wtpScore = computeWtpScore(wtpAnswers, pain?.key);
    const offeredPriceEur = wtpScoreToPriceEur(wtpScore);
    const hasOffer = fInRecommendations;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: null,
          preferredCode: chosen,
          preferredField: targetField(chosen),
          recommendedCode: algoCode || primaryCode,
          recommendedField: algorithmCourse?.field || primaryCourse?.field,
          painKey: pain?.key || null,
          scores,
          wtpScore: hasOffer ? wtpScore : null,
          offeredPriceEur: hasOffer ? offeredPriceEur : null,
          offerExam: hasOffer ? WTP_OFFER_EXAM : null,
        }),
      });
      if (!res.ok) throw new Error("request_failed");

      if (hasOffer) {
        const offerRes = await fetch("/api/offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            wtpScore,
            examCode: WTP_OFFER_EXAM,
          }),
        });
        if (offerRes.ok) {
          const offerData = await offerRes.json();
          const vipPriceEur = offerData.vipPriceEur ?? wtpScoreToVipPriceEur(offerData.priceEur);
          persistHubOffer({
            token: offerData.token,
            priceEur: offerData.priceEur,
            vipPriceEur,
            examCode: offerData.examCode,
          });
          setWtpOffer({ ...offerData, vipPriceEur });
        }
      }

      setPhase("result");
    } catch {
      setError("Lähetys ei onnistunut. Tarkista yhteys ja yritä uudelleen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEmail(e) {
    e.preventDefault();
    if (!emailValid || submitting) return;
    if (fInRecommendations) {
      setPhase("wtp");
      return;
    }
    await finalizeAndShowResult();
  }

  /* ---------------- sähköposti (quizin jälkeen) ---------------- */
  if (phase === "email" && primaryCourse) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-pill bg-gold/15 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy ring-1 ring-gold/40">
          Tuloksesi on valmis
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-navy md:text-3xl">
          Löysimme sinulle sopivimman alan 🎯
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-navy/80">
          Kirjoita sähköpostisi, niin näet tuloksesi heti
          {fInRecommendations ? " — ja saat henkilökohtaisen kurssitarjouksen" : ""}
          {" "}myös sähköpostiisi.
        </p>

        <form onSubmit={submitEmail} className="mt-6 space-y-4">
          <div>
            <label htmlFor="lead-email" className="sr-only">Sähköposti</label>
            <input
              id="lead-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] text-navy outline-none transition-colors focus:border-navy"
              placeholder="Sähköpostisi"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!emailValid || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Lähetetään…" : fInRecommendations ? "Jatka" : "Näytä tulokseni"}
            {!submitting && (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </button>
          <p className="text-center text-xs text-navy/40">
            Lähettämällä saat tuloksesi ja kurssivinkit sähköpostiisi. Emme jaa tietojasi kolmansille — voit perua viestit milloin tahansa.
          </p>
        </form>
      </div>
    );
  }

  /* ---------------- WTP (vain jos F suosituksissa, quizin lopussa) ---------------- */
  if (phase === "wtp") {
    const wtpProgress = ((wtpStep + 1) / WTP_QUESTIONS.length) * 100;
    return (
      <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-pill bg-gold/15 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy ring-1 ring-gold/40">
          Viimeiset kysymykset
        </span>
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-navy/50">
          <span>Kysymys {wtpStep + 1} / {WTP_QUESTIONS.length}</span>
          <span>{Math.round(wtpProgress)} %</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-mist">
          <div className="h-full rounded-pill bg-gold transition-all" style={{ width: `${wtpProgress}%` }} />
        </div>

        <h2 className="mt-7 font-heading text-xl font-extrabold leading-snug text-navy md:text-2xl">
          {question.q}
        </h2>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6 space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => answerWtp(opt)}
              disabled={submitting}
              className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4 text-left text-[15px] font-medium text-navy transition-colors hover:border-navy hover:bg-mist disabled:opacity-50"
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

  /* ---------------- tulos ---------------- */
  if (phase === "result" && primaryCourse) {
    const primaryIsF = primaryCode === WTP_OFFER_EXAM;
    const altIsF = showAltSuggestion && algorithmCourse?.code === WTP_OFFER_EXAM;
    const showAltCard =
      altIsF || (primaryIsF && showAltSuggestion && algorithmCourse?.code !== WTP_OFFER_EXAM);

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
          Ensisijainen hakukohteesi: <span className="text-navy">Valintakoe {primaryCourse.code} — {primaryCourse.field}</span>
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-navy/80">{primaryCourse.recommend}</p>

        {showAltSuggestion && !showAltCard && (
          <div className="mt-5 rounded-xl border border-dashed border-line bg-white px-5 py-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/50">Testin perusteella myös sopisi</h3>
            <p className="mt-1.5 text-[15px] text-navy/75">
              Valintakoe {algorithmCourse.code} — {algorithmCourse.field}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-line bg-mist/60 p-5">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/60">Soveltuvat koulutukset</h3>
          <p className="mt-1.5 text-[15px] text-navy/80">{primaryCourse.koulutus}</p>
        </div>

        {/* Ensisijainen kurssi */}
        <div className="mt-8 rounded-2xl border-2 border-gold bg-white p-6 ring-2 ring-gold/30">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{primaryCourse.code}</span>
            <div>
              <h3 className="font-heading text-lg font-bold leading-tight text-navy">{primaryCourse.title}</h3>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-navy/70">
                <Stars rating={primaryCourse.rating} />
                <span className="font-semibold text-navy">{primaryCourse.rating}/5</span>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-[15px] text-navy/80">
            {primaryCourse.perks.map((p) => (
              <li key={p} className="flex gap-2.5">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 fill-gold" aria-hidden><path d="M8 13.2l-3.1-3.1-1.4 1.4L8 16 17 7l-1.4-1.4z" /></svg>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-navy/60">{primaryCourse.closing}</span>
          </div>

          <CoursePricing course={primaryCourse} wtpOffer={wtpOffer} wtpForThisCourse={primaryIsF} />
        </div>

        {/* F vaihtoehtona kun ensisijainen on jokin muu */}
        {altIsF && fCourse && (
          <div className="mt-6 rounded-2xl border-2 border-gold/60 bg-white p-6 ring-1 ring-gold/20">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/50">Myös sinulle sopiva vaihtoehto</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{fCourse.code}</span>
              <div>
                <h4 className="font-heading text-lg font-bold leading-tight text-navy">{fCourse.title}</h4>
                <p className="mt-0.5 text-sm text-navy/70">{fCourse.field}</p>
              </div>
            </div>
            <CoursePricing course={fCourse} wtpOffer={wtpOffer} wtpForThisCourse />
          </div>
        )}

        {/* Muu kurssi vaihtoehtona kun ensisijainen on F */}
        {primaryIsF && showAltSuggestion && algorithmCourse && algorithmCourse.code !== WTP_OFFER_EXAM && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/50">Myös sinulle sopiva vaihtoehto</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{algorithmCourse.code}</span>
              <div>
                <h4 className="font-heading text-lg font-bold leading-tight text-navy">{algorithmCourse.title}</h4>
                <p className="mt-0.5 text-sm text-navy/70">{algorithmCourse.field}</p>
              </div>
            </div>
            <CoursePricing course={algorithmCourse} wtpOffer={null} wtpForThisCourse={false} />
          </div>
        )}

        <button onClick={restart} className="mt-6 text-sm font-semibold text-navy/60 underline underline-offset-4 hover:text-navy">
          Tee testi uudelleen
        </button>
      </div>
    );
  }

  /* ---------------- varsinaiset quiz-kysymykset ---------------- */
  if (phase !== "quiz") return null;

  const quizProgress = ((step + 1) / QUIZ_LENGTH) * 100;

  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
      <div className="flex items-center justify-between text-xs font-semibold text-navy/50">
        <span>Kysymys {step + 1} / {QUIZ_LENGTH}</span>
        <span>{Math.round(quizProgress)} %</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-mist">
        <div className="h-full rounded-pill bg-gold transition-all" style={{ width: `${quizProgress}%` }} />
      </div>

      <h2 className="mt-7 font-heading text-xl font-extrabold leading-snug text-navy md:text-2xl">
        {question.q}
      </h2>

      <div className="mt-6 space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => answerQuiz(opt)}
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
