#!/usr/bin/env node
/**
 * Build-time patch for valintakoeapro: always show paid PRO/VIP checkout
 * in SubscriptionPaywall (organic / Tilaa nyt), and never replace the
 * modal with only the free PDF lead magnet.
 *
 * Used because this agent cannot push to the private valintakoeapro GitHub
 * repo. Safe to run twice (idempotent).
 */
const fs = require("fs");
const path = require("path");

const paywallPath = path.join("src", "components", "SubscriptionPaywall.tsx");
const wtpPath = path.join("src", "components", "WtpSubscriptionPaywall.tsx");

if (!fs.existsSync(paywallPath) || !fs.existsSync(wtpPath)) {
  console.error("apply-valintakoe-a-paywall: expected Vite src/components paywall files");
  process.exit(1);
}

const wrapper = `import WtpSubscriptionPaywall from "@/components/WtpSubscriptionPaywall";

interface SubscriptionPaywallProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showBackButton?: boolean;
}

/** Always render paid PRO/VIP checkout (list price or WTP offer). Free PDF is a secondary link under the cards. */
const SubscriptionPaywall = ({
  title = "Ilmaiset käytetty!",
  description = "Hanki kertamaksulla pääsy kaikkiin ominaisuuksiin – voimassa kokeeseen asti.",
  onClose,
  showBackButton = true,
}: SubscriptionPaywallProps) => (
  <WtpSubscriptionPaywall
    title={title}
    description={description}
    onClose={onClose}
    showBackButton={showBackButton}
  />
);

export default SubscriptionPaywall;
`;

fs.writeFileSync(paywallPath, wrapper);
console.log("patched", paywallPath);

let wtp = fs.readFileSync(wtpPath, "utf8");

if (!wtp.includes("from \"react-router-dom\"")) {
  console.error("apply-valintakoe-a-paywall: unexpected WtpSubscriptionPaywall imports");
  process.exit(1);
}

if (!wtp.includes("import { Link, useNavigate } from \"react-router-dom\"")) {
  wtp = wtp.replace(
    'import { Link } from "react-router-dom";',
    'import { Link, useNavigate } from "react-router-dom";',
  );
}

const invalidEarlyReturn = `  if (offerContext && invalid && !hasCustomOffer) {
    return (
      <div className="max-w-xl w-full mx-auto text-center p-6 space-y-4">
        <p className="text-destructive text-sm">Tarjouslinkki on vanhentunut tai virheellinen.</p>
        <a
          href="https://paasykoe.fi/#tasotesti"
          className="inline-flex items-center justify-center rounded-pill bg-navy px-6 py-3 font-heading text-sm font-bold text-gold"
        >
          Tee ilmainen tasotesti
        </a>
        {showBackButton && onClose && (
          <Button variant="ghost" onClick={onClose}>Takaisin</Button>
        )}
      </div>
    );
  }

`;

if (wtp.includes(invalidEarlyReturn)) {
  wtp = wtp.replace(invalidEarlyReturn, "");
} else if (wtp.includes("Tarjouslinkki on vanhentunut tai virheellinen.") && !wtp.includes("Näytetään listahinnat")) {
  console.error("apply-valintakoe-a-paywall: invalid-offer early return present but did not match");
  process.exit(1);
}

if (!wtp.includes("const navigate = useNavigate();")) {
  wtp = wtp.replace(
    "  } = useOfferPricing();\n",
    "  } = useOfferPricing();\n  const navigate = useNavigate();\n",
  );
}

const goToLeadMagnet = `  const goToLeadMagnet = () => {
    onClose?.();
    const el = document.getElementById("lead-magnet");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#lead-magnet");
      setTimeout(() => {
        document.getElementById("lead-magnet")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

`;

if (!wtp.includes("const goToLeadMagnet = () => {")) {
  wtp = wtp.replace(
    "  const proList = offer ? wtpProFeatures(offer.liveMasterclasses) : DEFAULT_PRO_FEATURES;\n",
    `${goToLeadMagnet}  const proList = offer ? wtpProFeatures(offer.liveMasterclasses) : DEFAULT_PRO_FEATURES;\n`,
  );
}

const invalidBanner = `      {offerContext && invalid && !hasCustomOffer && (
        <p className="mb-6 text-destructive text-sm">
          Tarjouslinkki on vanhentunut tai virheellinen. Näytetään listahinnat.
        </p>
      )}

`;

if (!wtp.includes("Näytetään listahinnat")) {
  wtp = wtp.replace(
    "      <p className=\"text-muted-foreground mb-8\">{description}</p>\n",
    "      <p className=\"text-muted-foreground mb-8\">{description}</p>\n\n" + invalidBanner,
  );
}

const pdfLink = `      {!offerContext && (
        <p className="text-sm text-muted-foreground mb-4">
          Tai{" "}
          <button type="button" className="underline hover:text-gold" onClick={goToLeadMagnet}>
            lataa vuoden 2026 koe ilmaiseksi (PDF)
          </button>
        </p>
      )}

`;

if (!wtp.includes("lataa vuoden 2026 koe ilmaiseksi (PDF)")) {
  wtp = wtp.replace(
    "      {showBackButton && onClose && (",
    pdfLink + "      {showBackButton && onClose && (",
  );
}

fs.writeFileSync(wtpPath, wtp);
console.log("patched", wtpPath);
