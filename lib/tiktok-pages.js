/** TikTok-alasivujen slug-validointi ja Blob-polku. */

export const TIKTOK_PAGE_PREFIX = "tiktok-pages";

export function tiktokBlobPath(slug) {
  return `${TIKTOK_PAGE_PREFIX}/${slug}.html`;
}

export function isValidTikTokSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9-]{1,64}$/.test(slug);
}
