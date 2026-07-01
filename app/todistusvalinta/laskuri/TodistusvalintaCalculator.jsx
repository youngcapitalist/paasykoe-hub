"use client";

import { useEffect, useMemo, useState } from "react";
import { getCourse } from "../../../app/courses";
import { laudaturOrderUrl, laudaturQuizUrl } from "../../../app/config/laudatur";
import { computeAllTableScores, GRADES } from "../../../lib/todistusvalinta/scoring";
import { YO_SUBJECTS, entriesToGrades, hasAidinkieli } from "../../../lib/todistusvalinta/subjects";
import { FIELD_GROUPS, matchPrograms, THRESHOLDS_META } from "../../../lib/todistusvalinta/programs";

const FAV_KEY = "todistusvalinta_favs";

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
];

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-navy/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function highlightText(text, query) {
  if (!query.trim()) return text;
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-gold/40 px-0.5 text-navy">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function SubjectRow({ row, usedSubjects, onChange, onRemove, canRemove }) {
  const available = YO_SUBJECTS.filter((s) => s.id === row.subjectId || !usedSubjects.has(s.id));

  return (
    <div className="flex flex-col gap-3 border-b border-line/60 py-4 sm:flex-row sm:items-center">
      <select
        value={row.subjectId}
        onChange={(e) =>
          onChange({ ...row, subjectId: e.target.value, grade: row.subjectId !== e.target.value ? "" : row.grade })
        }
        className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
        aria-label="Valitse aine"
      >
        <option value="">Valitse aine</option>
        {available.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Arvosana">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            disabled={!row.subjectId}
            onClick={() => onChange({ ...row, grade: g })}
            className={`min-w-[2.35rem] rounded-md border px-2 py-2 font-heading text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              row.grade === g
                ? "border-navy bg-navy text-gold"
                : "border-line bg-white text-navy hover:border-navy/40"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="self-start rounded-lg p-2 text-navy/40 hover:bg-red-50 hover:text-red-600 sm:self-center"
          aria-label="Poista aine"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function YearCell({ userScore, bar, ok }) {
  return (
    <span className={`tabular-nums text-sm font-semibold ${ok ? "text-navy" : "text-navy/45"}`}>
      {userScore > 0 ? userScore.toFixed(1) : "—"} / {bar.toFixed(1)}
      {ok && userScore > 0 && <span className="ml-1 text-gold-dark">✓</span>}
    </span>
  );
}

export default function TodistusvalintaCalculator() {
  const [rows, setRows] = useState(START_ROWS);
  const [firstTimer, setFirstTimer] = useState(true);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [tab, setTab] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const [bannerOpen, setBannerOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  const grades = useMemo(() => entriesToGrades(rows), [rows]);
  const ready = hasAidinkieli(rows) && rows.some((r) => r.subjectId && r.grade);
  const allScores = useMemo(() => (ready ? computeAllTableScores(grades) : null), [ready, grades]);
  const usedSubjects = useMemo(() => new Set(rows.map((r) => r.subjectId).filter(Boolean)), [rows]);

  const programs = useMemo(() => {
    if (!allScores) return [];
    let list = matchPrograms({
      query: search,
      fieldFilter,
      favorites,
      scores: allScores,
      firstTimer,
    });
    if (tab === "favorites") list = list.filter((p) => favorites.has(p.id));
    return list;
  }, [allScores, search, fieldFilter, firstTimer, tab, favorites]);

  const belowCount = programs.filter((p) => !p.likely2026 && p.userScore > 0).length;
  const examUpsell = useMemo(() => {
    if (!ready || belowCount === 0) return null;
    const codes = new Set(programs.filter((p) => !p.likely2026 && p.examCode).map((p) => p.examCode));
    return [...codes].map((c) => getCourse(c)).filter(Boolean)[0] ?? null;
  }, [ready, belowCount, programs]);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function updateRow(id, next) {
    setRows((prev) => prev.map((r) => (r.id === id ? next : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(id) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  return (
    <div className="space-y-10">
      {/* Arvosanat */}
      <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <p className="text-[15px] leading-relaxed text-navy/80">
          Kerro yo-arvosanasi. Laskuri näyttää heti, mihin hakukohteisiin todistuspisteesi riittäisivät vuoden 2026
          pisteytyksellä.
        </p>

        <div className="mt-6 divide-y divide-line/60">
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
          className="mt-4 inline-flex items-center gap-2 rounded-pill bg-navy px-5 py-2.5 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
        >
          + Lisää oppiaine
        </button>

        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={firstTimer}
            onClick={() => setFirstTimer((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${firstTimer ? "bg-navy" : "bg-line"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                firstTimer ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-navy">
            Olen ensikertalainen
            <span
              className="ml-1 font-normal text-navy/50"
              title="Monissa hakukohteissa todistusvalinta on vain ensikertalaisille. Muissa vertaillaan ensikertalais- ja kaikkien hakijoiden jonoja erikseen."
            >
              (?)
            </span>
          </span>
        </label>
      </div>

      {/* Hakukohteet */}
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-navy">Hakukohteet</h2>

        {!ready ? (
          <p className="mt-4 text-sm text-navy/60">Syötä vähintään äidinkieli ja yksi arvosana nähdäksesi tulokset.</p>
        ) : (
          <>
            {bannerOpen && (
              <div className="relative mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 pr-10 text-sm text-amber-950">
                <button
                  type="button"
                  onClick={() => setBannerOpen(false)}
                  className="absolute right-3 top-3 text-amber-700/60 hover:text-amber-900"
                  aria-label="Sulje"
                >
                  ×
                </button>
                <p className="font-semibold">Vuoden 2026 todistusvalinnan rajapisteet</p>
                <p className="mt-1 text-amber-900/80">
                  {THRESHOLDS_META.note} Lähde:{" "}
                  <a
                    href="https://vipunen.fi/fi-fi/kkyhteiset/Sivut/Haku-ja-valinta.aspx"
                    className="underline"
                  >
                    Vipunen.fi
                  </a>
                  {" "}(päivitetty {THRESHOLDS_META.updated}).
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex flex-1 items-center">
                <span className="pointer-events-none absolute left-3">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Etsi hakukohteita, esim. kauppatieteet"
                  className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-10 text-sm font-medium text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 text-navy/40 hover:text-navy"
                    aria-label="Tyhjennä haku"
                  >
                    ×
                  </button>
                )}
              </div>
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy focus:border-navy focus:outline-none"
                aria-label="Koulutusala"
              >
                {FIELD_GROUPS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-6 border-b border-line">
              {[
                { id: "all", label: "Kaikki" },
                { id: "favorites", label: "Suosikit" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`border-b-2 pb-2 font-heading text-sm font-bold transition-colors ${
                    tab === t.id ? "border-navy text-navy" : "border-transparent text-navy/45 hover:text-navy"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
              {programs.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-navy/50">Ei hakukohteita valituilla suodattimilla.</li>
              )}
              {programs.map((p) => (
                <li key={p.id} className="group px-5 py-4 transition-colors hover:bg-mist/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(p.id)}
                          className={`mt-0.5 shrink-0 text-lg leading-none ${favorites.has(p.id) ? "text-gold-dark" : "text-navy/20 hover:text-gold-dark"}`}
                          aria-label={favorites.has(p.id) ? "Poista suosikeista" : "Lisää suosikkeihin"}
                        >
                          ★
                        </button>
                        <div>
                          <p className="font-heading text-base font-bold leading-snug text-navy">
                            {highlightText(p.title, search)}
                          </p>
                          <p className="mt-0.5 text-sm text-navy/55">{p.university}</p>
                          <p className="mt-1 text-xs text-navy/45">{highlightText(p.subtitle, search)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 pl-7">
                        {p.years.map((y) => (
                          <span key={y.year} className="text-xs text-navy/50">
                            <span className="font-semibold text-navy/70">{y.year}</span>{" "}
                            <YearCell userScore={y.userScore} bar={y.bar} ok={y.ok} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="mt-1 shrink-0 text-navy/25 group-hover:text-navy/50" aria-hidden>
                      ›
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {ready && belowCount > 0 && (
              <div className="mt-8 rounded-2xl border-2 border-gold bg-navy p-6 text-white md:p-8">
                <span className="inline-flex rounded-pill bg-gold/20 px-3 py-1 font-heading text-xs font-bold uppercase text-gold">
                  Yo-valmennus
                </span>
                <h3 className="mt-4 font-heading text-xl font-extrabold md:text-2xl">
                  Paranna yo-arvosanoja — nosta todistuspisteitä ennen seuraavaa hakua
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  {belowCount} hakukohdetta listalla on alle todennäköisyysrajauksen vuonna 2026. Korkeammat
                  yo-arvosanat nostavat todistuspisteitä suoraan. LaudaturPro: kaikki aineet samassa paikassa.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={laudaturOrderUrl("laudatur-pro", {
                      utm_source: "paasykoe",
                      utm_medium: "todistusvalinta",
                    })}
                    className="inline-flex items-center gap-2 rounded-pill bg-gold px-6 py-3 font-heading text-sm font-bold text-navy hover:opacity-90"
                  >
                    Laudatur Pro — kaikki yo-aineet
                  </a>
                  <a
                    href={laudaturQuizUrl({ utm_medium: "todistusvalinta" })}
                    className="inline-flex items-center gap-2 rounded-pill border border-white/30 px-6 py-3 font-heading text-sm font-bold text-white hover:bg-white/10"
                  >
                    Aloita ilmainen yo-tarkastus
                  </a>
                </div>
              </div>
            )}

            {examUpsell && (
              <div className="mt-6 rounded-2xl border border-line bg-white p-6 md:p-8">
                <span className="inline-flex rounded-pill bg-mist px-3 py-1 font-heading text-xs font-bold uppercase text-navy">
                  Valintakoe {examUpsell.code}
                </span>
                <h3 className="mt-4 font-heading text-lg font-extrabold text-navy md:text-xl">
                  Vaihtoehto: valintakoe on reitti sisään ilman korkeampia yo-arvosanoja
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy/75">
                  Noin puolet opiskelijoista tulee valituksi valintakokeen kautta — myös ilman laudaturia.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={examUpsell.href}
                    className="inline-flex items-center gap-2 rounded-pill bg-navy px-6 py-3 font-heading text-sm font-bold text-gold hover:bg-navy-light"
                  >
                    {examUpsell.title}
                  </a>
                  <a
                    href="/tasotesti"
                    className="inline-flex items-center gap-2 rounded-pill border border-line px-6 py-3 font-heading text-sm font-bold text-navy hover:bg-mist"
                  >
                    Ilmainen tasotesti
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
