declare module 'virtual:content' {
  import type { CaseEntry, ContentEntry, MandateEntry } from '@/content/types';
  import type { Language } from '@/i18n/translations';
  export const entries: ContentEntry[];
  /** Published mandates, open and in work first. */
  export const mandates: MandateEntry[];
  /** Published cases, by `order`. */
  export const cases: CaseEntry[];
  /** Commodity id → language → card data. */
  export const commodities: Record<string, Record<Language, { title: string; description: string; summary: string; grade?: string; basisShort: string }>>;
  /** Keyed "<collection>/<slug>/<lang>" or "commodities/<id>/<lang>". */
  export const bodies: Record<string, () => Promise<{ default: unknown }>>;
}
