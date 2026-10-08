import type { Language } from '../i18n/translations';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  PAGE_PATHS,
  absoluteUrl,
  localizePath,
} from '../i18n/locales';

/**
 * sitemap.xml and robots.txt, generated at build time (see `onFinished` in
 * vite.config.ts). Pages are listed in every language; content items only in
 * the languages that have their own published text.
 */

export interface SitemapPage {
  /** Base (English) path. */
  path: string;
  languages: readonly Language[];
  /** ISO date of the last change, for content items. */
  lastmod?: string;
}

const alternateLinks = (page: SitemapPage): string =>
  [
    ...page.languages.map((language) => [language, localizePath(page.path, language)]),
    ['x-default', localizePath(page.path, DEFAULT_LANGUAGE)],
  ]
    .map(
      ([hreflang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${absoluteUrl(href)}"/>`,
    )
    .join('\n');

export const STATIC_PAGES: SitemapPage[] = PAGE_PATHS.map((path) => ({ path, languages: LANGUAGES }));

export function buildSitemap(pages: SitemapPage[] = STATIC_PAGES): string {
  const entries = pages.flatMap((page) =>
    page.languages.map((language) =>
      [
        '  <url>',
        `    <loc>${absoluteUrl(localizePath(page.path, language))}</loc>`,
        ...(page.lastmod ? [`    <lastmod>${page.lastmod}</lastmod>`] : []),
        alternateLinks(page),
        '  </url>',
      ].join('\n'),
    ),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobots(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n');
}
