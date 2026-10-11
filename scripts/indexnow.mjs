/**
 * Tells IndexNow (Bing, Yandex and the other engines that share it) which pages changed.
 *
 *   node scripts/indexnow.mjs                 pages changed since the previous release tag
 *   node scripts/indexnow.mjs --all           every page in the sitemap
 *   node scripts/indexnow.mjs --since 2026-10-01
 *   node scripts/indexnow.mjs --sitemap https://kpsglobal.id/sitemap.xml   (default: dist/sitemap.xml)
 *   node scripts/indexnow.mjs --dry-run       print the request, send nothing
 *
 * The key is the name of the <32 hex>.txt file in public/, served at the site root.
 * A page counts as changed when its sitemap lastmod is on or after the date of the previous
 * release tag (v*). Without a tag every page is sent.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HOST = 'kpsglobal.id';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const HIDDEN = ['/card/'];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};

const keyFile = fs.readdirSync(path.join(ROOT, 'public')).find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) {
  console.error('indexnow: no key file in public/');
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, '');

const git = (...gitArgs) => {
  try {
    return execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

/** The date of the release before this commit: the last v* tag reachable from HEAD^. */
const previousRelease = () => {
  const tag = git('describe', '--tags', '--abbrev=0', '--match', 'v*', 'HEAD^');
  return tag ? { tag, date: git('log', '-1', '--format=%cs', tag) } : null;
};

const readSitemap = async (source) => {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
    return response.text();
  }
  return fs.readFileSync(path.resolve(ROOT, source), 'utf8');
};

const main = async () => {
  const xml = await readSitemap(option('--sitemap') ?? 'dist/sitemap.xml');
  const pages = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
    loc: /<loc>([^<]+)<\/loc>/.exec(body)?.[1],
    lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(body)?.[1],
  }));

  let since = option('--since');
  if (!since && !flag('--all')) {
    const release = previousRelease();
    if (release?.date) {
      since = release.date;
      console.log(`indexnow: pages changed since ${release.tag} (${since})`);
    }
  }
  const urls = pages
    .filter((page) => page.loc && new URL(page.loc).host === HOST)
    .filter((page) => !HIDDEN.some((hidden) => new URL(page.loc).pathname.startsWith(hidden)))
    .filter((page) => !since || !page.lastmod || page.lastmod >= since)
    .map((page) => page.loc);

  if (!urls.length) {
    console.log('indexnow: nothing changed');
    return;
  }
  const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls.slice(0, 10000) };
  if (flag('--dry-run')) {
    console.log(JSON.stringify(body, null, 2));
    return;
  }
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  // 200 OK and 202 Accepted both mean the list was taken.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`HTTP ${response.status} ${await response.text()}`);
  }
  console.log(`indexnow: sent ${body.urlList.length} URLs, HTTP ${response.status}`);
};

main().catch((error) => {
  console.error(`indexnow: ${error.message}`);
  process.exit(1);
});
