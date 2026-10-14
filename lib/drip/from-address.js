/** Verified Resend from-domainit (ei onboarding@resend.dev). */

export const DEFAULT_FROM_DOMAIN =
  process.env.RESEND_FROM_DOMAIN?.trim() || "valintakoefpro.com";

export const LAUDATUR_FROM_DOMAIN =
  process.env.LAUDATUR_FROM_DOMAIN?.trim() ||
  process.env.RESEND_FROM_DOMAIN?.trim() ||
  "laudaturpro.fi";

/** Valitse lähetysdomain brändin / streamin perusteella. */
export function fromDomainForBrand(brandOrFromName = "") {
  const s = String(brandOrFromName || "");
  if (/laudatur/i.test(s)) return LAUDATUR_FROM_DOMAIN;
  return DEFAULT_FROM_DOMAIN;
}

/** `Display Name <noreply@domain>` */
export function fromHeader(fromName, domain) {
  const name = String(fromName || "Pääsykoe.fi").trim() || "Pääsykoe.fi";
  const host = String(domain || fromDomainForBrand(name)).replace(/^@/, "");
  return `${name} <noreply@${host}>`;
}

/** Korvaa onboarding@resend.dev verified-domainilla; säilytä display name. */
export function normalizeFromAddress(from) {
  const raw = String(from || "").trim();
  if (!raw) return fromHeader("Pääsykoe.fi", DEFAULT_FROM_DOMAIN);
  if (!/onboarding@resend\.dev/i.test(raw)) return raw;

  const m = raw.match(/^(.*?)\s*<\s*onboarding@resend\.dev\s*>$/i);
  const name = (m?.[1] || "Pääsykoe.fi").trim() || "Pääsykoe.fi";
  return fromHeader(name, fromDomainForBrand(name));
}
