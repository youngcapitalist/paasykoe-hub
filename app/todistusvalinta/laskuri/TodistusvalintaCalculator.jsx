"use client";

import { useMemo, useState } from "react";
import { CERTIFICATE_FIELDS, courseForField } from "../../../lib/todistusvalinta/fields";
import { calculateCertificateScore, checkThresholds, assessResult, GRADES } from "../../../lib/todistusvalinta/scoring";
import { YO_SUBJECTS, entriesToGrades, hasAidinkieli } from "../../../lib/todistusvalinta/subjects";

let rowId = 0;
function newRow(subjectId = "", grade = "") {
  rowId += 1;
  return { id: String(rowId), subjectId, grade };
}

const START_ROWS = [
  newRow("aidinkieli", ""),
  newRow("matematiikka_pitka", ""),
  newRow("", ""),
  newRow("", ""),
  newRow("", ""),
];

function SubjectRow({ row, usedSubjects, onChange, onRemove, canRemove }) {
  const available = YO_SUBJECTS.filter(
    (s) => s.id === row.subjectId || !usedSubjects.has(s.id),
  );

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-line/60 pb-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <select
        value={row.subjectId}
        onChange={(e) => onChange({ ...row, subjectId: e.target.value, grade: row.subjectId !== e.target.value ? "" : row.grade })}
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
        aria-label="Valitse aine"
      >
        <option value="">Valitse aine</option>
        {available.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Arvosana">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            disabled={!row.subjectId}
            onClick={() => onChange({ ...row, grade: g })}
            className={`min-w-[2.5rem] rounded-lg border px-2.5 py-2 font-heading text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              row.grade === g
                ? "border-navy bg-navy text-gold"
                : "border-line bg-white text-navy hover:border-navy/40 hover:bg-mist/60"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="justify-self-start text-sm font-semibold text-navy/50 hover:text-navy sm:justify-self-end"
        >
          Poista
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}

export default function TodistusvalintaCalculator() {
  const [fieldId, setFieldId] = useState("F");
  const [rows, setRows] = useState(START_ROWS);
  const [showResult, setShowResult] = useState(false);

  const field = useMemo(() => CERTIFICATE_FIELDS.find((f) => f.id === fieldId), [fieldId]);
  const course = useMemo(() => courseForField(field), [field]);
  const usedSubjects = useMemo(() => new Set(rows.map((r) => r.subjectId).filter(Boolean)), [rows]);

  const grades = useMemo(() => entriesToGrades(rows), [rows]);

  const result = useMemo(() => {
    if (!showResult || !field) return null;
    const score = calculateCertificateScore(field.tableId, grades);
    const thresholdIssues = checkThresholds(field.id, grades);
    const assessment = assessResult(field, score);
    return { score, thresholdIssues, assessment };
  }, [showResult, field, grades]);

  function updateRow(id, next) {
    setRows((prev) => prev.map((r) => (r.id === id ? next : r)));
    setShowResult(false);
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
    setShowResult(false);
  }

  function removeRow(id) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
    setShowResult(false);
  }

  function calculate() {
    if (!hasAidinkieli(rows)) return;
    setShowResult(true);
  }

  const needsCourseCta =
    result &&
    course &&
    (result.assessment.level === "below_minimum" || result.assessment.level === "needs_exam");

  return (
    <div className="space-y-8">
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

      <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <h2 className="font-heading text-lg font-bold text-navy">2. Syötä ylioppilaskokeiden arvosanat</h2>
        <p className="mt-2 text-sm text-navy/70">
          Valitse aine ja arvosana (L–A). Lisää kaikki kirjoittamasi aineet — laskuri poimii parhaan yhdistelmän
          automaattisesti.
        </p>

        <div className="mt-6 space-y-1">
          {rows.map((row) => (
            <SubjectRow
              key={row.id}
              row={row}
              usedSubjects={usedSubjects}
              onChange={(next) => updateRow(row.id, next)}
              onRemove={() => removeRow(row.id)}
              canRemove={rows.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 text-sm font-bold text-navy underline underline-offset-4 hover:text-navy-light"
        >
          + Lisää aine
        </button>

        <button
          type="button"
          onClick={calculate}
          disabled={!hasAidinkieli(rows)}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-6 py-3.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Laske todistuspisteet
        </button>
        {!hasAidinkieli(rows) && (
          <p className="mt-2 text-xs text-navy/50">Lisää vähintään äidinkieli arvosanoineen.</p>
        )}
      </div>

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
                  <li key={`${row.slot}-${row.key}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className="text-navy/80">
                      {row.label || row.slot}
                      <span className="ml-2 font-semibold text-navy">{row.grade}</span>
                    </span>
                    <span className="shrink-0 font-heading font-bold text-navy">{row.points.toFixed(1)} p</span>
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
                Noin puolet yliopisto-opiskelijoista tulee valituksi valintakokeen kautta. {course.title} auttaa sinua
                erottumaan hakijajoukosta kevään 2027 kokeessa.
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
              <a
                href={course.href}
                className="mt-4 inline-block font-heading text-sm font-bold text-navy underline underline-offset-4 hover:text-navy-light"
              >
                Kurssi valintakokeeseen {course.code} →
              </a>
            </div>
          )}

          <p className="text-xs leading-relaxed text-navy/50">
            Laskuri on suuntaa-antava eikä korvaa virallista Opintopolun pistelaskentaa. Tarkat hakukohtekohtaiset
            vähimmäispisteet:{" "}
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
