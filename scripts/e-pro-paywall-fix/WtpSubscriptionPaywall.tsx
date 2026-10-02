import { Button } from "@/components/ui/button";
import { Lock, Crown, Check, Loader2, Calendar, Shield, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useOfferPricing } from "@/hooks/useOfferPricing";
import { wtpProFeatures, wtpVipFeatures } from "@/lib/wtpPricing";

const DEFAULT_PRO_FEATURES = [
  "Rajaton AI Professori",
  "Kaikki harjoitusmateriaalit",
  "Koesimulaatiot aikarajalla",
  "Kysy opettajalta – vastaus 1–2 arkipäivässä",
  "Pääsy voimassa kevään 2027 kokeeseen asti",
];

const DEFAULT_VIP_FEATURES = [
  "Kaikki PRO-paketin ominaisuudet",
  "4× Live Masterclass (kevään suljetut sessiot)",
  "Sisäänpääsytakuu: et pääse → rahat takaisin (ehdoin)",
];

interface WtpSubscriptionPaywallProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showBackButton?: boolean;
}

const WtpSubscriptionPaywall = ({
  title = "Ilmaiset käytetty!",
  description = "Hanki kertamaksulla pääsy kaikkiin ominaisuuksiin – voimassa kokeeseen asti.",
  onClose,
  showBackButton = true,
}: WtpSubscriptionPaywallProps) => {
  const {
    proPriceEur,
    vipPriceEur,
    buyPro,
    buyVip,
    loadingTier,
    offerContext,
    loading,
    invalid,
    hasCustomOffer,
    proAccessCta,
    vipCta,
    offer,
  } = useOfferPricing();
  const navigate = useNavigate();

  const proList = offer ? wtpProFeatures(offer.liveMasterclasses) : DEFAULT_PRO_FEATURES;
  const vipList = offer ? wtpVipFeatures(offer.liveMasterclasses) : DEFAULT_VIP_FEATURES;
  const vipSubtitle = offer?.liveMasterclasses
    ? "Sisäänpääsytakuu + kaikki PRO + 4× Live Masterclass"
    : offer
      ? "Sisäänpääsytakuu + kaikki PRO"
      : "Sisäänpääsytakuu + kaikki PRO + 4× Live Masterclass";

  const goToLeadMagnet = () => {
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

  if (offerContext && loading) {
    return (
      <div className="max-w-xl w-full mx-auto text-center p-6 py-12">
        <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto mb-4" />
        <p className="text-muted-foreground">Ladataan sinun tarjoustasi…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto text-center p-6 pb-10">
      <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-gold" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground mb-8">{description}</p>

      {offerContext && invalid && !hasCustomOffer && (
        <p className="mb-6 text-sm text-destructive">
          Tarjouslinkki on vanhentunut tai virheellinen. Alla listahinnat.
        </p>
      )}

      {hasCustomOffer && (
        <p className="mb-6 text-sm font-semibold text-gold">Sinun henkilökohtainen kurssitarjouksesi</p>
      )}

      <div className="p-6 rounded-2xl border-2 border-gold bg-gold/5 relative text-left mb-6">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-accent-foreground text-xs font-bold rounded-full">
          {hasCustomOffer ? "KURSSITARJOUS" : "KERTAMAKSU"}
        </div>
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          PRO – Pääsy kokeeseen asti
          <Crown className="w-4 h-4 text-gold" />
        </h3>
        <p className="text-3xl font-bold text-foreground mb-1">
          {proPriceEur}€ <span className="text-sm font-normal text-muted-foreground">kerralla</span>
        </p>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Ei tilausta – maksat vain kerran
        </p>
        <ul className="space-y-2 my-4">
          {proList.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-gold shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button variant="gold" className="w-full" onClick={buyPro} disabled={!!loadingTier}>
          {loadingTier === "pro" ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ladataan...</>
          ) : (
            proAccessCta
          )}
        </Button>
      </div>

      <div className="p-6 rounded-2xl border-2 border-gold/60 bg-ink-950/5 relative text-left mb-6" style={{ background: "linear-gradient(160deg, hsl(var(--primary)/0.05), hsl(var(--gold)/0.08))" }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-accent-foreground text-xs font-bold rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" /> VIP TAKUU
        </div>
        <h3 className="font-bold text-lg mb-2">VIP Takuu -paketti</h3>
        <p className="text-3xl font-bold text-foreground mb-1">
          {vipPriceEur}€ <span className="text-sm font-normal text-muted-foreground">kerralla</span>
        </p>
        <p className="text-xs text-muted-foreground mb-4">{vipSubtitle}</p>
        <ul className="space-y-2 my-4">
          {vipList.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-gold shrink-0" />{f}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mb-4">
          Takuu edellyttää takuuehtojen täyttymistä. <Link to="/takuuehdot" className="underline hover:text-gold">Katso takuuehdot</Link>
        </p>
        <Button variant="gold" className="w-full" onClick={buyVip} disabled={!!loadingTier}>
          {loadingTier === "vip" ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ladataan...</>
          ) : (
            vipCta
          )}
        </Button>
      </div>

      {!offerContext && (
        <button
          type="button"
          onClick={goToLeadMagnet}
          className="mb-4 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          <Download className="w-4 h-4" />
          Lataa vuoden 2026 koe ilmaiseksi (PDF)
        </button>
      )}

      {showBackButton && onClose && (
        <Button variant="ghost" onClick={onClose}>
          Takaisin
        </Button>
      )}
    </div>
  );
};

export default WtpSubscriptionPaywall;
