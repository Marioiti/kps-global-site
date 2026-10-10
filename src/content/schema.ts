import { z } from 'zod';
import { canon } from '../data/canon';
import { DOCUMENT_ACCESS, DOCUMENT_GROUPS, DOCUMENT_ISSUERS, DOCUMENT_STAGES } from './constants';

/**
 * Frontmatter schemas.
 *
 * en.md carries every field. ru.md and zh.md carry only what is translated
 * (title, description) plus their own draft/reviewed flags; shared fields
 * (date, line, commodity…) are read from en.md, so they cannot drift apart.
 */

export const COLLECTIONS = ['insights', 'news', 'procedures', 'documents'] as const;
export type Collection = (typeof COLLECTIONS)[number];

const COMMODITY_IDS = canon.commodities.map((c) => c.id);

const isoDate = z
  .string({ required_error: 'is required', invalid_type_error: 'expected a date in quotes, e.g. "2026-10-07"' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected an ISO date, YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'not a real calendar date');

const commodity = z.string().refine((id) => COMMODITY_IDS.includes(id), {
  message: `unknown commodity; use one of: ${COMMODITY_IDS.join(', ')}`,
});

/** A file in public/, referenced from the site root, e.g. /covers/offer-check.png */
const localImage = z
  .string()
  .regex(/^\/[\w\-/.]+\.(png|jpe?g)$/i, 'expected a PNG or JPG path in public/, starting with /');

export const INCOTERMS_2020 = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'] as const;

const incoterm = z.enum(INCOTERMS_2020, {
  errorMap: () => ({ message: `expected an Incoterms 2020 rule: ${INCOTERMS_2020.join(', ')}` }),
});

/** Version of a document or a procedure: 1.0, 1.1, 2.0… */
const version = z
  .string({ required_error: 'is required', invalid_type_error: 'expected a version in quotes, e.g. "1.0"' })
  .regex(/^\d+\.\d+$/, 'expected a version like "1.0"');

const contentRef = z
  .string()
  .regex(
    /^(insights|news|procedures|documents)\/[a-z0-9]+(-[a-z0-9]+)*$/,
    'expected "insights/<slug>", "news/<slug>", "procedures/<slug>" or "documents/<slug>"',
  );

const common = {
  title: z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
  description: z
    .string({ required_error: 'is required' })
    .trim()
    .min(1, 'is required')
    .max(160, 'must be 160 characters or fewer'),
  draft: z.boolean().default(false),
  reviewed: z.boolean().default(false),
};

export const insightSchema = z
  .object({
    ...common,
    date: isoDate,
    line: z.enum(['deals', 'operations'], { required_error: 'is required: deals or operations' }),
    commodity: z.array(commodity).default([]),
    linkedinUrl: z
      .string()
      .url('must be a full URL')
      .regex(/^https:\/\/(www\.)?linkedin\.com\//, 'must be a linkedin.com link')
      .optional(),
    cover: localImage.optional(),
  })
  .strict();

export const newsSchema = z
  .object({
    ...common,
    date: isoDate,
    kind: z.enum(['mandate', 'service', 'document', 'event'], {
      required_error: 'is required: mandate, service, document or event',
    }),
    related: z.array(contentRef).optional(),
    cover: localImage.optional(),
  })
  .strict();

const audience = z.enum(['buyer', 'seller', 'investor'], { required_error: 'is required: buyer, seller or investor' });

/** One step of a procedure: who acts, with which document, and what the other side receives. */
const procedureStep = z
  .object({
    title: z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
    actor: z.string({ required_error: 'is required: who acts' }).trim().min(1, 'is required: who acts'),
    document: z.string({ required_error: 'is required: which document' }).trim().min(1, 'is required'),
    receives: z
      .string({ required_error: 'is required: what the other side receives' })
      .trim()
      .min(1, 'is required'),
  })
  .strict();

const steps = z.array(procedureStep, { required_error: 'is required' }).min(1, 'needs at least one step');

export const procedureSchema = z
  .object({
    ...common,
    /** One audience or several: `buyer` or `[buyer, seller]`. */
    audience: z
      .union([audience, z.array(audience).min(1, 'needs at least one audience')], {
        errorMap: () => ({ message: 'expected buyer, seller, investor, or a list of them' }),
      })
      .transform((value) => (Array.isArray(value) ? [...new Set(value)] : [value])),
    /** Empty: applies to every commodity. */
    commodity: z.array(commodity).default([]),
    /** Supplier code only, e.g. S-01: never a name or a country. */
    supplier: z
      .string()
      .regex(/^S-\d{2}$/, 'expected a supplier code like S-01 (no name, no country)')
      .optional(),
    basis: incoterm.optional(),
    version,
    updated: isoDate,
    steps,
    cover: localImage.optional(),
  })
  .strict();

/** ru.md / zh.md: translated fields only. */
export const translationSchema = z.object({ ...common }).strict();
export const procedureTranslationSchema = z.object({ ...common, steps }).strict();

export type ProcedureStep = z.infer<typeof procedureStep>;

/**
 * content/documents/<slug>/{en,ru,zh}.md — the document library. A card describes a
 * document; the file itself never goes on the site (there is no `file` field).
 * `preview`: one-page materials shown online as watermarked images, file on request.
 */


const documentText = {
  title: z.string({ required_error: 'is required' }).trim().min(1, 'is required'),
  summary: z
    .string({ required_error: 'is required' })
    .trim()
    .min(1, 'is required')
    .max(220, 'must be 220 characters or fewer'),
  dealStep: z.string({ required_error: 'is required' }).trim().min(1, 'is required').max(120, 'must be 120 characters or fewer'),
  contents: z
    .array(z.string().trim().min(1, 'is required'), { required_error: 'is required' })
    .min(1, 'needs at least one section'),
  draft: z.boolean().default(false),
  reviewed: z.boolean().default(false),
};

export const documentSchema = z
  .object({
    ...documentText,
    group: z.enum(DOCUMENT_GROUPS, { errorMap: () => ({ message: `expected one of: ${DOCUMENT_GROUPS.join(', ')}` }) }),
    stage: z.enum(DOCUMENT_STAGES, { errorMap: () => ({ message: `expected one of: ${DOCUMENT_STAGES.join(', ')}` }) }),
    issuer: z.enum(DOCUMENT_ISSUERS, { errorMap: () => ({ message: `expected one of: ${DOCUMENT_ISSUERS.join(', ')}` }) }),
    version,
    date: isoDate,
    access: z.enum(DOCUMENT_ACCESS, { errorMap: () => ({ message: 'expected on-request or preview' }) }),
    previewPages: z.number().int().min(1, 'must be 1 or more').optional(),
  })
  .strict();

export const documentTranslationSchema = z.object(documentText).strict();

/**
 * content/commodities/<id>/{en,ru,zh}.md — one page per commodity, in one of two formats:
 * - full (default): the Markdown body describes the deal from the buyer's and its bank's
 *   side; checks, structure, document route and stalls are structured;
 * - short (`format: short`): a card of two paragraphs — the deal and who it is for, then
 *   what we check and how we structure it — followed by the origin and screening line.
 */
const text = z.string({ required_error: 'is required' }).trim().min(1, 'is required');
/** One row of a typical specification from a named standard. LNG rows carry no limit. */
const specRow = z.object({ parameter: text, limit: text.optional(), standard: text.optional() }).strict();
const commodityStructure = z.object({ basis: text, payment: text, inspection: text }).strict();

const commodityCommon = {
  title: text,
  description: text.pipe(z.string().max(160, 'must be 160 characters or fewer')),
  summary: text.pipe(z.string().max(220, 'must be 220 characters or fewer')),
  /** Where deals in this commodity usually break, for the top of the page (1–2 sentences). */
  breaks: text.pipe(z.string().max(280, 'must be 280 characters or fewer')),
  /** Grade or standard in one line, e.g. "LME Grade A cathode". */
  grade: text.pipe(z.string().max(60, 'must be 60 characters or fewer')).optional(),
  /** Typical basis in a few words, for the index card. */
  basisShort: text.pipe(z.string().max(60, 'must be 60 characters or fewer')),
  spec: z.array(specRow).optional(),
  /** A line under the specification: alternative standards, or where the values come from. */
  specNote: text.pipe(z.string().max(200, 'must be 200 characters or fewer')).optional(),
};

const commodityFullSchema = z
  .object({
    format: z.literal('full').default('full'),
    ...commodityCommon,
    checks: z.array(text).min(3, 'needs at least three checks'),
    structure: commodityStructure,
    route: z
      .array(z.object({ title: text, detail: text }).strict())
      .min(3, 'needs at least three steps'),
    stalls: z.array(text).min(2, 'needs at least two points'),
  })
  .strict();

const commodityShortSchema = z
  .object({
    format: z.literal('short'),
    ...commodityCommon,
    structure: commodityStructure.optional(),
    stalls: z.array(text).min(2, 'needs at least two points').optional(),
  })
  .strict();

/** Picks the schema by `format`, so errors name the fields of that format. */
export const commoditySchemaFor = (raw: unknown) =>
  (raw as { format?: unknown } | null)?.format === 'short' ? commodityShortSchema : commodityFullSchema;

export type CommodityFullPage = z.infer<typeof commodityFullSchema>;
export type CommodityShortPage = z.infer<typeof commodityShortSchema>;
export type CommodityPage = CommodityFullPage | CommodityShortPage;

/**
 * content/mandates/<id>/{en,ru,zh}.md — anonymised mandates. The schema is closed:
 * any other field stops the build. en.md carries every field; ru.md and zh.md carry
 * only a translated description (and their own draft flag). Mandate files have no body.
 */
const MANDATE_ID = /^KPS-M-\d{4}-\d{3}$/;
const ORIGIN_REGIONS = ['Gulf', 'Central Asia', 'Southeast Asia', 'Other'] as const;
const INSTRUMENTS = ['DLC', 'SBLC', 'DLC or SBLC'] as const;
const MANDATE_STATUSES = ['open', 'in-work', 'closed'] as const;

const mandateDescription = z
  .string({ required_error: 'is required' })
  .trim()
  .min(1, 'is required')
  .max(200, 'must be 200 characters or fewer');

export const mandateSchema = z
  .object({
    id: z.string({ required_error: 'is required' }).regex(MANDATE_ID, 'expected the format KPS-M-2026-001'),
    side: z.enum(['supply', 'demand'], { errorMap: () => ({ message: 'expected supply or demand' }) }),
    commodity,
    volume: z.string({ required_error: 'is required' }).trim().min(1, 'is required').max(80, 'must be 80 characters or fewer'),
    basis: z.enum(INCOTERMS_2020, {
      errorMap: () => ({ message: `expected an Incoterms 2020 rule: ${INCOTERMS_2020.join(', ')}` }),
    }),
    originRegion: z.enum(ORIGIN_REGIONS, {
      errorMap: () => ({ message: `expected a region, not a country: ${ORIGIN_REGIONS.join(', ')}` }),
    }),
    instrument: z.enum(INSTRUMENTS, { errorMap: () => ({ message: `expected one of: ${INSTRUMENTS.join(', ')}` }) }),
    status: z.enum(MANDATE_STATUSES, { errorMap: () => ({ message: 'expected open, in-work or closed' }) }),
    published: isoDate,
    validUntil: isoDate,
    draft: z.boolean().default(false),
    description: mandateDescription,
  })
  .strict()
  .refine((mandate) => mandate.validUntil >= mandate.published, {
    path: ['validUntil'],
    message: 'must not be earlier than published',
  });

export const mandateTranslationSchema = z
  .object({ description: mandateDescription, draft: z.boolean().default(false) })
  .strict();

export type MandateMeta = z.infer<typeof mandateSchema>;

/**
 * content/cases/<slug>/{en,ru,zh}.md — anonymised results. Frontmatter only: no names, no
 * prices; the route starts in a region. Sums of money are allowed in `metricValue` only, as
 * USD ("USD 480,000", "USD 10M+ / month"); load.ts checks every other field like a mandate.
 */
const CASE_ORIGIN_REGIONS = ['Gulf', 'Central Asia', 'Southeast Asia', 'Other'] as const;
const SERVICE_SLUGS = ['deal-structuring', 'compliance-kyc', 'fractional-coo'] as const;

const caseLine = (max: number) =>
  z.string({ required_error: 'is required' }).trim().min(1, 'is required').max(max, `must be ${max} characters or fewer`);

/** "Gulf → China": a region, an arrow, a country or a region. */
const caseRoute = z
  .string({ required_error: 'is required' })
  .trim()
  .max(60, 'must be 60 characters or fewer')
  .regex(/^[^→]+ → [^→]+$/, 'expected "<region> → <country or region>"');

const caseText = {
  /** Shown as the eyebrow; free text, e.g. "Crude oil". */
  commodity: caseLine(30),
  route: caseRoute,
  /** The result, as the card title. */
  title: caseLine(120),
  problem: caseLine(200),
  action: caseLine(200),
  result: caseLine(200),
  /** Optional headline figure, short and large: "7 days", "USD 480,000". The only field with sums (USD). */
  metricValue: caseLine(24).optional(),
  /** Small caption under the figure: "red flag before any payment". */
  metricLabel: caseLine(80).optional(),
  /** One or two sentences for the home page: what happened and what we did. */
  summary: caseLine(200).optional(),
  draft: z.boolean().default(false),
};

export const caseSchema = z
  .object({
    ...caseText,
    route: caseRoute.refine(
      (route) => (CASE_ORIGIN_REGIONS as readonly string[]).includes(route.split(' → ')[0]),
      `the route starts in a region: ${CASE_ORIGIN_REGIONS.join(', ')}`,
    ),
    /** Service pages that show this case. */
    services: z.array(z.enum(SERVICE_SLUGS, { errorMap: () => ({ message: `expected one of: ${SERVICE_SLUGS.join(', ')}` }) })).default([]),
    /** The stamp beside the case: stop (止) for a stopped deal, join (合) for a deal put together. */
    stamp: z.enum(['stop', 'join'], { errorMap: () => ({ message: 'expected stop or join' }) }).optional(),
    /** Sort key: 1 comes first; the home page shows the first three. */
    order: z.number({ required_error: 'is required', invalid_type_error: 'expected a number' }).int().min(1),
    year: z
      .number({ invalid_type_error: 'expected a year, e.g. 2025' })
      .int()
      .min(Number(canon.practiceSince), `must be ${canon.practiceSince} or later`)
      .max(2100)
      .optional(),
  })
  .strict();

/** Translations: the same texts; commodity and route fall back to en.md when left out. */
export const caseTranslationSchema = z
  .object({ ...caseText, commodity: caseText.commodity.optional(), route: caseRoute.optional() })
  .strict();

export type InsightMeta = z.infer<typeof insightSchema>;
export type NewsMeta = z.infer<typeof newsSchema>;
export type TranslationMeta = z.infer<typeof translationSchema>;

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
