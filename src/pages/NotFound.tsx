import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { notFoundStrings } from "@/i18n/strings/not-found";
import { LANGUAGES, localizePath } from "@/i18n/locales";
import { canon } from "@/data/canon";

/**
 * Built once as dist/404.html, which GitHub Pages serves for every unknown
 * address in every language, so the page speaks all three languages at once.
 */
const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-muted">
    <SEO title={`404 — ${canon.brand}`} description={notFoundStrings.en.title} noindex />
    <div className="text-center">
      <h1 className="mb-8 text-4xl font-bold">404</h1>
      <div className="space-y-6">
        {LANGUAGES.map((lang) => (
          <div key={lang} lang={lang}>
            <p className="mb-2 text-xl text-muted-foreground">{notFoundStrings[lang].title}</p>
            <Link to={localizePath("/", lang)} className="text-primary underline hover:text-primary/90">
              {notFoundStrings[lang].backHome}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default NotFound;
