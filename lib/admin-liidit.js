import { adminFetch, supabaseAdminConfig } from "./drip/supabase-admin.js";

/** Tarkista founder-dashboard token (DB) tai ADMIN_DASHBOARD_SECRET (env). */
export async function assertDashboardToken(token) {
  const t = typeof token === "string" ? token.trim() : "";
  if (!t) return { ok: false, reason: "missing_token" };

  const envSecret = process.env.ADMIN_DASHBOARD_SECRET || process.env.FOUNDER_DASHBOARD_TOKEN;
  if (envSecret && t === envSecret) return { ok: true, via: "env" };

  if (!supabaseAdminConfig()) return { ok: false, reason: "no_supabase" };

  const { data, error, status } = await adminFetch(
    `founder_dashboard_tokens?token=eq.${encodeURIComponent(t)}&select=token&limit=1`
  );
  if (error) return { ok: false, reason: "token_lookup_failed", status, error };
  if (Array.isArray(data) && data.length > 0) return { ok: true, via: "db" };
  return { ok: false, reason: "invalid_token" };
}

export async function fetchLiiditDashboard() {
  const lataukset = await adminFetch(
    "dashboard_lataukset?select=*&order=created_at.desc&limit=100"
  );
  const kaikki = await adminFetch("_liidit?select=*&order=created_at.desc&limit=80");

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
