import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { ZodError, ZodTypeAny } from 'zod';
import type { Language } from '../i18n/translations';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../i18n/locales';
import {
  COLLECTIONS,
  SLUG_PATTERN,
  commoditySchemaFor,
  documentSchema,
  documentTranslationSchema,
  mandateSchema,
  mandateTranslationSchema,
  insightSchema,
  newsSchema,
  procedureSchema,
  procedureTranslationSchema,
  translationSchema,
  type Collection,
  type ProcedureStep,
} from './schema';
import { canon } from '../data/canon';
import { interpolate } from '../i18n/translations';
import { allTranslations as translations } from '../i18n/all-strings';
import { localizePath } from '../i18n/locales';
import { checkBlockedNames, checkMandateText, readBlockedNames } from './mandate-text';
import { readingMinutes, renderMarkdown } from './markdown';
import type { CommodityContent, ContentBody, ContentEntry, ContentVersion, MandateEntry } from './types';

/**
 * Reads content/<collection>/<slug>/{en,ru,zh}.md in Node (build, dev server,
 * `npm run content:check`). Every problem is collected and reported together
 * as "file › field: reason"; any problem stops the build.
 *
 * Publication rules:
 * - en.md is required; `draft: true` in en.md keeps the whole item off the site.
 * - ru.md is published unless it is a draft.
 * - zh.md is published only with `reviewed: true` (and not a draft).
 * A language without a published version shows the English text (see index.ts).
 */

export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Content check failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ContentError';
  }
}

export interface LoadedContent {
  /** Published items, newest first, with the rendered body per published language. */
  entries: (ContentEntry & { bodies: Partial<Record<Language, ContentBody>> })[];
  /** Published mandates: open and in work first, closed last; newest first within each group. */
  mandates: MandateEntry[];
  /** Commodity pages: every canon commodity in every language. */
  commodities: Record<string, Record<Language, CommodityContent>>;
  /** What is kept off the site and why, e.g. "insights/<slug>: draft" or "insights/<slug>/zh: not reviewed". */
  unpublished: string[];
  files: string[];
}

const SCHEMAS: Record<Collection, ZodTypeAny> = {
  insights: insightSchema,
  news: newsSchema,
  procedures: procedureSchema,
  documents: documentSchema,
};
const TRANSLATION_SCHEMAS: Record<Collection, ZodTypeAny> = {
  insights: translationSchema,
  news: translationSchema,
  procedures: procedureTranslationSchema,
  documents: documentTranslationSchema,
};

/** Watermarked preview pages of a document, in page order (public/docs-preview/<slug>/page-N.webp). */
const previewImages = (publicDir: string, slug: string): string[] => {
  const dir = path.join(publicDir, 'docs-preview', slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /^page-\d+\.webp$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]))
    .map((name) => `/docs-preview/${slug}/${name}`);
};

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const formatZodError = (file: string, error: ZodError): string[] =>
  error.issues.map((issue) => {
    const field = issue.path.join('.') || '(frontmatter)';
    const reason =
      issue.code === 'unrecognized_keys'
        ? `unknown field(s) ${issue.keys.map((k) => `"${k}"`).join(', ')}${
            file.endsWith('/en.md') ? '' : ' — shared fields belong in en.md; translations carry title, description, draft, reviewed (and steps for procedures)'
          }`
        : issue.message;
    return `${file} › ${field}: ${reason}`;
  });

export interface LoadOptions {
  /** ISO date used to close expired mandates. Defaults to today (UTC). */
  today?: string;
}

