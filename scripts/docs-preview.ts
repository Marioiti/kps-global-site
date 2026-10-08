/**
 * npm run docs:preview -- <slug>
 * Renders _internal/documents/<slug>/<slug>.pdf into watermarked WebP pages in
 * public/docs-preview/<slug>/ (1200 px wide, no text layer). Only for cards with
 * `access: preview`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, readCard, renderPreview, sourcePdf } from './lib/pdf-tools';

const root = path.resolve(__dirname, '..');
const slug = parseArgs(process.argv.slice(2))._.trim();

if (!slug) {
  console.error('Usage: npm run docs:preview -- <slug>');
  process.exit(1);
}
const card = readCard(root, slug);
if (!card) {
  console.error(`No card content/documents/${slug}/en.md. Create the card first.`);
  process.exit(1);
}
if (card.access !== 'preview') {
  console.error(`content/documents/${slug} has access: ${card.access}. Online preview is only for access: preview.`);
  process.exit(1);
}
const pdf = sourcePdf(root, slug);
if (!fs.existsSync(pdf)) {
  console.error(`Source not found: ${path.relative(root, pdf)}`);
  process.exit(1);
}

const outDir = path.join(root, 'public', 'docs-preview', slug);
const pages = await renderPreview(pdf, outDir, `PREVIEW · ${card.title} · v${card.version} · kpsglobal.id`);
console.log(`docs:preview ${slug}: ${pages} page(s) → ${path.relative(root, outDir)}/page-1..${pages}.webp`);
