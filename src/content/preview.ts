import type { Language } from '../i18n/translations';
import type { ContentEntry } from './types';

/**
 * Link-preview image of an item: its `cover`, else the image generated at build
 * (dist/og/<slug>-<lang>.png).
 */
export const OG_SIZE = { width: 1200, height: 627 };
export const GENERATED_PREVIEW_LANGUAGES: readonly Language[] = ['en', 'ru', 'zh'];

export const generatedPreviewPath = (slug: string, language: Language): string => `/og/${slug}-${language}.png`;

/** Preview of a fixed page, generated at build from its og:title: `/services/` → /og/page-services-en.png. */
export const pagePreviewPath = (path: string, language: Language): string =>
  `/og/page-${path.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'home'}-${language}.png`;

export function previewImage(
  entry: Pick<ContentEntry, 'slug' | 'cover'>,
  shownLanguage: Language,
): { path: string; size: typeof OG_SIZE | null } | null {
  if (entry.cover) return { path: entry.cover, size: null };
  if (GENERATED_PREVIEW_LANGUAGES.includes(shownLanguage)) {
    return { path: generatedPreviewPath(entry.slug, shownLanguage), size: OG_SIZE };
  }
  return null;
}
