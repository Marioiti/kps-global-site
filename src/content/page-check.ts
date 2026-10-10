import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks of the built pages that keep search engines happy: every indexable page has one
 * canonical address, a title and description no other indexable page uses, JSON-LD that
 * parses, and sitemap.xml lists exactly the indexable pages.
 */

const SITE = 'https://kpsglobal.id';
const TITLE = /<title[^>]*>([^<]*)<\/title>/;
const DESCRIPTION = /<meta[^>]*name="description"[^>]*content="([^"]*)"/;
const CANONICAL = /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g;
const ROBOTS = /<meta[^>]*name="robots"[^>]*content="([^"]*)"/;
const JSON_LD = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
const SITEMAP_LOC = /<loc>([^<]+)<\/loc>/g;

const pagesIn = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return pagesIn(full);
    return d.name === 'index.html' ? [full] : [];
  });

const unescape = (value: string) =>
  value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function checkBuiltPages(outDir: string): string[] {
  const problems: string[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const noindex = new Set<string>();
  const indexable: string[] = [];

  for (const file of pagesIn(outDir)) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(outDir, path.dirname(file)).split(path.sep).join('/');
    const url = `${SITE}/${rel ? `${rel}/` : ''}`;
    const where = `${rel || '.'}/index.html`;

    for (const [, json] of html.matchAll(JSON_LD)) {
      try {
        JSON.parse(json);
      } catch {
        problems.push(`${where}: JSON-LD does not parse`);
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
