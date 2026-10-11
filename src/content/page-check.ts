import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks of the built pages that keep search engines happy: every indexable page has one
 * canonical address, a title (at most 60 characters) and a description (at most 155) no other
 * indexable page uses, a BreadcrumbList on every page but the home page, JSON-LD that parses,
 * one content per @id across the site, prices only from the canon, and sitemap.xml lists
 * exactly the indexable pages.
 */

export interface PageCheckOptions {
  /** Allowed minimum prices in structured data, e.g. [1000, 3500, 500] (USD). */
  prices?: number[];
}

/** Every node with a type, nested ones included. */
const nodes = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>;
    return [...(node['@type'] ? [node] : []), ...Object.values(node).flatMap(nodes)];
  }
  return [];
};

const SITE = 'https://kpsglobal.id';
const TITLE = /<title[^>]*>([^<]*)<\/title>/;
const DESCRIPTION = /<meta[^>]*name="description"[^>]*content="([^"]*)"/;
const CANONICAL = /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g;
const ROBOTS = /<meta[^>]*name="robots"[^>]*content="([^"]*)"/;
const JSON_LD = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
const SITEMAP_LOC = /<loc>([^<]+)<\/loc>/g;
/** The home page in each language: the only pages without breadcrumbs. */
const HOMES = new Set(['', 'ru', 'zh']);

const pagesIn = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return pagesIn(full);
    return d.name === 'index.html' ? [full] : [];
  });

const unescape = (value: string) =>
  value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function checkBuiltPages(outDir: string, options: PageCheckOptions = {}): string[] {
  const problems: string[] = [];
  const ids = new Map<string, { json: string; where: string }>();
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const noindex = new Set<string>();
  const indexable: string[] = [];

  for (const file of pagesIn(outDir)) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(outDir, path.dirname(file)).split(path.sep).join('/');
    const url = `${SITE}/${rel ? `${rel}/` : ''}`;
    const where = `${rel || '.'}/index.html`;

    const types = new Set<string>();
    for (const [, json] of html.matchAll(JSON_LD)) {
      let data: unknown;
      try {
        data = JSON.parse(json);
      } catch {
        problems.push(`${where}: JSON-LD does not parse`);
        continue;
      }
      for (const node of nodes(data)) {
        types.add(String(node['@type']));
        // A full node (more than a reference) must say the same thing wherever its @id appears.
        const id = node['@id'];
        if (typeof id === 'string' && Object.keys(node).length > 2) {
          const { '@context': _context, ...rest } = node;
          const body = JSON.stringify(rest);
          const seen = ids.get(id);
          if (!seen) ids.set(id, { json: body, where });
          else if (seen.json !== body) problems.push(`${where}: ${id} differs from ${seen.where}`);
        }
        const spec = node['priceSpecification'] as { minPrice?: number } | undefined;
        if (options.prices && spec && !options.prices.includes(Number(spec.minPrice))) {
          problems.push(`${where}: price ${spec.minPrice} is not in the canon`);
        }
      }
    }
    if (ROBOTS.exec(html)?.[1].includes('noindex')) {
      noindex.add(url);
      continue;
    }
    const canonicals = [...html.matchAll(CANONICAL)].map((m) => m[1]);
    if (canonicals.length !== 1) {
      problems.push(`${where}: ${canonicals.length} canonical links`);
      continue;
    }
    // Pages pointing to another canonical (documents in Russian and Chinese) repeat it on purpose.
    if (canonicals[0] !== url) continue;

    const title = unescape(TITLE.exec(html)?.[1] ?? '');
    const description = unescape(DESCRIPTION.exec(html)?.[1] ?? '');
    if (!title) problems.push(`${where}: no title`);
    if (!description) problems.push(`${where}: no description`);
    if (title.length > 60) problems.push(`${where}: title is ${title.length} characters, over 60`);
    if (description.length > 155) problems.push(`${where}: description is ${description.length} characters, over 155`);
    if (!HOMES.has(rel) && !types.has('BreadcrumbList')) problems.push(`${where}: no BreadcrumbList`);
    if (title && titles.has(title)) problems.push(`${where}: same title as ${titles.get(title)}: "${title}"`);
    if (description && descriptions.has(description)) {
      problems.push(`${where}: same description as ${descriptions.get(description)}`);
    }
    indexable.push(url);
    titles.set(title, where);
    descriptions.set(description, where);
  }

  const sitemap = path.join(outDir, 'sitemap.xml');
  if (fs.existsSync(sitemap)) {
    const locs = new Set([...fs.readFileSync(sitemap, 'utf8').matchAll(SITEMAP_LOC)].map((m) => m[1]));
    for (const url of indexable) if (!locs.has(url)) problems.push(`sitemap.xml: ${url} is missing`);
    for (const loc of locs) {
      const file = path.join(outDir, loc.slice(SITE.length), 'index.html');
      if (!fs.existsSync(file)) problems.push(`sitemap.xml: ${loc} has no page`);
      else if (noindex.has(loc)) problems.push(`sitemap.xml: ${loc} is marked noindex`);
    }
  }
  return problems;
}

