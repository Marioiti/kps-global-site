/**
 * Local tools for document files. Sources live in _internal/documents/<slug>/<slug>.pdf
 * (outside git); nothing here writes a PDF into public/ or dist/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { parse as parseYaml } from 'yaml';
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const NAVY = { r: 22 / 255, g: 35 / 255, b: 63 / 255 };
export const PREVIEW_WATERMARK = 'kpsglobal.id · PREVIEW · NOT FOR USE';
export const PREVIEW_WIDTH = 1200;

/** `--doc x --to "Acme"` → { doc: 'x', to: 'Acme' }; bare words go to `_`. */
export function parseArgs(argv: string[]): Record<string, string> & { _: string } {
  const out: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') continue;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      out[key] = next && !next.startsWith('--') ? (i++, next) : 'true';
    } else rest.push(arg);
  }
  return Object.assign(out, { _: rest.join(' ') });
}

export const sourcePdf = (rootDir: string, slug: string) => path.join(rootDir, '_internal', 'documents', slug, `${slug}.pdf`);

export interface Card {
  title: string;
  version: string;
  access: string;
}

/** The English card of a document (title, version, access), if it exists. */
export function readCard(rootDir: string, slug: string): Card | null {
  const file = path.join(rootDir, 'content', 'documents', slug, 'en.md');
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = (match ? parseYaml(match[1]) : {}) as Partial<Card>;
  return { title: meta.title ?? slug, version: meta.version ?? 'n/a', access: meta.access ?? 'n/a' };
}

/** A font with Latin, Cyrillic and Chinese glyphs for watermarks (macOS, then common Linux paths). */
export function findUnicodeFont(): string | null {
  const candidates = [
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/Library/Fonts/Arial Unicode.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

// ---------------------------------------------------------------- audit

export interface AuditRow {
  slug: string;
  group: string;
  access: string;
  expected: string;
}

export type AuditResult = { skipped: true } | { skipped: false; checked: number; missing: AuditRow[] };

/**
 * Published cards (en.md with draft: false) that have no source file (PDF or DOCX)
 * in _internal/documents/<slug>/. Skipped when the folder is absent (CI).
 */
export function auditSources(rootDir: string): AuditResult {
  if (!fs.existsSync(path.join(rootDir, '_internal'))) return { skipped: true };
  const cardsDir = path.join(rootDir, 'content', 'documents');
  const slugs = fs.existsSync(cardsDir)
    ? fs
        .readdirSync(cardsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .map((d) => d.name)
        .sort()
    : [];
  const missing: AuditRow[] = [];
  let checked = 0;
  for (const slug of slugs) {
    const file = path.join(cardsDir, slug, 'en.md');
    if (!fs.existsSync(file)) continue;
    const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const meta = (match ? parseYaml(match[1]) : {}) as { draft?: boolean; group?: string; access?: string };
    if (meta.draft !== false) continue;
    checked++;
    const dir = path.join(rootDir, '_internal', 'documents', slug);
    const hasSource = fs.existsSync(dir) && fs.readdirSync(dir).some((name) => /\.(pdf|docx)$/i.test(name));
    if (!hasSource) {
      missing.push({
        slug,
        group: meta.group ?? '',
        access: meta.access ?? '',
        expected: path.relative(rootDir, dir) + '/',
      });
    }
  }
  return { skipped: false, checked, missing };
}

// ---------------------------------------------------------------- preview

/**
 * Renders every page of `pdfPath` to public/docs-preview/<slug>/page-N.webp: 1200 px wide,
 * a diagonal watermark and a line at the bottom. The images carry no text layer.
 */
export async function renderPreview(
  pdfPath: string,
  outDir: string,
  footer: string,
): Promise<number> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas, GlobalFonts } = await import('@napi-rs/canvas');
  const font = findUnicodeFont();
  if (font) GlobalFonts.registerFromPath(font, 'KPS Watermark');
  const family = font ? '"KPS Watermark", sans-serif' : 'sans-serif';

  const pdfjsDir = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({
    data,
    standardFontDataUrl: path.join(pdfjsDir, 'standard_fonts') + path.sep,
    cMapUrl: path.join(pdfjsDir, 'cmaps') + path.sep,
    cMapPacked: true,
  }).promise;

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: PREVIEW_WIDTH / base.width });
    const width = Math.round(viewport.width);
    const height = Math.round(viewport.height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport, canvas: canvas as unknown as HTMLCanvasElement }).promise;

    // Diagonal watermark, repeated across the page.
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = `600 34px ${family}`;
    ctx.fillStyle = 'rgba(22, 35, 63, 0.16)';
    ctx.textAlign = 'center';
    const step = 170;
    for (let y = -height; y <= height; y += step) {
      for (let x = -width; x <= width; x += 760) ctx.fillText(PREVIEW_WATERMARK, x + ((y / step) % 2) * 380, y);
    }
    ctx.restore();

    // Line at the bottom.
    const band = 44;
    ctx.fillStyle = 'rgba(22, 35, 63, 0.92)';
    ctx.fillRect(0, height - band, width, band);
    ctx.font = `500 16px ${family}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${footer} · page ${n}/${doc.numPages}`, width / 2, height - band / 2);

    fs.writeFileSync(path.join(outDir, `page-${n}.webp`), await canvas.encode('webp', 82));
    page.cleanup();
  }
  const pages = doc.numPages;
  await doc.destroy();
  return pages;
}

