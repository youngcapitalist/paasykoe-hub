import { redirect } from "next/navigation";

const EXAM_SITES = {
  a: "https://valintakoea.fi",
  b: "https://valintakoeb.fi",
  c: "https://valintakoec.fi",
  e: "https://valintakoee.fi",
  f: "https://valintakoefpro.com",
};

/** Uudelleenohjaus kurssisivun /hinnoittelu-alennussivulle (some-postaukset, hub-linkit). */
export default function HinnoitteluRedirect({ searchParams }) {
  const koe = (searchParams?.koe ?? searchParams?.utm_campaign ?? "f").toString().toLowerCase();
  const base = EXAM_SITES[koe] ?? EXAM_SITES.f;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "koe") continue;
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else if (value != null) qs.set(key, value);
  }
  if (!qs.has("utm_medium")) {
    qs.set("utm_medium", koe === "b" ? "B_hot_deal" : "C_hot_deal");
  }
  if (!qs.has("utm_source")) qs.set("utm_source", "paasykoe");

  redirect(`${base}/hinnoittelu?${qs.toString()}`);
}
