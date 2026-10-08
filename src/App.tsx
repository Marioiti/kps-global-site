import type { ComponentType } from "react";
import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./layouts/RootLayout";
import SiteLayout from "./layouts/SiteLayout";
import { findEntry, getMandates, loadBody, loadCommodity, staticPaths, type Collection } from "./content";
import type { ArticleData } from "./pages/Article";
import type { CommodityData } from "./pages/Commodity";
import { loadStrings } from "./i18n/translations";
import { canon } from "./data/canon";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  getLanguageFromPath,
  PAGE_PATHS,
  type PagePath,
} from "./i18n/locales";

interface LazyPage {
  load: () => Promise<{ default: ComponentType }>;
  /** Source file, so the prerendered HTML preloads the page chunk. */
  entry: string;
}

const page = (name: string, load: LazyPage["load"]): LazyPage => ({ load, entry: `src/pages/${name}.tsx` });

/** Each page is its own chunk; prerendering resolves them all at build time. */
const PAGES: Record<PagePath, LazyPage> = {
  "/": page("Index", () => import("./pages/Index")),
  "/services/": page("Services", () => import("./pages/Services")),
  "/services/deal-structuring/": page("DealStructuring", () => import("./pages/DealStructuring")),
  "/services/fractional-coo/": page("FractionalCoo", () => import("./pages/FractionalCoo")),
  "/services/compliance-kyc/": page("ComplianceKyc", () => import("./pages/ComplianceKyc")),
  "/commodities/": page("Commodities", () => import("./pages/Commodities")),
  "/about/": page("About", () => import("./pages/About")),
  "/contact/": page("Contact", () => import("./pages/Contact")),
  "/privacy/": page("PrivacyPolicy", () => import("./pages/PrivacyPolicy")),
};

const lazyRoute = ({ load, entry }: LazyPage) => ({
  entry,
  lazy: async () => ({ Component: (await load()).default }),
});

/** /mandates/ and one prerendered page per published mandate. New objects per language. */
const mandateRoutes = (): RouteRecord[] => [
  { path: "mandates", ...lazyRoute(page("Mandates", () => import("./pages/Mandates"))) },
  {
    path: "mandates/:id",
    getStaticPaths: () => getMandates().map((m) => `mandates/${m.slug}`),
    ...lazyRoute(page("Mandate", () => import("./pages/Mandate"))),
  },
];

const LIST_PAGES: Record<Collection, LazyPage> = {
  insights: page("Insights", () => import("./pages/Insights")),
  news: page("News", () => import("./pages/News")),
  procedures: page("Procedures", () => import("./pages/Procedures")),
  documents: page("Documents", () => import("./pages/Documents")),
};

const languageOf = (request: Request) => getLanguageFromPath(new URL(request.url).pathname);

/** List page plus one prerendered page per published item (getStaticPaths). */
const collectionRoutes = (collection: Collection): RouteRecord[] => [
  { path: collection, ...lazyRoute(LIST_PAGES[collection]) },
  {
    path: `${collection}/:slug`,
    entry: collection === "documents" ? "src/pages/Document.tsx" : "src/pages/Article.tsx",
    getStaticPaths: () => staticPaths(collection),
    // Runs at build time; the browser gets the result as prerendered data.
    loader: async ({ params, request }): Promise<ArticleData> => {
      const entry = findEntry(collection, params.slug ?? "");
      return { body: entry ? await loadBody(entry, languageOf(request)) : null };
    },
    lazy: async () => {
      if (collection === "documents") return { Component: (await import("./pages/Document")).default };
      const { default: Article } = await import("./pages/Article");
      return { element: <Article collection={collection} /> };
    },
  },
];

/** One page per commodity in the canon. A new object per language: the router assigns ids to route objects. */
const commodityRoute = (): RouteRecord => ({
  path: "commodities/:id",
  entry: "src/pages/Commodity.tsx",
  getStaticPaths: () => canon.commodities.map((c) => `commodities/${c.id}`),
  loader: async ({ params, request }): Promise<CommodityData> => ({
    page: await loadCommodity(params.id ?? "", languageOf(request)),
  }),
  lazy: async () => ({ Component: (await import("./pages/Commodity")).default }),
});

const toRoutePath = (path: string) => path.replace(/^\/|\/$/g, "");

const pageRoutes = (): RouteRecord[] => [
  ...PAGE_PATHS.map((path): RouteRecord =>
    path === "/"
      ? { index: true, ...lazyRoute(PAGES[path]) }
      : { path: toRoutePath(path), ...lazyRoute(PAGES[path]) },
  ),
  commodityRoute(),
  ...mandateRoutes(),
  ...collectionRoutes("insights"),
  ...collectionRoutes("news"),
  ...collectionRoutes("procedures"),
  ...collectionRoutes("documents"),
];

/** English pages at the root, the other languages under /ru/ and /zh/. */
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { element: <SiteLayout />, children: pageRoutes() },
      ...LANGUAGES.filter((lang) => lang !== DEFAULT_LANGUAGE).map((lang) => ({
        path: lang,
        element: <SiteLayout />,
        // The language's interface strings, loaded before any of its pages renders.
        lazy: async () => {
          await loadStrings(lang);
          return { handle: { language: lang } };
        },
        children: pageRoutes(),
      })),
      { path: "*", ...lazyRoute(page("NotFoundPage", () => import("./pages/NotFoundPage"))) },
    ],
  },
];
