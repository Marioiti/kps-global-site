import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { notFoundStrings } from "@/i18n/strings/not-found";
import { getLanguageFromPath, LANGUAGES, localizePath } from "@/i18n/locales";
import type { Language } from "@/i18n/translations";
import { canon } from "@/data/canon";

/**
 * dist/404.html answers every unknown address in every language. The prerendered page shows
 * all three languages; in the browser only the language of the address stays.
 */
const NotFound = () => {
  const { pathname } = useLocation();
  const [only, setOnly] = useState<Language | null>(null);
  // After hydration, so the prerendered page (all three languages) and the first render match.
  useEffect(() => setOnly(getLanguageFromPath(pathname)), [pathname]);

  return (
    <section className="border-b border-border">
      <SEO title={`404 · ${canon.brand}`} description={notFoundStrings.en.title} noindex />
      <div className="page-container pt-10 pb-16 md:pt-14 md:pb-24 flex flex-col md:flex-row gap-8 md:gap-[72px]">
        <span aria-hidden="true" className="font-seal font-black leading-none text-accent text-[96px] md:text-[168px] select-none">
          止
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[56px] md:text-[80px] leading-none text-foreground tabular-nums">404</h1>
          <div className="mt-8 md:mt-10 grid gap-10 md:grid-cols-3">
            {LANGUAGES.map((lang) => {
              const s = notFoundStrings[lang];
              return (
                <div key={lang} lang={lang} hidden={only !== null && only !== lang}>
                  <h2 className="font-display text-2xl text-foreground">{s.title}</h2>
                  <p className="mt-2 text-body">{s.text}</p>
                  <ul className="mt-4 space-y-1.5">
                    {[
                      { to: "/", label: s.backHome },
                      { to: "/services/", label: s.services },
                      { to: "/contact/", label: s.contact },
                    ].map((link) => (
                      <li key={link.to}>
                        <Link to={localizePath(link.to, lang)} className="link-v3">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
