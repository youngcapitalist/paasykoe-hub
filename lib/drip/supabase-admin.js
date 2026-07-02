/** Service role -kyselyt drip-jonoon (jaettu Supabase). */

export function supabaseAdminConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  const base = url.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  return { base, key };
}

export async function adminFetch(path, options = {}) {
  const cfg = supabaseAdminConfig();
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
