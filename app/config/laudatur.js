/** Ulkoiset linkit LaudaturPro.fi:hin (hub ei hostaa Laudatur-sivuja). */

export const LAUDATUR_SITE_URL =
  process.env.NEXT_PUBLIC_LAUDATUR_URL?.replace(/\/$/, "") || "https://laudaturpro.fi";

export function laudaturPublicUrl(path = "", params = {}) {
  const base = LAUDATUR_SITE_URL;
  const p = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = new URL(`${base}${p}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export function laudaturOrderUrl(productId, extra = {}) {
  return laudaturPublicUrl("/tilaa", { paketti: productId, ...extra });
}

/** Quiz-first yo-tarkastus (suora linkki pääsykoe.fi:stä). */
export function laudaturQuizUrl(extra = {}) {
  return laudaturPublicUrl("/aloita", {
    utm_source: "paasykoe",
    utm_medium: "quiz",
    ...extra,
  });
}
