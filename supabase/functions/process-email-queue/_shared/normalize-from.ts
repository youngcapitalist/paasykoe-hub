/** Korvaa onboarding@resend.dev verified-domainilla ennen Resend-lähetystä. */

const DEFAULT_FROM_DOMAIN = () =>
  Deno.env.get("RESEND_FROM_DOMAIN")?.trim() || "valintakoefpro.com";

const LAUDATUR_FROM_DOMAIN = () =>
  Deno.env.get("LAUDATUR_FROM_DOMAIN")?.trim() ||
  Deno.env.get("RESEND_FROM_DOMAIN")?.trim() ||
  "laudaturpro.fi";

function domainForName(name: string): string {
  return /laudatur/i.test(name) ? LAUDATUR_FROM_DOMAIN() : DEFAULT_FROM_DOMAIN();
}

export function normalizeFromAddress(from: unknown): string {
  const raw = String(from ?? "").trim();
  const fallbackName = "Pääsykoe.fi";
  if (!raw) return `${fallbackName} <noreply@${DEFAULT_FROM_DOMAIN()}>`;
  if (!/onboarding@resend\.dev/i.test(raw)) return raw;

  const m = raw.match(/^(.*?)\s*<\s*onboarding@resend\.dev\s*>$/i);
  const name = (m?.[1] || fallbackName).trim() || fallbackName;
  return `${name} <noreply@${domainForName(name)}>`;
}
