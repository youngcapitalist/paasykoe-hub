"use client";

import { useMemo, useState } from "react";
import { CERTIFICATE_FIELDS, SUBJECT_ROWS, courseForField } from "../../../lib/todistusvalinta/fields";
import { calculateCertificateScore, checkThresholds, assessResult, GRADES } from "../../../lib/todistusvalinta/scoring";

const EMPTY = Object.fromEntries(SUBJECT_ROWS.map((r) => [r.key, ""]));

export default function TodistusvalintaCalculator() {
  const [fieldId, setFieldId] = useState("F");
  const [grades, setGrades] = useState(EMPTY);
  const [showResult, setShowResult] = useState(false);

  const field = useMemo(() => CERTIFICATE_FIELDS.find((f) => f.id === fieldId), [fieldId]);
  const course = useMemo(() => courseForField(field), [field]);

  const result = useMemo(() => {
    if (!showResult || !field) return null;
    const score = calculateCertificateScore(field.tableId, grades);
    const thresholdIssues = checkThresholds(field.id, grades);
    const assessment = assessResult(field, score);
    return { score, thresholdIssues, assessment };
  }, [showResult, field, grades]);

  function setGrade(key, value) {
    setGrades((prev) => ({ ...prev, [key]: value }));
    setShowResult(false);
  }

  function calculate() {
    if (!grades.aidinkieli) return;
    setShowResult(true);
  }

  const needsCourseCta =
    result &&
    course &&
    (result.assessment.level === "below_minimum" || result.assessment.level === "needs_exam");

  return (
    <div className="space-y-8">
      {/* Step 1: field */}
      <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <h2 className="font-heading text-lg font-bold text-navy">1. Valitse hakuala</h2>
        <p className="mt-2 text-sm text-navy/70">
          Laskuri käyttää vuoden 2026 yliopistojen todistusvalinnan pisteytystaulukoita (yliopistovalinnat.fi).
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CERTIFICATE_FIELDS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFieldId(f.id);
                setShowResult(false);
              }}
              className={`rounded-xl border p-4 text-left transition-colors ${
                fieldId === f.id
                  ? "border-navy bg-navy/5 ring-2 ring-navy/20"
                  : "border-line hover:border-navy/30 hover:bg-mist/50"
              }`}
            >
              <div className="font-heading text-sm font-bold text-navy">{f.label}</div>
              <div className="mt-1 text-xs text-navy/60">{f.hint}</div>
              {f.examCode && (
                <span className="mt-2 inline-block rounded-pill bg-navy px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-gold">
                  Valintakoe {f.examCode}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: grades */}
      <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <h2 className="font-heading text-lg font-bold text-navy">2. Syötä ylioppilaskokeiden arvosanat</h2>
        <p className="mt-2 text-sm text-navy/70">
          Kirjoita vain suorittamasi aineet. Laskuri valitsee automaattisesti sinulle parhaan aineyhdistelmän.
        </p>
        <div className="mt-6 space-y-3">
          {SUBJECT_ROWS.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-1 items-center gap-2 border-b border-line/60 pb-3 sm:grid-cols-[1fr_auto]"
            >
              <label htmlFor={row.key} className="text-sm font-semibold text-navy">
                {row.label}
                {row.required && <span className="ml-1 text-gold">*</span>}
              </label>
              <select
                id={row.key}
                value={grades[row.key]}
                onChange={(e) => setGrade(row.key, e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="">—</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={calculate}
          disabled={!grades.aidinkieli}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-6 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Laske todistuspisteet
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-navy/50">Todistuspisteet</p>
                <p className="mt-1 font-heading text-4xl font-extrabold text-navy">
                  {result.score.total}
                  <span className="text-lg font-semibold text-navy/40"> / {result.score.maxPoints}</span>
                </p>
              </div>
              <div className="text-right text-sm text-navy/60">
                <div>{field.label}</div>
                <div className="mt-0.5">Taulukko {field.tableId} · 2026</div>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-navy transition-all"
                style={{ width: `${Math.min(100, (result.score.total / result.score.maxPoints) * 100)}%` }}
              />
            </div>

            <h3 className="mt-8 font-heading text-xl font-bold text-navy">{result.assessment.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-navy/80">{result.assessment.summary}</p>

            {result.thresholdIssues.length > 0 && (
              <ul className="mt-4 space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                {result.thresholdIssues.map((msg) => (
                  <li key={msg}>• {msg}</li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-navy/50">Pisteytyksen erittely</h4>
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                {result.score.breakdown.map((row) => (
                  <li key={`${row.slot}-${row.key}`} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-navy/80">
                      {row.slot}
                      <span className="ml-2 font-semibold text-navy">{row.grade}</span>
                    </span>
                    <span className="font-heading font-bold text-navy">{row.points.toFixed(1)} p</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {needsCourseCta && course && (
            <div className="rounded-2xl border-2 border-gold bg-navy p-6 text-white md:p-8">
              <span className="inline-flex rounded-pill bg-gold/20 px-3 py-1 font-heading text-xs font-bold uppercase text-gold">
                Valintakoe {course.code}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-extrabold">Todistus ei riitä — valmistaudu valintakokeeseen</h3>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">
                Noin puolet yliopisto-opiskelijoista tulee valituksi valintakokeen kautta.{" "}
                {course.title} auttaa sinua erottumaan hakijajoukosta kevään 2027 kokeessa.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={course.href}
                  className="inline-flex items-center gap-2 rounded-pill bg-gold px-6 py-3 font-heading text-sm font-bold text-navy transition-opacity hover:opacity-90"
                >
                  Tutustu {course.code}-kurssiin
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
                <a
                  href="/tasotesti"
                  className="inline-flex items-center gap-2 rounded-pill border border-white/30 px-6 py-3 font-heading text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Tee ilmainen tasotesti
                </a>
              </div>
            </div>
          )}

          {result.assessment.level === "strong_certificate" && course && (
            <div className="rounded-2xl border border-line bg-mist/40 p-6 md:p-8">
              <h3 className="font-heading text-lg font-bold text-navy">Vahvistus varmuuden vuoksi</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/75">
                Vaikka todistuspisteesi näyttävät hyviltä, hakukohtekohtaiset rajat vaihtelevat. Jos haluat varmistaa
                pääsyn tai tavoittelet kilpailtuja ohjelmia, valintakokeeseen valmistautuminen on silti hyödyllistä.
              </p>
              <a href={course.href} className="mt-4 inline-block font-heading text-sm font-bold text-navy underline underline-offset-4 hover:text-navy-light">
                Kurssi valintakokeeseen {course.code} →
              </a>
            </div>
          )}

          <p className="text-xs leading-relaxed text-navy/50">
            Laskuri on suuntaa-antava eikä korvaa virallista Opintopolun pistelaskentaa. Tarkat hakukohtekohtaiset
            vähimmäispisteet ja valintaperusteet:{" "}
            <a href="https://yliopistovalinnat.fi/todistusvalinnan-pisteytykset-vuodesta-2026" className="underline">
              yliopistovalinnat.fi
            </a>
            . Vertailudata:{" "}
            <a href="https://vipunen.fi" className="underline">
              Vipunen.fi
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
