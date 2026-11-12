import { assertDashboardToken, fetchLiiditDashboard } from "../../../lib/admin-liidit.js";
import { whenFi } from "../../../lib/lead-labels.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Liidit · kokeittain",
  robots: { index: false, follow: false },
};

const EXAMS = ["A", "B", "C", "E", "F", "L"];
const TYPES = [
  "PDF-lataus",
  "Tasotesti",
  "Taitotesti",
  "SEO / artikkeli",
  "Laudatur-kysely",
  "Muu liidi",
  "Hub",
];

function examLabel(koe) {
  if (koe === "L") return "Laudatur";
  if (!koe || koe === "?") return "Tuntematon";
  return `Koe ${koe}`;
}

function countBy(rows, key) {
  const out = {};
  for (const r of rows) {
    const k = String(r[key] || "?");
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

export default async function AdminLiiditPage({ searchParams }) {
  const token = searchParams?.token || "";
  const examFilter = String(searchParams?.koe || "kaikki").toUpperCase();
  const typeFilter = String(searchParams?.tyyppi || "kaikki");
  const auth = await assertDashboardToken(token);

  if (!auth.ok) {
    return (
      <main className="min-h-screen bg-[#070a12] text-[#eef2fb] px-4 py-16">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Liidit · kokeittain</h1>
          <p className="text-slate-400 text-sm mb-4">
            Avaa sivulle tokenilla: <code className="bg-[#121828] px-1 rounded">/admin/liidit?token=…</code>
          </p>
        </div>
      </main>
    );
  }

  const data = await fetchLiiditDashboard();
  if (data.error) {
    return (
      <main className="min-h-screen bg-[#070a12] text-[#eef2fb] px-4 py-16">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Virhe</h1>
          <p className="text-sm text-red-300">
            Liidien haku epäonnistui ({data.status}). Tarkista SUPABASE_URL +
            SUPABASE_SERVICE_ROLE_KEY.
          </p>
        </div>
      </main>
    );
  }

  const kaikki = data.kaikki || [];
  const weekStart = Date.now() - 7 * 86400000;
  const todayAll = kaikki.filter((r) => r.tanaan === true);
  const weekAll = kaikki.filter((r) => new Date(r.created_at).getTime() >= weekStart);

  const filtered = kaikki.filter((r) => {
    if (examFilter !== "KAIKKI" && String(r.koe).toUpperCase() !== examFilter) return false;
    if (typeFilter !== "kaikki" && String(r.lahde_tyyppi) !== typeFilter) return false;
    return true;
  });
  const today = filtered.filter((r) => r.tanaan === true);

  const byExamToday = countBy(todayAll, "koe");
  const byTypeToday = countBy(todayAll, "lahde_tyyppi");
  const byExamWeek = countBy(weekAll, "koe");

  const qs = (extra = {}) => {
    const u = new URLSearchParams({
      token,
      koe: examFilter === "KAIKKI" ? "kaikki" : examFilter,
      tyyppi: typeFilter,
      ...extra,
    });
    return `?${u.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#070a12] text-[#eef2fb]">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6d7cff] to-[#8b97ff] grid place-items-center font-black">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Liidit · kokeittain</h1>
            <p className="text-slate-400 text-sm">
              PDF-lataus, tasotesti, SEO — mistä kukin liidi tuli
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Stat label="Tänään" value={`+${todayAll.length}`} />
          <Stat label="7 päivää" value={weekAll.length} />
          <Stat label="Suodatettu" value={filtered.length} />
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Koe
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <Tab href={qs({ koe: "kaikki" })} active={examFilter === "KAIKKI"} label="Kaikki" n={todayAll.length} />
          {EXAMS.map((e) => (
            <Tab
              key={e}
              href={qs({ koe: e })}
              active={examFilter === e}
              label={examLabel(e)}
              n={byExamToday[e] || 0}
            />
          ))}
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Lähde
        </h2>
        <div className="flex flex-wrap gap-2 mb-5">
          <Tab href={qs({ tyyppi: "kaikki" })} active={typeFilter === "kaikki"} label="Kaikki lähteet" n={todayAll.length} />
          {TYPES.map((t) => {
            const n = byTypeToday[t] || 0;
            if (!n && !weekAll.some((r) => r.lahde_tyyppi === t)) return null;
            return (
              <Tab key={t} href={qs({ tyyppi: t })} active={typeFilter === t} label={t} n={n} />
            );
          })}
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Tänään · lähteittäin
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(byTypeToday).length === 0 && (
            <span className="text-sm text-slate-500">Ei vielä tänään</span>
          )}
          {Object.entries(byTypeToday)
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => (
              <span
                key={k}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[#6d7cff1a] text-[#8b97ff] border border-[#6d7cff40]"
              >
                {k} · {n}
              </span>
            ))}
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          7 pv · jaoteltuna kokeisiin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {EXAMS.map((exam) => {
            const total = byExamWeek[exam] || 0;
            if (!total) return null;
            return (
              <section
                key={exam}
                className="rounded-2xl border border-[#1e2740] bg-[#121828] p-3.5"
              >
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-sm">{examLabel(exam)}</h3>
                  <span className="text-xs text-slate-500">{total} / 7 pv</span>
                </div>
                <div className="space-y-1.5">
                  {TYPES.map((ty) => {
                    const n = weekAll.filter(
                      (r) => r.koe === exam && r.lahde_tyyppi === ty
                    ).length;
                    if (!n) return null;
                    return (
                      <div
                        key={ty}
                        className="flex justify-between gap-2 text-sm px-2 py-1.5 rounded-lg bg-[#0b0f1a66]"
                      >
                        <span className="text-slate-400">{ty}</span>
                        <strong>{n}</strong>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Uudet tänään
        </h2>
        <div className="space-y-2 mb-8">
          {today.length === 0 && (
            <p className="text-sm text-slate-500">Ei osumia tällä suodattimella tänään.</p>
          )}
          {today.slice(0, 40).map((r) => (
            <article
              key={`${r.sahkoposti}-${r.created_at}-${r.magnet || ""}`}
              className="rounded-2xl border border-[#1e2740] bg-[#121828] p-4"
            >
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#8b97ff]">
                  {examLabel(r.koe)}
                </span>
                <span className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-[#34d3991a] text-[#34d399] border border-[#34d39933]">
                  {r.lahde_tyyppi || "?"}
                </span>
              </div>
              <div className="font-bold text-base">{r.magnet}</div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
                <span className="rounded-full bg-[#1c2740] px-2.5 py-0.5 font-semibold text-[#eef2fb]">
                  {r.liikenne}
                </span>
                <span>{r.sahkoposti}</span>
                <span>{whenFi(r.created_at)}</span>
              </div>
            </article>
          ))}
        </div>

        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Lista
        </h2>
        <LeadTable rows={filtered.slice(0, 80)} />
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#1e2740] bg-[#121828] p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-3xl font-extrabold mt-1 text-white">{value}</div>
    </div>
  );
}

function Tab({ href, active, label, n }) {
  return (
    <a
      href={href}
      className={`flex-none rounded-full border px-3 py-1.5 text-sm font-semibold no-underline ${
        active
          ? "border-[#6d7cff66] bg-[#6d7cff26] text-white"
          : "border-[#1e2740] bg-[#0e1320] text-slate-400"
      }`}
    >
      {label} <em className="not-italic opacity-70 ml-1">{n}</em>
    </a>
  );
}

function LeadTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1e2740] bg-[#121828]">
      <table className="w-full text-sm">
        <thead className="bg-[#0b0f1a99] border-b border-[#1e2740]">
          <tr>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Koe</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Lähde</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Mitä</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Liikenne</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Email</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Milloin</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-slate-500">
                Ei rivejä
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const isToday = r.tanaan === true;
            return (
              <tr
                key={`${r.sahkoposti}-${r.created_at}-${r.magnet_koodi || r.magnet || ""}`}
                className={`border-b border-[#1e2740] ${isToday ? "bg-[#6d7cff14]" : ""}`}
              >
                <td className="p-3 font-bold whitespace-nowrap">{examLabel(r.koe)}</td>
                <td className="p-3">
                  <span className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-[#34d3991a] text-[#34d399] border border-[#34d39933]">
                    {r.lahde_tyyppi || "?"}
                  </span>
                </td>
                <td className="p-3">{r.magnet}</td>
                <td className="p-3 text-slate-400">{r.liikenne}</td>
                <td className="p-3">{r.sahkoposti}</td>
                <td className="p-3 text-slate-400 whitespace-nowrap">{whenFi(r.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
