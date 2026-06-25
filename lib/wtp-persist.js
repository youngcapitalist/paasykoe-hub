const HUB_KEY = "paasykoe_wtp_offer";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function persistHubOffer({ token, priceEur, vipPriceEur, examCode }) {
  if (typeof window === "undefined" || !token) return;
  try {
    localStorage.setItem(
      HUB_KEY,
      JSON.stringify({ token, priceEur, vipPriceEur, examCode, savedAt: Date.now() })
    );
    notifyHubOfferChange();
  } catch {
    /* private mode */
  }
}

export function loadHubOffer() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.token || Date.now() - data.savedAt > TTL_MS) {
      localStorage.removeItem(HUB_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export const HUB_WTP_OFFER_EVENT = "hub-wtp-offer-updated";

export function notifyHubOfferChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HUB_WTP_OFFER_EVENT));
}

export function clearHubOffer() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HUB_KEY);
    notifyHubOfferChange();
  } catch {
    /* private mode */
  }
}
