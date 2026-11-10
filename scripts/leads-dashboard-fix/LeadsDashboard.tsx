/**
 * Drop-in patch for course-site /admin/leads (LeadsDashboard).
 * Adds a dedicated "Lataukset" section: which exam + what was downloaded + traffic.
 *
 * Why this lives in paasykoe-hub: course-site GitHub repos are private to this
 * environment; same pattern as scripts/*-paywall-fix.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, Users } from "lucide-react";

type Lead = {
  id: string;
  email: string;
  source: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const SOURCE_EXAM: Record<string, string> = {
  valintakoea: "A",
  valintakoeb: "B",
  valintakoec: "C",
  valintakoee: "E",
  exam_2026_answers_pdf: "F",
  exam_2027_prep: "F",
  f_2026_lead: "F",
  f_2026_customer: "F",
  official_2026_skill_test: "B",
};

const MAGNET_LABEL: Record<string, string> = {
  "2026_seo_valmistautuminen": "Edellisen vuoden koe PDF (valmistautumisopas)",
  "2026_exam_pdf": "Edellisen vuoden koe PDF (etusivu)",
  "2026_seo_vastaukset": "2026 vastaukset / tulokset (SEO-sivu)",
  official_2026_skill_test: "Virallinen 2026-taitotesti",
  artikkeli_pdf: "Artikkelin PDF-lataus",
  "article_koe-c-2027-pisterajat-rakenne-ja-paasyvaatimukset": "Artikkeli: Koe C 2027 pisterajat",
  "article_koe-c-oikeat-vastaukset-ja-mallivastaukset": "Artikkeli: Koe C oikeat vastaukset",
  "article_laaketieteen-valintakoe-2027-pisterajat-ja-paasyvaatimukset": "Artikkeli: lääkis 2027 pisterajat",
  "article_laaketieteen-valintakoe-oikeat-vastaukset-ja-mallivastaukset": "Artikkeli: lääkis oikeat vastaukset",
};

function examOf(lead: Lead): string {
  const fromMeta = lead.metadata?.exam;
  if (typeof fromMeta === "string") {
    const m = fromMeta.match(/koe\s*([A-I])/i);
    if (m) return m[1].toUpperCase();
  }
  return SOURCE_EXAM[lead.source] || "?";
}

function magnetOf(lead: Lead): string {
  const code = typeof lead.metadata?.lead_magnet === "string" ? lead.metadata.lead_magnet : "";
  if (code && MAGNET_LABEL[code]) return MAGNET_LABEL[code];
  if (code) return code;
  if (lead.source === "exam_2026_answers_pdf") return "Edellisen vuoden koe / vastaukset PDF";
  if (lead.source === "official_2026_skill_test") return "Virallinen 2026-taitotesti";
  return "Liidi (ei magnet-koodia)";
}

function trafficOf(lead: Lead): string {
  const ref = typeof lead.metadata?.referrer === "string" ? lead.metadata.referrer : "";
  if (!ref) return "Suora / tuntematon";
  if (/google\./i.test(ref)) return "Google";
  if (/bing\./i.test(ref)) return "Bing";
  if (/duckduckgo/i.test(ref)) return "DuckDuckGo";
  if (/yahoo\./i.test(ref)) return "Yahoo";
  if (/paasykoe|xn--psykoe/i.test(ref)) return "Pääsykoe.fi hub";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

function isDownload(lead: Lead): boolean {
  const code = typeof lead.metadata?.lead_magnet === "string" ? lead.metadata.lead_magnet : "";
  if (code) return true;
  return ["exam_2026_answers_pdf", "official_2026_skill_test"].includes(lead.source);
}

function startOfToday() {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  return a.getTime();
}

function whenFi(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (d.getTime() >= startOfToday()) {
    return `tänään ${d.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const days = Math.floor(diff / day);
  if (days === 1) return "eilen";
  if (days < 7) return `${days} pv sitten`;
  return d.toLocaleDateString("fi-FI");
}

export default function LeadsDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busy, setBusy] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth?redirect=/admin/leads");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (!roles || roles.length === 0) {
        toast.error("Ei käyttöoikeuksia");
        navigate("/");
        return;
      }
      setOk(true);
      const { data, error } = await supabase
        .from("marketing_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error("Liidien lataus epäonnistui");
      else setLeads((data as Lead[]) || []);
      setBusy(false);
    })();
  }, [user, loading, navigate]);

  const todayTs = startOfToday();
  const weekTs = Date.now() - 7 * 86400000;
  const downloads = useMemo(() => leads.filter(isDownload), [leads]);
  const downloadsToday = downloads.filter((l) => new Date(l.created_at).getTime() >= todayTs);
  const downloadsWeek = downloads.filter((l) => new Date(l.created_at).getTime() >= weekTs);
  const todayByExam = downloadsToday.reduce<Record<string, number>>((acc, l) => {
    const e = examOf(l);
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  if (loading || busy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (!ok) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Takaisin
        </Button>

        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
          <Users className="w-7 h-7" /> Liidit
        </h1>

        {/* —— Lataukset (PDF / SEO magnet) —— */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Download className="w-4 h-4" /> Lataukset · näkyy mikä koe
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Tänään</div>
              <div className="text-3xl font-bold text-gold">+{downloadsToday.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">7 päivää</div>
              <div className="text-3xl font-bold">{downloadsWeek.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Latauksia yht.</div>
              <div className="text-3xl font-bold">{downloads.length}</div>
            </Card>
          </div>

          {Object.keys(todayByExam).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(todayByExam).map(([exam, n]) => (
                <span
                  key={exam}
                  className="text-sm font-bold px-3 py-1 rounded-full bg-gold/15 text-foreground border border-gold/30"
                >
                  Koe {exam} · {n}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-4">
            {downloadsToday.length === 0 && (
              <p className="text-muted-foreground text-sm">Ei latauksia tänään vielä.</p>
            )}
            {downloadsToday.map((l) => (
              <Card key={l.id} className="p-4 border-gold/40 bg-gold/5">
                <div className="text-xs font-bold uppercase tracking-wide text-gold">Koe {examOf(l)}</div>
                <div className="font-bold mt-1">{magnetOf(l)}</div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{trafficOf(l)}</span>
                  <span>{l.email}</span>
                  <span>{whenFi(l.created_at)}</span>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Koe</th>
                    <th className="text-left p-3">Mitä latasi</th>
                    <th className="text-left p-3">Liikenne</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Milloin</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.slice(0, 50).map((l) => {
                    const isToday = new Date(l.created_at).getTime() >= todayTs;
                    return (
                      <tr key={l.id} className={`border-b ${isToday ? "bg-gold/5" : ""}`}>
                        <td className="p-3 font-bold">Koe {examOf(l)}</td>
                        <td className="p-3">{magnetOf(l)}</td>
                        <td className="p-3 text-muted-foreground">{trafficOf(l)}</td>
                        <td className="p-3">{l.email}</td>
                        <td className="p-3 text-muted-foreground">{whenFi(l.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* —— Kaikki liidit (lyhyt) —— */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Kaikki liidit
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Koe</th>
                  <th className="text-left p-3">Magnet</th>
                  <th className="text-left p-3">Milloin</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 40).map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="p-3 font-medium">{l.email}</td>
                    <td className="p-3">Koe {examOf(l)}</td>
                    <td className="p-3 text-muted-foreground">{magnetOf(l)}</td>
                    <td className="p-3 text-muted-foreground">{whenFi(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