export function loadContent(rootDir: string, options: LoadOptions = {}): LoadedContent {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const contentDir = path.join(rootDir, 'content');
  const publicDir = path.join(rootDir, 'public');
  const problems: string[] = [];
  const unpublished: string[] = [];
  const files: string[] = [];
  const entries: LoadedContent['entries'] = [];
  const seenSlugs = new Map<string, Collection>();

  for (const collection of COLLECTIONS) {
    const collectionDir = path.join(contentDir, collection);
    if (!fs.existsSync(collectionDir)) continue;

    for (const slug of fs.readdirSync(collectionDir).sort()) {
      const itemDir = path.join(collectionDir, slug);
      // Folders starting with "_" (e.g. _archive) are never published.
      if (slug.startsWith('_') || !fs.statSync(itemDir).isDirectory()) continue;
      const rel = (name: string) => `content/${collection}/${slug}/${name}`;

      if (!SLUG_PATTERN.test(slug)) {
        problems.push(`content/${collection}/${slug} › folder name: use lowercase latin letters, digits and hyphens`);
        continue;
      }
      if (seenSlugs.has(slug)) {
        problems.push(`content/${collection}/${slug} › folder name: slug already used in content/${seenSlugs.get(slug)} (preview images are named by slug)`);
      }
      seenSlugs.set(slug, collection);

      const stray = fs.readdirSync(itemDir).filter((f) => f.endsWith('.md') && !LANGUAGES.some((l) => f === `${l}.md`));
      for (const f of stray) problems.push(`${rel(f)} › file name: expected en.md, ru.md or zh.md`);

      if (!fs.existsSync(path.join(itemDir, 'en.md'))) {
        problems.push(`${rel('en.md')} › file: the English version is required`);
        continue;
      }

      let shared: Record<string, unknown> | null = null;
      const versions: Partial<Record<Language, ContentVersion>> = {};
      const bodies: Partial<Record<Language, ContentBody>> = {};
      const held: string[] = [];

      for (const language of LANGUAGES) {
        const file = rel(`${language}.md`);
        const fullPath = path.join(itemDir, `${language}.md`);
        if (!fs.existsSync(fullPath)) continue;
        files.push(file);

        const source = fs.readFileSync(fullPath, 'utf8');
        const match = source.match(FRONTMATTER);
        if (!match) {
          problems.push(`${file} › frontmatter: the file must start with a --- block`);
          continue;
        }

        let raw: unknown;
        try {
          raw = parseYaml(match[1]) ?? {};
        } catch (error) {
          problems.push(`${file} › frontmatter: invalid YAML (${(error as Error).message.split('\n')[0]})`);
          continue;
        }

        const body = renderMarkdown(match[2]);
        problems.push(...body.problems.map((p) => `${file} › ${p}`));
        if (!match[2].trim()) problems.push(`${file} › body: the text is empty`);

        const schema = language === DEFAULT_LANGUAGE ? SCHEMAS[collection] : TRANSLATION_SCHEMAS[collection];
        const parsed = schema.safeParse(raw);
        if (!parsed.success) {
          problems.push(...formatZodError(file, parsed.error));
          continue;
        }
        const meta = parsed.data as { title: string; description?: string; summary?: string; draft: boolean; reviewed: boolean } & Record<string, unknown>;
        if (language === DEFAULT_LANGUAGE) shared = meta;
        const steps = meta.steps as ProcedureStep[] | undefined;
        const sharedSteps = shared?.steps as ProcedureStep[] | undefined;
        if (steps && sharedSteps && steps.length !== sharedSteps.length) {
          problems.push(`${file} › steps: ${steps.length} step(s), en.md has ${sharedSteps.length}; every language needs the same steps`);
        }

        const published = !meta.draft && (language !== 'zh' || meta.reviewed);
        if (published && /\bTODO\b/.test(source)) {
          problems.push(`${file} › text: contains TODO; fill it in or keep the file as draft: true`);
        }
        if (!published) {
          held.push(`${collection}/${slug}/${language}: ${meta.draft ? 'draft' : 'not reviewed (zh needs reviewed: true)'}`);
          continue;
        }
        const stepsText = (steps ?? []).map((step) => Object.values(step).join(' ')).join(' ');
        versions[language] = {
          language,
          title: meta.title,
          description: (meta.description ?? meta.summary) as string,
          readingMinutes: readingMinutes(`${body.text} ${stepsText}`),
        };
        bodies[language] = {
          html: body.html,
          ...(steps && { steps }),
          ...(collection === 'documents' && {
            document: { dealStep: meta.dealStep as string, contents: meta.contents as string[] },
          }),
        };
      }

      if (!shared) continue;
      if (shared.draft) {
        unpublished.push(`${collection}/${slug}: draft (en.md), not published in any language`);
        continue;
      }
      unpublished.push(...held);
      if (!versions.en) continue;

      const cover = shared.cover as string | undefined;
      if (cover && !fs.existsSync(path.join(publicDir, cover))) {
        problems.push(`${rel('en.md')} › cover: file public${cover} does not exist`);
      }

      let previews: string[] | undefined;
      if (collection === 'documents') {
        const found = previewImages(publicDir, slug);
        if (shared.access === 'on-request' && found.length) {
          problems.push(`content/documents/${slug} › access: on-request documents have no online preview; remove public/docs-preview/${slug}/`);
        }
        const limit = shared.previewPages as number | undefined;
        previews = shared.access === 'preview' ? found.slice(0, limit ?? found.length) : [];
      }

      entries.push({
        collection,
        slug,
        date: (shared.date ?? shared.updated) as string,
        line: shared.line as ContentEntry['line'],
        commodity: (shared.commodity as string[] | undefined) ?? [],
        linkedinUrl: shared.linkedinUrl as string | undefined,
        cover,
        kind: shared.kind as ContentEntry['kind'],
        related: (shared.related as string[] | undefined) ?? [],
        audience: shared.audience as ContentEntry['audience'],
        supplier: shared.supplier as string | undefined,
        basis: shared.basis as string | undefined,
        version: shared.version as string | undefined,
        group: shared.group as ContentEntry['group'],
        issuer: shared.issuer as ContentEntry['issuer'],
        access: shared.access as ContentEntry['access'],
        previewImages: previews,
        versions,
        bodies,
      });
    }
  }

  // Cross-references: news `related` must point at existing items.
  const known = new Set<string>();
  for (const collection of COLLECTIONS) {
    const dir = path.join(contentDir, collection);
    if (fs.existsSync(dir)) for (const slug of fs.readdirSync(dir)) known.add(`${collection}/${slug}`);
  }
  for (const entry of entries) {
    for (const ref of entry.related) {
      if (!known.has(ref)) problems.push(`content/${entry.collection}/${entry.slug}/en.md › related: "${ref}" does not exist`);
    }
  }

  checkContentTree(rootDir, problems);
  const commodities = loadCommodities(contentDir, problems, files);
  const mandates = loadMandates(rootDir, problems, files, unpublished, today);
  for (const mandate of mandates) {
    if (mandate.status !== 'open') continue;
    const news = mandateNews(mandate);
    if (seenSlugs.has(news.slug)) {
      problems.push(`content/mandates/${mandate.slug} › id: the generated news item "news/${news.slug}" clashes with an existing slug`);
    }
    entries.push(news);
  }

  if (problems.length) throw new ContentError(problems);

  entries.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return { entries, mandates, commodities, unpublished, files };
}

