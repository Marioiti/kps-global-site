import type { Language } from '../i18n/translations';
import type { Collection, CommodityPage, ProcedureStep } from './schema';

/** A published language version of an item (body HTML is loaded separately). */
export interface ContentVersion {
  language: Language;
  title: string;
  description: string;
  readingMinutes: number;
}

/** A published insight or news item. Shared fields come from en.md. */
export interface ContentEntry {
  collection: Collection;
  slug: string;
  /** ISO date, YYYY-MM-DD: publication date; for procedures, the last update. */
  date: string;
  /** Insights only. */
  line?: 'deals' | 'operations';
  commodity: string[];
  linkedinUrl?: string;
  cover?: string;
  /** News only. */
  kind?: 'mandate' | 'service' | 'document' | 'event';
  /** News only: "insights/<slug>" or "news/<slug>". */
  related: string[];
  /** Procedures only. Their `commodity` list is empty when they apply to every commodity. */
  audience?: ('buyer' | 'seller' | 'investor')[];
  /** Procedures: supplier code (S-01) and delivery basis, when the procedure is supplier-specific. */
  supplier?: string;
  basis?: string;
  /** Procedures and documents. */
  version?: string;
  /** Documents only. */
  group?: 'counterparty-pack' | 'standard-forms' | 'engagement' | 'services' | 'checklists';
  issuer?: 'kps' | 'counterparty' | 'supplier';
  access?: 'on-request' | 'preview';
  /** Documents with `preview` access: watermarked page images in public/docs-preview/<slug>/. */
  previewImages?: string[];
  /** Published versions only: zh needs `reviewed: true`. en is always present. */
  versions: Partial<Record<Language, ContentVersion>>;
}

/** Loaded on the page itself, not part of the index. */
export interface ContentBody {
  html: string;
  /** Procedures only. */
  steps?: ProcedureStep[];
  /** Documents only: the deal step it belongs to and its sections. */
  document?: { dealStep: string; contents: string[] };
}

/** A commodity page in one language (full or short format). */
export type CommodityContent = CommodityPage & {
  id: string;
  language: Language;
  /** The Markdown body. */
  html: string;
};

export type { ProcedureStep };

/** A published mandate. `status` is effective: past `validUntil` it is `closed`. */
export interface MandateEntry {
  /** KPS-M-2026-001 */
  id: string;
  /** Lowercase id, used in the address: /mandates/kps-m-2026-001/ */
  slug: string;
  side: 'supply' | 'demand';
  commodity: string;
  volume: string;
  basis: string;
  originRegion: 'Gulf' | 'Central Asia' | 'Southeast Asia' | 'Other';
  instrument: 'DLC' | 'SBLC' | 'DLC or SBLC';
  status: 'open' | 'in-work' | 'closed';
  /** ISO dates. */
  published: string;
  validUntil: string;
  /** Short description per language; en is always present. */
  descriptions: Partial<Record<Language, string>>;
}
