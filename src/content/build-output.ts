import fs from 'node:fs';
import path from 'node:path';
import { canon } from '../data/canon';
import { interpolate, type Language } from '../i18n/translations';
import { allTranslations as translations } from '../i18n/all-strings';
import { COLLECTION_PATHS, LANGUAGES } from '../i18n/locales';
import { STATIC_PAGES, buildRobots, buildSitemap, type SitemapPage } from '../seo/sitemap';
import { buildFeed, feedPath } from '../seo/feed';
import { renderOgImage } from '../seo/og-image';
import { loadContent } from './load';
import { GENERATED_PREVIEW_LANGUAGES, generatedPreviewPath } from './preview';
import type { ContentEntry, MandateEntry } from './types';

/**
 * Files written after prerendering: sitemap.xml, robots.txt, RSS feeds and
 * link-preview images (the site-wide og-image.png, one per article and one per fixed page). Everything here
 * follows the same publication rules as the pages (see load.ts).
 */

const t = (language: Language, key: string, vars: Record<string, string> = {}) =>
  interpolate(translations[language][key] ?? key, { brand: canon.brand, ...vars });

const publishedLanguages = (entry: ContentEntry): Language[] => LANGUAGES.filter((l) => entry.versions[l]);

export function sitemapPages(entries: ContentEntry[], mandates: MandateEntry[] = []): SitemapPage[] {
  const hasItems = (listPath: string) =>
    listPath === '/mandates/' ? mandates.length > 0 : entries.some((e) => listPath === `/${e.collection}/`);
  const lists = COLLECTION_PATHS.filter(hasItems).map(
    (listPath): SitemapPage => ({ path: listPath, languages: LANGUAGES }),
  );
  const items = entries.map(
    (entry): SitemapPage => ({
      path: `/${entry.collection}/${entry.slug}/`,
      languages: publishedLanguages(entry),
      lastmod: entry.date,
    }),
  );
  const commodityPages = canon.commodities.map(
    (commodity): SitemapPage => ({ path: `/commodities/${commodity.id}/`, languages: LANGUAGES }),
  );
  const mandatePages = mandates.map(
    (mandate): SitemapPage => ({ path: `/mandates/${mandate.slug}/`, languages: LANGUAGES, lastmod: mandate.published }),
  );
  return [...STATIC_PAGES, ...commodityPages, ...lists, ...items, ...mandatePages];
}

const DOCUMENT_FILE = /\.(pdf|docx?|xlsx)$/i;

/** Stops the build if a document file made it into the output. */
export function assertNoDocumentFiles(outDir: string): void {
  const found: string[] = [];
  const scan = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(full);
      else if (DOCUMENT_FILE.test(entry.name)) found.push(path.relative(outDir, full));
    }
  };
  scan(outDir);
  if (found.length) {
    throw new Error(`Document files must not be published, found in dist/:\n${found.map((f) => `  - ${f}`).join('\n')}`);
  }
}

export async function writeContentOutputs(rootDir: string, outDir: string): Promise<void> {
  const { entries, mandates } = loadContent(rootDir);
  const write = (relative: string, data: string | Buffer) => {
    const file = path.join(outDir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
  };

  write('sitemap.xml', buildSitemap(sitemapPages(entries, mandates)));
  write('robots.txt', buildRobots());

  for (const language of LANGUAGES) {
    write(
      feedPath(language),
      buildFeed(language, entries, {
        title: t(language, 'feed.title'),
        description: t(language, 'feed.description'),
        categories: { insights: t(language, 'feed.insights'), news: t(language, 'feed.news'), procedures: '' },
      }),
    );
  }

  // The site-wide preview (pages without their own image).
  write(
    'og-image.png',
    await renderOgImage(
      rootDir,
      { eyebrow: t('en', 'footer.tagline'), title: t('en', 'hero.title'), brand: canon.brand, site: 'kpsglobal.id' },
      { width: 1200, height: 630 },
    ),
  );

  for (const entry of entries) {
    if (entry.cover) continue;
    for (const language of GENERATED_PREVIEW_LANGUAGES) {
      const version = entry.versions[language];
      if (!version) continue;
      const eyebrow = entry.line
        ? t(language, `line.${entry.line}`)
        : entry.kind
          ? t(language, `news.kind.${entry.kind}`)
          : entry.audience?.length
            ? entry.audience.map((a) => t(language, `procedures.audience.${a}`)).join(' · ')
            : entry.group
              ? t(language, `documents.group.${entry.group}`)
              : t(language, 'feed.news');
      const png = await renderOgImage(rootDir, {
        eyebrow,
        title: version.title,
        brand: canon.brand,
        site: 'kpsglobal.id',
      });
      write(generatedPreviewPath(entry.slug, language), png);
    }
  }
}

const PAGE_PREVIEW = /<meta[^>]*property="og:image" content="https:\/\/kpsglobal\.id(\/og\/page-[a-z0-9-]+\.png)"/;
const OG_TITLE = /<meta[^>]*property="og:title" content="([^"]*)"/;
const HTML_LANG = /<html[^>]*\slang="([a-z]+)"/;

const decodeEntities = (text: string) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * Preview images of fixed pages (home, services, commodities, lists…): every prerendered page whose
 * og:image points at /og/page-*.png gets that image, drawn from its own og:title.
 */
export async function writePagePreviews(rootDir: string, outDir: string): Promise<string[]> {
  const written = new Set<string>();
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
      const full = path.join(dir, item.name);
      return item.isDirectory() ? walk(full) : item.name.endsWith('.html') ? [full] : [];
    });
  for (const file of walk(outDir)) {
    const html = fs.readFileSync(file, 'utf8');
    const image = html.match(PAGE_PREVIEW)?.[1];
    if (!image || written.has(image)) continue;
    const language = (html.match(HTML_LANG)?.[1] ?? 'en') as Language;
    const lang = LANGUAGES.includes(language) ? language : 'en';
    const ogTitle = decodeEntities(html.match(OG_TITLE)?.[1] ?? canon.brand);
    const suffix = ` — ${canon.brand}`;
    const prefix = `${canon.brand} — `;
    // The home page title repeats the tagline; its preview carries the hero line instead.
    const title = image.startsWith('/og/page-home-')
      ? t(lang, 'hero.title')
      : ogTitle.endsWith(suffix)
      ? ogTitle.slice(0, -suffix.length)
      : ogTitle.startsWith(prefix)
        ? ogTitle.slice(prefix.length)
        : ogTitle;
    const png = await renderOgImage(rootDir, {
      eyebrow: t(lang, 'footer.tagline'),
      title,
      brand: canon.brand,
      site: 'kpsglobal.id',
    });
    const target = path.join(outDir, image);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, png);
    written.add(image);
  }
  return [...written];
}
