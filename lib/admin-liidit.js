/** Hubissa avain voi olla SUPABASE_KEY (service role) tai SUPABASE_SERVICE_ROLE_KEY. */
function dashboardSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  const base = url.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  return { base, key };
}

async function dashboardFetch(path, options = {}) {
  const cfg = dashboardSupabaseConfig();
  if (!cfg) return { error: "no_config", status: 503 };
  const res = await fetch(`${cfg.base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: text || res.statusText, status: res.status };
  }
  if (res.status === 204) return { data: null };
  const data = await res.json().catch(() => null);
  return { data };
}

/** Tarkista founder-dashboard token (DB) tai ADMIN_DASHBOARD_SECRET (env). */
export async function assertDashboardToken(token) {
  const t = typeof token === "string" ? token.trim() : "";
  if (!t) return { ok: false, reason: "missing_token" };

  const envSecret = process.env.ADMIN_DASHBOARD_SECRET || process.env.FOUNDER_DASHBOARD_TOKEN;
  if (envSecret && t === envSecret) return { ok: true, via: "env" };

  if (!dashboardSupabaseConfig()) return { ok: false, reason: "no_supabase" };

  const { data, error, status } = await dashboardFetch(
    `founder_dashboard_tokens?token=eq.${encodeURIComponent(t)}&select=token&limit=1`
  );
  if (error) return { ok: false, reason: "token_lookup_failed", status, error };
  if (Array.isArray(data) && data.length > 0) return { ok: true, via: "db" };
  return { ok: false, reason: "invalid_token" };
}

export async function fetchLiiditDashboard() {
  const lataukset = await dashboardFetch(
    "dashboard_lataukset?select=*&order=created_at.desc&limit=100"
  );
  const kaikki = await dashboardFetch("_liidit?select=*&order=created_at.desc&limit=80");

  if (lataukset.error && kaikki.error) {
    return {
      error: lataukset.error || kaikki.error,
      status: lataukset.status || kaikki.status,
    };
  }

  return {
    lataukset: Array.isArray(lataukset.data) ? lataukset.data : [],
    kaikki: Array.isArray(kaikki.data) ? kaikki.data : [],
  };
}