/**
 * The hidden card page: built, marked noindex and nofollow, and named nowhere else: in no list
 * at the site root (sitemap, robots, llms, IndexNow) and in no link from another page.
 */
export function checkCardPage(outDir: string, cardPath = '/card/'): string[] {
  const problems: string[] = [];
  const file = path.join(outDir, cardPath, 'index.html');
  if (!fs.existsSync(file)) return [`${cardPath}: not built`];
  const robots = ROBOTS.exec(fs.readFileSync(file, 'utf8'))?.[1] ?? '';
  if (!/noindex/.test(robots) || !/nofollow/.test(robots)) problems.push(`${cardPath}: robots is "${robots}", expected noindex, nofollow`);
  // Every file at the site root: sitemap.xml, robots.txt, llms.txt, llms-full.txt, the IndexNow key, the data manifest…
  const lists = fs
    .readdirSync(outDir)
    .filter((name) => /\.(txt|xml|json)$/.test(name))
    .filter((name) => fs.statSync(path.join(outDir, name)).isFile());
  for (const listed of lists) {
    if (fs.readFileSync(path.join(outDir, listed), 'utf8').includes(cardPath)) problems.push(`${listed}: mentions ${cardPath}`);
  }
  const link = new RegExp(`href="(?:https://kpsglobal\\.id)?${cardPath}"`);
  for (const page of pagesIn(outDir)) {
    if (page === file) continue;
    if (link.test(fs.readFileSync(page, 'utf8'))) problems.push(`${path.relative(outDir, page)}: links to ${cardPath}`);
  }
  return problems;
}

const HREF = /<a\b[^>]*\shref="([^"#?]*)(?:[#?][^"]*)?"/g;

/**
 * Every link from one page of the site to another resolves to a built file: a page
 * (<path>/index.html), a file in the build (PDF, feed, vCard…) or the 404 page itself.
 */
export function checkInternalLinks(outDir: string): string[] {
  const problems: string[] = [];
  const exists = new Map<string, boolean>();
  const resolves = (href: string) => {
    let result = exists.get(href);
    if (result === undefined) {
      const target = path.join(outDir, decodeURIComponent(href));
      result = href.endsWith('/') ? fs.existsSync(path.join(target, 'index.html')) : fs.existsSync(target) && fs.statSync(target).isFile();
      exists.set(href, result);
    }
    return result;
  };
  for (const file of pagesIn(outDir)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, raw] of html.matchAll(HREF)) {
      const href = raw.startsWith(SITE) ? raw.slice(SITE.length) || '/' : raw;
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      if (!resolves(href)) problems.push(`${path.relative(outDir, file)}: broken link ${href}`);
    }
  }
  return [...new Set(problems)];
}

/** Files served exactly as committed, e.g. search engine verification and the IndexNow key: copied unchanged, not in the sitemap. */
export const VERBATIM_FILES = ['BingSiteAuth.xml', '7f7ae7950acf5bcff1ab10d008adb9cf.txt'];

export function checkVerbatimFiles(publicDir: string, outDir: string, files = VERBATIM_FILES): string[] {
  const problems: string[] = [];
  const sitemap = path.join(outDir, 'sitemap.xml');
  const listed = fs.existsSync(sitemap) ? fs.readFileSync(sitemap, 'utf8') : '';
  for (const file of files) {
    const built = path.join(outDir, file);
    if (!fs.existsSync(built)) problems.push(`${file}: missing from the build`);
    else if (!fs.readFileSync(built).equals(fs.readFileSync(path.join(publicDir, file)))) problems.push(`${file}: changed in the build`);
    if (listed.includes(file)) problems.push(`sitemap.xml: lists ${file}`);
  }
  return problems;
}
