import { entries, bodies, commodities, mandates } from 'virtual:content';
import type { Language } from '@/i18n/translations';
import { DEFAULT_LANGUAGE, localizePath } from '@/i18n/locales';
import type { Collection } from './schema';
import type { CommodityContent, ContentBody, ContentEntry, ContentVersion, MandateEntry, ProcedureStep } from './types';

export type { CommodityContent, ContentBody, ContentEntry, ContentVersion, Collection, MandateEntry, ProcedureStep };

/** Published mandates: open and in work first, closed last. */
export const getMandates = (): MandateEntry[] => mandates;

export const findMandate = (slug: string): MandateEntry | undefined => mandates.find((m) => m.slug === slug);

/** Open mandates, optionally for one commodity. */
export const openMandates = (commodity?: string): MandateEntry[] =>
  mandates.filter((m) => m.status === 'open' && (!commodity || m.commodity === commodity));

/** The mandate's description in `language`, or the English one. */
export const mandateDescription = (mandate: MandateEntry, language: Language): string =>
  mandate.descriptions[language] ?? (mandate.descriptions[DEFAULT_LANGUAGE] as string);

/** Sections that exist only once something is published in them. */
const SECTIONS_WITH_ITEMS: Record<string, () => boolean> = {
  '/insights/': () => entries.some((entry) => entry.collection === 'insights'),
  '/news/': () => entries.some((entry) => entry.collection === 'news'),
  '/procedures/': () => entries.some((entry) => entry.collection === 'procedures'),
  '/mandates/': () => mandates.length > 0,
};

/**
 * Whether links to a section are shown (menu, footer, cross-links). An empty section
 * stays out of navigation and the sitemap until its first item is published.
 */
export const sectionHasItems = (path: string): boolean => SECTIONS_WITH_ITEMS[path]?.() ?? true;

/** Published items of a collection, newest first. */
export const getCollection = (collection: Collection): ContentEntry[] =>
  entries.filter((entry) => entry.collection === collection);

export const findEntry = (collection: Collection, slug: string): ContentEntry | undefined =>
  entries.find((entry) => entry.collection === collection && entry.slug === slug);

/** Languages with their own published text. */
export const publishedLanguages = (entry: ContentEntry): Language[] =>
  (Object.keys(entry.versions) as Language[]).filter((language) => entry.versions[language]);

/**
 * The version shown on a page in `language`: its own text when published,
 * otherwise English under that language's interface.
 */
export const displayVersion = (entry: ContentEntry, language: Language): ContentVersion =>
  entry.versions[language] ?? (entry.versions[DEFAULT_LANGUAGE] as ContentVersion);

/** Base (English) path of an item, e.g. /insights/<slug>/ */
export const entryPath = (entry: Pick<ContentEntry, 'collection' | 'slug'>): string =>
  `/${entry.collection}/${entry.slug}/`;

export const entryUrl = (entry: ContentEntry, language: Language): string =>
  localizePath(entryPath(entry), language);

export async function loadBody(entry: ContentEntry, language: Language): Promise<ContentBody | null> {
  const { language: shown } = displayVersion(entry, language);
  const load = bodies[`${entry.collection}/${entry.slug}/${shown}`];
  return load ? ((await load()).default as ContentBody) : null;
}

/** Card data of a commodity page (title, description, summary). */
export const commodityCard = (id: string, language: Language) => commodities[id]?.[language];

export async function loadCommodity(id: string, language: Language): Promise<CommodityContent | null> {
  const load = bodies[`commodities/${id}/${language}`];
  return load ? ((await load()).default as CommodityContent) : null;
}

/**
 * Published items about a commodity, newest first. Procedures without a
 * commodity list apply to every commodity.
 */
export const relatedToCommodity = (collection: Collection, commodity: string): ContentEntry[] =>
  getCollection(collection).filter(
    (entry) =>
      entry.commodity.includes(commodity) || (collection === 'procedures' && entry.commodity.length === 0),
  );

/** Other insights sharing a commodity, newest first. */
export const relatedByCommodity = (entry: ContentEntry, limit = 3): ContentEntry[] =>
  getCollection('insights')
    .filter((other) => other.slug !== entry.slug && other.commodity.some((c) => entry.commodity.includes(c)))
    .slice(0, limit);

/** Items listed in `related` ("insights/<slug>"), when published. */
export const resolveRelated = (entry: ContentEntry): ContentEntry[] =>
  entry.related
    .map((ref) => {
      const [collection, slug] = ref.split('/') as [Collection, string];
      return findEntry(collection, slug);
    })
    .filter((e): e is ContentEntry => Boolean(e));

/** Slugs for getStaticPaths. */
export const staticPaths = (collection: Collection): string[] =>
  getCollection(collection).map((entry) => `${collection}/${entry.slug}`);

/** Published documents with the given slugs, in that order. */
export const documentsBySlugs = (slugs: string[]): ContentEntry[] =>
  slugs.map((slug) => findEntry('documents', slug)).filter((e): e is ContentEntry => Boolean(e));

/** Published documents of the given groups. */
export const documentsByGroups = (groups: NonNullable<ContentEntry['group']>[]): ContentEntry[] =>
  getCollection('documents').filter((entry) => entry.group && groups.includes(entry.group));
