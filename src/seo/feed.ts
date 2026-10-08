import type { Language } from '../i18n/translations';
import { absoluteUrl, localizePath } from '../i18n/locales';
import type { ContentEntry } from '../content/types';

/** RSS 2.0 per language: insights and news that have their own text in that language. */

/** Procedures are reference pages, not publications: they stay out of the feed. */
const FEED_COLLECTIONS: ContentEntry['collection'][] = ['insights', 'news'];

const RSS_LANGUAGE: Record<Language, string> = { en: 'en', ru: 'ru', zh: 'zh-CN' };

const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RFC 822 date at midnight UTC. */
const rfc822 = (isoDate: string): string => new Date(`${isoDate}T00:00:00Z`).toUTCString();

export const feedPath = (language: Language): string => localizePath('/feed.xml', language);

export interface FeedStrings {
  title: string;
  description: string;
  categories: Record<string, string>;
}

export function buildFeed(language: Language, entries: ContentEntry[], strings: FeedStrings): string {
  const listed = entries.filter((entry) => FEED_COLLECTIONS.includes(entry.collection) && entry.versions[language]);
  const items = listed
    .map((entry) => {
      const version = entry.versions[language]!;
      const url = absoluteUrl(localizePath(`/${entry.collection}/${entry.slug}/`, language));
      return [
        '    <item>',
        `      <title>${escapeXml(version.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(entry.date)}</pubDate>`,
        `      <category>${escapeXml(strings.categories[entry.collection])}</category>`,
        `      <description>${escapeXml(version.description)}</description>`,
        '    </item>',
      ].join('\n');
    });

  const latest = listed[0]?.date;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(strings.title)}</title>`,
    `    <link>${absoluteUrl(localizePath('/', language))}</link>`,
    `    <description>${escapeXml(strings.description)}</description>`,
    `    <language>${RSS_LANGUAGE[language]}</language>`,
    ...(latest ? [`    <lastBuildDate>${rfc822(latest)}</lastBuildDate>`] : []),
    `    <atom:link href="${absoluteUrl(feedPath(language))}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
