"use client";

import { useEffect, useState } from "react";
import { COURSES } from "../courses";
import { loadHubOffer, HUB_WTP_OFFER_EVENT } from "../../lib/wtp-persist";
import { WTP_OFFER_EXAM } from "../../lib/wtp";

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" aria-label={`Arvosana ${rating} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < Math.round(rating) ? "fill-gold" : "fill-line"}`} aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function CoursesGrid() {
  const [hideFStandard, setHideFStandard] = useState(false);

  useEffect(() => {
    const sync = () => {
      const offer = loadHubOffer();
      setHideFStandard(offer?.examCode === WTP_OFFER_EXAM);
    };
    sync();
    window.addEventListener(HUB_WTP_OFFER_EVENT, sync);
    return () => window.removeEventListener(HUB_WTP_OFFER_EVENT, sync);
  }, []);

  const courses = hideFStandard ? COURSES.filter((c) => c.code !== WTP_OFFER_EXAM) : COURSES;

  return (
    <div id="valmennusmateriaalit" data-slot="valmennusmateriaalit" className="mt-14">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-pill bg-navy px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-gold">
          Asiantuntijoiden suosittelemat
        </span>
        <h3 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-navy md:text-3xl">
          Valmennuskurssit, joilla pääset sisään — etkä jää varasijalle
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-navy/85">
          Joka vuosi tuhannet hakijat kilpailevat samoista paikoista. Ratkaiseva ero ei ole lahjakkuus vaan
          oikea valmistautuminen. Alla olevat kurssit ovat alalle päässeiden opiskelijoiden ja opettajien
          rakentamia — juuri sen kokeen voittamiseen, jota sinä tavoittelet.
        </p>
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-3">
        {[
          ["561", "opiskelijan luottama"],
          ["4.7 / 5", "kurssien keskiarvosana"],
          ["Opettajat", "ja sisään päässeet mentorit"],
        ].map(([big, small]) => (
          <div key={small} className="text-center">
            <dt className="font-heading text-2xl font-extrabold text-navy">{big}</dt>
            <dd className="mt-1 text-sm text-navy/70">{small}</dd>
          </div>
        ))}
      </dl>

      {hideFStandard && (
        <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 px-6 py-5 text-[15px] text-navy/85">
          <strong className="font-semibold text-navy">Kauppiksen (F) henkilökohtainen tarjouksesi</strong> näkyy
          tasotestin tuloksessa yllä — ei kiinteää listahintaa.
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {courses.map((c) => (
          <article
            key={c.code}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(10,37,64,0.28)] ${
              c.popular ? "border-gold ring-2 ring-gold/40" : "border-line"
            }`}
          >
            {c.popular && (
              <span className="absolute -top-3 left-6 rounded-pill bg-gold px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-wider text-navy">
                Suosituin valinta
              </span>
            )}

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-lg font-extrabold text-gold">{c.code}</span>
              <div>
                <h4 className="font-heading text-lg font-bold leading-tight text-navy">{c.title}</h4>
                <span className="text-sm font-semibold text-navy/60">{c.field}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/70">
              <Stars rating={c.rating} />
              <span className="font-semibold text-navy">{c.rating}/5</span>
            </div>

            <ul className="mt-4 space-y-2 text-[15px] text-navy/80">
              {c.perks.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 fill-gold" aria-hidden><path d="M8 13.2l-3.1-3.1-1.4 1.4L8 16 17 7l-1.4-1.4z" /></svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-navy/60">{c.closing}</span>
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-mist px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-navy/50">Peruskurssi</span>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-extrabold text-navy">{c.price}</span>
                    <span className="text-sm font-semibold text-navy/40 line-through">{c.oldPrice}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-navy px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-gold">VIP</span>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-extrabold text-white">{c.vipPrice}</span>
                    <span className="text-sm font-semibold text-white/40 line-through">{c.vipOldPrice}</span>
                  </div>
                  <span className="mt-1 block text-[11px] font-semibold text-gold">Vain {c.seatsLeft} VIP-paikkaa jäljellä</span>
                </div>
              </div>
              <a
                href={c.href}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill bg-navy px-5 py-3 font-heading text-sm font-bold text-gold transition-colors hover:bg-navy-light"
              >
                Varaa paikkasi
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-navy px-6 py-7 text-white md:flex-row md:items-center">
        <div>
          <h4 className="font-heading text-lg font-bold text-gold">Et ole vielä varma alasta?</h4>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/80">
            Tee maksuton tasotesti 2 minuutissa ja saat henkilökohtaisen suosituksen sinulle parhaiten
            sopivasta alasta, koulutuksesta ja valmennuskurssista.
          </p>
        </div>
        <a
          href="#tasotesti"
          className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-gold px-5 py-3 font-heading text-sm font-bold text-navy transition-colors hover:bg-gold-dark"
        >
          Tee ilmainen tasotesti
        </a>
      </div>
    </div>
  );
}