/** Fields that never belong in content, at any depth of the frontmatter. */
const BANNED_FIELDS = /^(file|origin|producer)$/i;
/** Document files that never go on the site; sources live in _internal/documents/. */
const BANNED_EXTENSIONS = /\.(pdf|docx?|xlsx)$/i;

const walk = (dir: string, match: (name: string) => boolean): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full, match) : match(entry.name) ? [full] : [];
      })
    : [];

const bannedKeys = (value: unknown, trail: string[] = []): string[] => {
  if (Array.isArray(value)) return value.flatMap((item, i) => bannedKeys(item, [...trail, String(i)]));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, inner]) => [
    ...(BANNED_FIELDS.test(key) ? [[...trail, key].join('.')] : []),
    ...bannedKeys(inner, [...trail, key]),
  ]);
};

let warnedNoBlockedList = false;

/**
 * Checks across the whole content/ tree, drafts and archives included (the repository is
 * public), plus public/: banned fields, blocked counterparty names, document files.
 */
export function checkContentTree(rootDir: string, problems: string[]): void {
  const blockedNames = readBlockedNames(rootDir);
  if (!blockedNames && !warnedNoBlockedList) {
    warnedNoBlockedList = true;
    console.warn('content: _internal/blocked-names.json not found, the blocked-names check is skipped');
  }
  for (const full of walk(path.join(rootDir, 'content'), (name) => name.endsWith('.md'))) {
    const file = path.relative(rootDir, full).split(path.sep).join('/');
    const source = fs.readFileSync(full, 'utf8');
    const match = source.match(FRONTMATTER);
    if (match) {
      try {
        for (const key of bannedKeys(parseYaml(match[1]))) {
          problems.push(`${file} › ${key}: the field is not allowed in content`);
        }
      } catch {
        // Invalid YAML is reported by the collection that owns the file.
      }
    }
    if (blockedNames?.length) problems.push(...checkBlockedNames(file, source, blockedNames));
  }
  for (const full of walk(path.join(rootDir, 'public'), (name) => BANNED_EXTENSIONS.test(name))) {
    const file = path.relative(rootDir, full).split(path.sep).join('/');
    problems.push(`${file} › file: document files are not published; keep sources in _internal/documents/`);
  }
}

