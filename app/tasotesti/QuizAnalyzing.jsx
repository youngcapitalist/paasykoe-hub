"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { at: 0, label: "Kerätään vastauksesi" },
  { at: 18, label: "Pisteytetään soveltuvuus aloittain" },
  { at: 38, label: "Vertaillaan valintakokeita keskenään" },
  { at: 58, label: "Rakennetaan henkilökohtainen valmennuspolku" },
  { at: 78, label: "Lasketaan henkilökohtainen hinta" },
  { at: 93, label: "Viimeistellään suunnitelmasi" },
];

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function QuizAnalyzing({ onComplete, destination = null }) {
  const [progress, setProgress] = useState(0);
  const durationRef = useRef(3500 + Math.random() * 1500);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const duration = durationRef.current;
    const start = performance.now();
    let frame = 0;
    let doneTimer = 0;
    let cancelled = false;

    const tick = (now) => {
      if (cancelled) return;
      const linear = Math.min(1, (now - start) / duration);
      setProgress(Math.min(100, easeOutCubic(linear) * 100));

      if (linear < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        doneTimer = window.setTimeout(() => {
          if (!cancelled) onCompleteRef.current?.();
        }, 280);
      }
    };

    frame = requestAnimationFrame(tick);

    // Varmuus: jos rAF jumittuu (taustavälilehti tms.), näytä tulos silti.
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        onCompleteRef.current?.();
      }
    }, duration + 800);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(doneTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  const activeIndex = STEPS.reduce((idx, step, i) => (progress >= step.at ? i : idx), 0);

  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-10">
      <span className="inline-flex rounded-pill bg-navy/5 px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-wider text-navy/60">
        Analyysi käynnissä
      </span>

      <h2 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-navy md:text-3xl">
        Laadimme henkilökohtaista valmennussuunnitelmaasi
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-navy/70">
        {destination ? (
          <>
            Räätälöidään reittiä kohti <span className="font-bold text-navy">{destination}</span> vastaustesi
            perusteella.
          </>
        ) : (
          "Käsittelemme vastauksesi ja rakennamme sinulle yksilöllisen valmennussuunnitelman."
        )}
      </p>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-navy/50">
          <span>{STEPS[activeIndex]?.label}</span>
          <span className="tabular-nums text-navy">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-line">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-navy via-gold-dark to-gold transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/25" />
          </div>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {STEPS.map((step, i) => {
          const done = progress >= step.at + 8 || (i === STEPS.length - 1 && progress >= 98);
          const active = i === activeIndex && !done;
          return (
            <li
              key={step.label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                done
                  ? "border-gold/40 bg-gold/10 text-navy"
                  : active
                    ? "border-navy/20 bg-navy/5 text-navy"
                    : "border-transparent text-navy/40"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-gold text-navy"
                    : active
                      ? "border-2 border-navy text-navy"
                      : "border border-line text-navy/30"
                }`}
                aria-hidden
              >
                {done ? "✓" : active ? "…" : ""}
              </span>
              <span className={done || active ? "font-semibold" : "font-medium"}>{step.label}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-xs text-navy/45">Tämä kestää muutaman sekunnin — älä sulje sivua.</p>
    </div>
  );
}
