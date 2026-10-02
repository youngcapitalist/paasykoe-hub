import WtpSubscriptionPaywall from "@/components/WtpSubscriptionPaywall";

interface SubscriptionPaywallProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showBackButton?: boolean;
}

/** Always show PRO/VIP prices (standard or personal WTP offer) — never the free lead magnet. */
const SubscriptionPaywall = ({
  title = "Ilmaiset käytetty!",
  description = "Hanki kertamaksulla pääsy kaikkiin ominaisuuksiin – voimassa kokeeseen asti.",
  onClose,
  showBackButton = true,
}: SubscriptionPaywallProps) => {
  return (
    <WtpSubscriptionPaywall
      title={title}
      description={description}
      onClose={onClose}
      showBackButton={showBackButton}
    />
  );
};

export default SubscriptionPaywall;