// ---------------------------------------------------------------- issue

export interface Recipient {
  company: string;
  person?: string;
}

/** Visible mark on every page: recipient, date and issue number (diagonal and at the bottom). */
export async function stampPdf(
  source: Uint8Array,
  mark: { recipient: Recipient; date: string; number: string },
  fontPath: string | null = findUnicodeFont(),
): Promise<Uint8Array> {
  const recipient = mark.recipient.person ? `${mark.recipient.company} / ${mark.recipient.person}` : mark.recipient.company;
  if (!fontPath && /[^\x20-\x7E]/.test(recipient)) {
    throw new Error('No Unicode font found for a non-Latin recipient name; install DejaVu Sans or use macOS.');
  }
  // The built-in Helvetica has no middle dot.
  const sep = fontPath ? ' · ' : ' - ';
  const line = ['Issued to ' + recipient, mark.date, mark.number, 'Confidential, not for distribution'].join(sep);
  const pdf = await PDFDocument.load(source);
  pdf.registerFontkit(fontkit);
  const font = fontPath ? await pdf.embedFont(fs.readFileSync(fontPath), { subset: true }) : await pdf.embedFont('Helvetica');
  const navy = rgb(NAVY.r, NAVY.g, NAVY.b);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const diagonal = `${recipient}${sep}${mark.number}`;
    const size = Math.min(28, (width * 0.9) / Math.max(1, font.widthOfTextAtSize(diagonal, 1)));
    page.drawText(diagonal, {
      x: width * 0.12,
      y: height * 0.3,
      size,
      font,
      color: navy,
      opacity: 0.14,
      rotate: degrees(35),
    });
    const footerSize = Math.min(8, (width - 40) / Math.max(1, font.widthOfTextAtSize(line, 1)));
    page.drawText(line, { x: 20, y: 14, size: footerSize, font, color: navy, opacity: 0.85 });
  }
  pdf.setTitle(`${mark.number}`);
  pdf.setSubject(`Issued to ${recipient}`);
  return pdf.save();
}

export const REGISTER_HEADER = 'number,date,document,version,recipient';

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** KPS-YYYYMMDD-NNN, continuing the sequence of that day in the register. */
export function nextIssueNumber(registerPath: string, date: string): string {
  const day = date.replace(/-/g, '');
  const prefix = `KPS-${day}-`;
  const used = fs.existsSync(registerPath)
    ? fs
        .readFileSync(registerPath, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.split(',')[0])
        .filter((number) => number.startsWith(prefix))
        .map((number) => Number(number.slice(prefix.length)))
    : [];
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function appendRegister(
  registerPath: string,
  row: { number: string; date: string; document: string; version: string; recipient: string },
): void {
  fs.mkdirSync(path.dirname(registerPath), { recursive: true });
  if (!fs.existsSync(registerPath)) fs.writeFileSync(registerPath, `${REGISTER_HEADER}\n`);
  const line = [row.number, row.date, row.document, row.version, row.recipient].map(csvCell).join(',');
  fs.appendFileSync(registerPath, `${line}\n`);
}

export const qpdfAvailable = (): boolean => spawnSync('qpdf', ['--version'], { stdio: 'ignore' }).status === 0;

/**
 * Opens without a password; an owner password forbids changes and copying text
 * (AES-256). Stops casual editing, not a determined user.
 */
export function encryptWithQpdf(input: string, output: string, ownerPassword: string): void {
  const result = spawnSync(
    'qpdf',
    ['--encrypt', '', ownerPassword, '256', '--print=full', '--modify=none', '--extract=n', '--annotate=n', '--', input, output],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(`qpdf failed: ${result.stderr || result.stdout}`);
}

/** A value from the environment or from .env.local (never committed). */
export function readSecret(rootDir: string, key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const file = path.join(rootDir, '.env.local');
  if (!fs.existsSync(file)) return undefined;
  const line = fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${key}=`));
  return line?.slice(key.length + 1).replace(/^["']|["']$/g, '') || undefined;
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 40) || 'recipient';
