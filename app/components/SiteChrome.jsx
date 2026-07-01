import { NAV_LINKS, FOOTER_COLUMNS } from "../config/site";

export function Logo({ className = "h-11 w-11" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M6 18V8a2 2 0 0 1 2-2h10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <path d="M42 30v10a2 2 0 0 1-2 2H30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" />
      <circle cx="24" cy="26" r="11" fill="#6ee7b7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

const FlagFI = () => (
  <svg viewBox="0 0 18 12" className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20">
    <rect width="18" height="12" fill="#fff" />
    <rect x="5" width="3" height="12" fill="#0A2540" />
    <rect y="4.5" width="18" height="3" fill="#0A2540" />
  </svg>
);

export function SiteNav({ activePath }) {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex h-[88px] max-w-site items-center gap-8 px-6 md:px-8">
        <a href="/" className="flex shrink-0 items-center" aria-label="Pääsykoe.fi">
          <Logo />
        </a>
        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Päävalikko">
          {NAV_LINKS.map((item) => {
            const isActive =
              activePath === item.href ||
              (item.label === "Todistusvalinta" && activePath?.startsWith("/todistusvalinta"));
            return (
              <a
                key={item.label}
                href={item.href}
                className={`font-heading text-[15px] font-semibold transition-colors ${
                  isActive ? "text-gold" : "text-white/90 hover:text-gold"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-2.5 sm:flex">
            <span aria-hidden>
              <FlagFI />
            </span>
          </div>
          <button type="button" aria-label="Haku" className="ml-2 text-white/90 hover:text-gold">
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Tietopankki yliopistojen kansallisista valintakokeista 2026–2027.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-site px-6 py-5 text-xs text-white/50 md:px-8">© 2026 Pääsykoe.fi — tietopankki.</div>
      </div>
    </footer>
  );
}
