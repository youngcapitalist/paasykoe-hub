import { SiteNav, SiteFooter } from "../../components/SiteChrome";
import TodistusvalintaCalculator from "./TodistusvalintaCalculator";

export const metadata = {
  title: "Todistusvalintalaskuri 2026 — laske ylioppilastodistuksen pisteet | Pääsykoe.fi",
  description:
    "Ilmainen todistusvalintalaskuri: laske ylioppilastutkintosi pisteet yliopiston hakukohteisiin vuoden 2026 pisteytystaulukoiden mukaan. Näe riittääkö todistus vai tarvitsetko valintakokeen.",
};

export default function TodistusvalintaLaskuriPage() {
  return (
    <main>
      <SiteNav activePath="/todistusvalinta/laskuri" />
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-site px-6 py-14 md:px-8 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-pill bg-navy px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-gold">
            Ilmainen · 2026 pisteytys
          </span>
          <h1 className="mt-5 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-navy md:text-5xl">
            Todistusvalintalaskuri
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-navy/85">
            Laske ylioppilastutkintosi todistuspisteet ja vertaa niitä hakemaasi alaan. Jos pisteet eivät riitä
            todistusvalintaan, valintakoe on reitti opiskelupaikkaan — ja siihen voit valmistautua meidän kursseillamme.
          </p>
          <div className="mt-10">
            <TodistusvalintaCalculator />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
