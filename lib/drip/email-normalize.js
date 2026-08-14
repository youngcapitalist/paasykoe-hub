/** Sähköpostin normalisointi — vältetään duplikaattidripit alias-osoitteilla. */

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);
const PLUS_ALIAS_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
]);

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Kanoninen avain duplikaattitarkistuksiin.
 * Gmail: pisteet pois + plus-alias pois (ella@gmail = e.l.la+tag@gmail).
 * Outlook/iCloud: plus-alias pois.
 * Eri palvelut (gmail vs icloud) = eri avain — emme yhdistä eri postilaatikoita.
 */
export function canonicalEmailKey(email) {
  const norm = normalizeEmail(email);
  const at = norm.lastIndexOf("@");
  if (at < 1) return norm;

  let local = norm.slice(0, at);
  let domain = norm.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";

  if (PLUS_ALIAS_DOMAINS.has(domain)) {
    local = local.split("+")[0];
  }
  if (GMAIL_DOMAINS.has(domain) || domain === "gmail.com") {
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

/** Onko kaksi osoitetta sama henkilö alias-sääntöjen mukaan? */
export function emailsMatch(a, b) {
  return canonicalEmailKey(a) === canonicalEmailKey(b);
}