const STATUS_ORDER: Record<MandateEntry['status'], number> = { open: 0, 'in-work': 0, closed: 1 };

/** content/mandates/<id>/{en,ru,zh}.md: strict schema, text checks, effective status. */
function loadMandates(
  rootDir: string,
  problems: string[],
  files: string[],
  unpublished: string[],
  today: string,
): MandateEntry[] {
  const dir = path.join(rootDir, 'content', 'mandates');
  if (!fs.existsSync(dir)) return [];
  const mandates: MandateEntry[] = [];

  for (const slug of fs.readdirSync(dir).sort()) {
    if (!fs.statSync(path.join(dir, slug)).isDirectory()) continue;
    const rel = (name: string) => `content/mandates/${slug}/${name}`;
    if (!/^kps-m-\d{4}-\d{3}$/.test(slug)) {
      problems.push(`content/mandates/${slug} › folder name: expected the mandate id in lowercase, e.g. kps-m-2026-001`);
      continue;
    }
    if (!fs.existsSync(path.join(dir, slug, 'en.md'))) {
      problems.push(`${rel('en.md')} › file: the English version is required`);
      continue;
    }

    let shared: ReturnType<typeof mandateSchema.parse> | null = null;
    const descriptions: Partial<Record<Language, string>> = {};
    for (const language of LANGUAGES) {
      const file = rel(`${language}.md`);
      const fullPath = path.join(dir, slug, `${language}.md`);
      if (!fs.existsSync(fullPath)) continue;
      files.push(file);
      const source = fs.readFileSync(fullPath, 'utf8');
      problems.push(...checkMandateText(file, source));

      const match = source.match(FRONTMATTER);
      if (!match) {
        problems.push(`${file} › frontmatter: the file must start with a --- block`);
        continue;
      }
      if (match[2].trim()) problems.push(`${file} › body: a mandate has no text outside the frontmatter`);
      let raw: unknown;
      try {
        raw = parseYaml(match[1]) ?? {};
      } catch (error) {
        problems.push(`${file} › frontmatter: invalid YAML (${(error as Error).message.split('\n')[0]})`);
        continue;
      }

      if (language === DEFAULT_LANGUAGE) {
        const parsed = mandateSchema.safeParse(raw);
        if (!parsed.success) {
          problems.push(...formatZodError(file, parsed.error));
          continue;
        }
        shared = parsed.data;
        if (shared.id.toLowerCase() !== slug) {
          problems.push(`${file} › id: "${shared.id}" does not match the folder name ${slug}`);
        }
        if (!shared.draft) descriptions.en = shared.description;
      } else {
        const parsed = mandateTranslationSchema.safeParse(raw);
        if (!parsed.success) {
          problems.push(...formatZodError(file, parsed.error));
          continue;
        }
        if (!parsed.data.draft) descriptions[language] = parsed.data.description;
      }
    }

    if (!shared) continue;
    if (shared.draft) {
      unpublished.push(`mandates/${slug}: draft (en.md), not published`);
      continue;
    }
    mandates.push({
      id: shared.id,
      slug,
      side: shared.side,
      commodity: shared.commodity,
      volume: shared.volume,
      basis: shared.basis,
      originRegion: shared.originRegion,
      instrument: shared.instrument,
      status: shared.validUntil < today ? 'closed' : shared.status,
      published: shared.published,
      validUntil: shared.validUntil,
      descriptions,
    });
  }

  return mandates.sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.published.localeCompare(a.published),
  );
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The news item that announces an open mandate, built from its data (kind: mandate). */
function mandateNews(mandate: MandateEntry): LoadedContent['entries'][number] {
  const commodityNames = canon.commodities.find((c) => c.id === mandate.commodity)!.name;
  const versions: Partial<Record<Language, ContentVersion>> = {};
  const bodies: Partial<Record<Language, ContentBody>> = {};
  for (const language of LANGUAGES) {
    const description = mandate.descriptions[language];
    if (!description) continue;
    const strings = translations[language];
    const vars = {
      id: mandate.id,
      side: strings[`mandate.side.${mandate.side}`],
      commodity: commodityNames[language],
    };
    versions[language] = {
      language,
      title: interpolate(strings['mandate.news.title'], vars),
      description,
      readingMinutes: 1,
    };
    const href = localizePath(`/mandates/${mandate.slug}/`, language);
    bodies[language] = {
      html: `<p>${escapeHtml(description)}</p>\n<p><a href="${href}">${escapeHtml(strings['mandate.news.link'])}</a></p>\n`,
    };
  }
  return {
    collection: 'news',
    slug: `mandate-${mandate.slug}`,
    date: mandate.published,
    kind: 'mandate',
    commodity: [mandate.commodity],
    related: [],
    versions,
    bodies,
  };
}

