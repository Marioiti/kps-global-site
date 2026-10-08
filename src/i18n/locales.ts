import type { Language } from './translations';

/**
 * Language-aware URLs. English lives at the root, other languages under a
 * prefix: `/privacy/`, `/ru/privacy/`, `/zh/privacy/`.
 *
 * Plain TS with no React or path-alias imports: `vite.config.ts` uses it to
 * list the pages to prerender and to build sitemap.xml.
 */

export const SITE_URL = 'https://kpsglobal.id';

export const LANGUAGES: readonly Language[] = ['en', 'ru', 'zh'];
export const DEFAULT_LANGUAGE: Language = 'en';

export const OG_LOCALES: Record<Language, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  zh: 'zh_CN',
};

/** Base (English) path of every indexed page. Each one is published in every language. */
export const PAGE_PATHS = [
  '/',
  '/services/',
  '/services/deal-structuring/',
  '/services/fractional-coo/',
  '/services/compliance-kyc/',
  '/commodities/',
  '/about/',
  '/contact/',
  '/privacy/',
] as const;
export type PagePath = (typeof PAGE_PATHS)[number];


/**
 * Content sections (lists). Always prerendered; indexed and listed in the
 * sitemap only once the section has a published item (see vite.config.ts).
 */
export const COLLECTION_PATHS = ['/insights/', '/news/', '/procedures/', '/mandates/', '/documents/'] as const;

const isLanguage = (value: string | undefined): value is Language =>
  LANGUAGES.includes(value as Language);

export function getLanguageFromPath(pathname: string): Language {
  const segment = pathname.split('/')[1];
  return isLanguage(segment) && segment !== DEFAULT_LANGUAGE ? segment : DEFAULT_LANGUAGE;
}

/** `/ru/privacy/` → `/privacy/`, `/ru` → `/`. */
export function stripLanguagePrefix(pathname: string): string {
  const language = getLanguageFromPath(pathname);
  if (language === DEFAULT_LANGUAGE) return pathname || '/';
  const rest = pathname.slice(language.length + 1);
  return rest.startsWith('/') ? rest : `/${rest}`;
}

/** `/privacy/` + `ru` → `/ru/privacy/`. */
export function localizePath(path: string, language: Language): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return language === DEFAULT_LANGUAGE ? normalized : `/${language}${normalized}`;
}

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

const localizeAll = (paths: readonly string[]): string[] =>
  paths.flatMap((path) => LANGUAGES.map((language) => localizePath(path, language)));

/** Every indexed page in every language, e.g. `/`, `/ru/`, `/zh/privacy/`. */
export const localizedPagePaths = (): string[] => localizeAll(PAGE_PATHS);

/** Everything to prerender except content items: pages and section lists. */
export const prerenderPaths = (): string[] => [...localizeAll(PAGE_PATHS), ...localizeAll(COLLECTION_PATHS)];
