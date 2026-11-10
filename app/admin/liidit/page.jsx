import { assertDashboardToken, fetchLiiditDashboard } from "../../../lib/admin-liidit.js";
import { whenFi } from "../../../lib/lead-labels.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Lataukset & liidit",
  robots: { index: false, follow: false },
};

export default async function AdminLiiditPage({ searchParams }) {
  const token = searchParams?.token || "";
  const auth = await assertDashboardToken(token);

  if (!auth.ok) {
    return (
      <main className="min-h-screen bg-[#f4f7f5] text-[#064e3b] px-4 py-16">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Lataukset &amp; liidit</h1>
          <p className="text-slate-600 text-sm mb-4">
            Avaa sivulle tokenilla: <code className="bg-white px-1 rounded">/admin/liidit?token=…</code>
          </p>
          <p className="text-slate-500 text-xs">
            Token on <code>founder_dashboard_tokens</code>-taulussa tai envissä{" "}
            <code>ADMIN_DASHBOARD_SECRET</code>.
          </p>
        </div>
      </main>
    );
  }

  const data = await fetchLiiditDashboard();
  if (data.error) {
    return (
      <main className="min-h-screen bg-[#f4f7f5] text-[#064e3b] px-4 py-16">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Virhe</h1>
          <p className="text-sm text-red-700">
            Liidien haku epäonnistui ({data.status}). Tarkista SUPABASE_URL +
            SUPABASE_SERVICE_ROLE_KEY.
          </p>
        </div>
      </main>
    );
  }

  const lataukset = data.lataukset || [];
  const kaikki = data.kaikki || [];
  const weekStart = Date.now() - 7 * 86400000;
  const today = lataukset.filter((r) => r.tanaan === true);
  const week = lataukset.filter((r) => new Date(r.created_at).getTime() >= weekStart);
  const todayByExam = today.reduce((acc, r) => {
    const k = r.koe || "?";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-[#064e3b]">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
        <h1 className="text-3xl font-extrabold mb-1">Lataukset</h1>
        <p className="text-slate-500 text-sm mb-6">
          Kun joku lataa PDF:n / SEO-magnetin — näkyy heti mikä koe, mistä ja miten tuli.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Stat label="Tänään" value={`+${today.length}`} gold />
          <Stat label="7 päivää" value={week.length} />
          <Stat label="Latauksia yht." value={lataukset.length} />
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Tänään · kokeittain
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(todayByExam).length === 0 && (
            <span className="text-sm text-slate-500">Ei vielä tänään</span>
          )}
          {Object.entries(todayByExam).map(([exam, n]) => (
            <span
              key={exam}
              className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              Koe {exam} · {n}
            </span>
          ))}
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Uudet lataukset tänään
        </h2>
        <div className="space-y-2 mb-8">
          {today.length === 0 && (
            <p className="text-sm text-slate-500">Ei latauksia tänään vielä.</p>
          )}
          {today.map((r) => (
            <article
              key={`${r.sahkoposti}-${r.created_at}`}
              className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4"
            >
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
                Koe {r.koe}
              </div>
              <div className="font-bold text-base mt-1">{r.magnet}</div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-800">
                  {r.liikenne}
                </span>
                <span>{r.sahkoposti}</span>
                <span>{whenFi(r.created_at)}</span>
              </div>
            </article>
          ))}
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Kaikki lataukset
        </h2>
        <LeadTable rows={lataukset} />

        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-8">
          Kaikki liidit (viim. 40)
        </h2>
        <LeadTable rows={kaikki.slice(0, 40)} />
      </div>
    </main>
  );
}

function Stat({ label, value, gold }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-3xl font-extrabold mt-1 ${gold ? "text-emerald-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function LeadTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">Koe</th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">
              Mitä latasi
            </th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">
              Liikenne
            </th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">
              Email
            </th>
            <th className="text-left p-3 text-[11px] uppercase tracking-wide text-slate-500">
              Milloin
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-500">
                Ei rivejä
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const isToday = r.tanaan === true;
            return (
              <tr
                key={`${r.sahkoposti}-${r.created_at}-${r.magnet_koodi || r.magnet || ""}`}
                className={`border-b border-slate-100 ${isToday ? "bg-emerald-50/80" : ""}`}
              >
                <td className="p-3 font-bold whitespace-nowrap">Koe {r.koe}</td>
                <td className="p-3">{r.magnet}</td>
                <td className="p-3 text-slate-600">{r.liikenne}</td>
                <td className="p-3">{r.sahkoposti}</td>
                <td className="p-3 text-slate-600 whitespace-nowrap">{whenFi(r.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
