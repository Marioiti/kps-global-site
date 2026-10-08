/**
 * npm run procedure:update -- <slug>
 * Moves a copy of the current version to content/procedures/_archive/<slug>/<date>/
 * (never published), then raises the version in en.md (1.0 → 1.1) and sets `updated`
 * to today. Edit the steps afterwards.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/pdf-tools';

const root = path.resolve(__dirname, '..');
const slug = parseArgs(process.argv.slice(2))._.trim();
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

if (!slug || slug.startsWith('_')) fail('Usage: npm run procedure:update -- <slug>');
const dir = path.join(root, 'content', 'procedures', slug);
const enFile = path.join(dir, 'en.md');
if (!fs.existsSync(enFile)) fail(`content/procedures/${slug}/en.md not found`);

const today = new Date().toISOString().slice(0, 10);
const archiveBase = path.join(root, 'content', 'procedures', '_archive', slug);
let archive = path.join(archiveBase, today);
for (let n = 2; fs.existsSync(archive); n++) archive = path.join(archiveBase, `${today}-${n}`);
fs.mkdirSync(archive, { recursive: true });
for (const file of fs.readdirSync(dir)) fs.copyFileSync(path.join(dir, file), path.join(archive, file));

const source = fs.readFileSync(enFile, 'utf8');
const current = source.match(/^version: "?(\d+)\.(\d+)"?$/m);
if (!current) fail(`content/procedures/${slug}/en.md has no version field`);
const next = `${current![1]}.${Number(current![2]) + 1}`;
const updated = source
  .replace(/^version: .*$/m, `version: "${next}"`)
  .replace(/^updated: .*$/m, `updated: "${today}"`);
fs.writeFileSync(enFile, updated);

console.log(
  `procedure:update ${slug}: ${current![1]}.${current![2]} archived in ${path.relative(root, archive)}, now ${next} (updated ${today}). Edit the steps.`,
);