/** content/commodities/<id>/{en,ru,zh}.md for every commodity in the canon. */
function loadCommodities(contentDir: string, problems: string[], files: string[]): LoadedContent['commodities'] {
  const dir = path.join(contentDir, 'commodities');
  const ids = canon.commodities.map((c) => c.id);
  const pages: LoadedContent['commodities'] = {};

  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir)) {
      if (fs.statSync(path.join(dir, name)).isDirectory() && !ids.includes(name)) {
        problems.push(`content/commodities/${name} › folder name: not a commodity; use one of: ${ids.join(', ')}`);
      }
    }
  }

  for (const id of ids) {
    const languages = {} as Record<Language, CommodityContent>;
    for (const language of LANGUAGES) {
      const file = `content/commodities/${id}/${language}.md`;
      const fullPath = path.join(dir, id, `${language}.md`);
      if (!fs.existsSync(fullPath)) {
        problems.push(`${file} › file: every commodity needs en.md, ru.md and zh.md`);
        continue;
      }
      files.push(file);
      const match = fs.readFileSync(fullPath, 'utf8').match(FRONTMATTER);
      if (!match) {
        problems.push(`${file} › frontmatter: the file must start with a --- block`);
        continue;
      }
      let raw: unknown;
      try {
        raw = parseYaml(match[1]) ?? {};
      } catch (error) {
        problems.push(`${file} › frontmatter: invalid YAML (${(error as Error).message.split('\n')[0]})`);
        continue;
      }
      const body = renderMarkdown(match[2]);
      problems.push(...body.problems.map((p) => `${file} › ${p}`));
      if (!match[2].trim()) problems.push(`${file} › body: the text is empty`);
      const paragraphs = match[2].split(/\n\s*\n/).filter((block) => block.trim()).length;
      if ((raw as { format?: unknown })?.format === 'short' && paragraphs > 2) {
        problems.push(`${file} › body: a short page has two paragraphs (the origin and screening line is added by the site), found ${paragraphs}`);
      }
      const parsed = commoditySchemaFor(raw).safeParse(raw);
      if (!parsed.success) {
        problems.push(...formatZodError(file, parsed.error));
        continue;
      }
      languages[language] = { ...parsed.data, id, language, html: body.html };
    }
    pages[id] = languages;
  }
  return pages;
}
