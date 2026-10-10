#!/usr/bin/env node
/**
 * Builds the small Noto Serif SC files for the seal, the page glyphs and the section numerals:
 * only the characters below, weights 600 and 900, written to public/fonts/.
 *
 * The full font is large and is not a dependency of the site. Install the sources first, then run:
 *   npm install --no-save @fontsource/noto-serif-sc@5 opentype.js@1 wawoff2@2
 *   node scripts/subset-cjk.mjs
 *
 * The @fontsource package ships the font split by unicode-range; the script finds the slice
 * holding each character, copies the glyph outlines into one new font and saves it as woff2.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_DIR = path.join(ROOT, 'public/fonts');
const LIMIT = 30 * 1024;

/** Seal, services, numerals, stamps, commodities, documents and the privacy page. */
export const SEAL_CHARACTERS = '合同规作壹贰叁肆伍陆止硫铝铜气油文件私';
const WEIGHTS = [600, 900];

const load = (name) => {
  try {
    return require(name);
  } catch {
    console.error(`Missing ${name}. Install the sources first:\n  npm install --no-save @fontsource/noto-serif-sc@5 opentype.js@1 wawoff2@2`);
    process.exit(1);
  }
};

const opentype = load('opentype.js');
const wawoff2 = load('wawoff2');
const SOURCE = path.dirname(require.resolve('@fontsource/noto-serif-sc/package.json'));

/** unicode-range "U+4e00-4e0f,U+5408" → [[from, to], …] */
const parseRange = (range) =>
  range.split(',').map((part) => {
    const [from, to] = part.trim().replace(/^U\+/i, '').split('-');
    return [parseInt(from, 16), parseInt(to ?? from, 16)];
  });

/** The slice file of a weight that holds a code point. */
function sliceFor(weight, codePoint) {
  const css = fs.readFileSync(path.join(SOURCE, `${weight}.css`), 'utf8');
  for (const block of css.split('@font-face').slice(1)) {
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];
    const file = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1];
    if (!range || !file) continue;
    if (parseRange(range).some(([from, to]) => codePoint >= from && codePoint <= to)) return path.join(SOURCE, 'files', file);
  }
  throw new Error(`No slice of weight ${weight} holds U+${codePoint.toString(16)}`);
}

async function build(weight) {
  const fonts = new Map();
  const fontOf = async (file) => {
    if (!fonts.has(file)) {
      const ttf = await wawoff2.decompress(fs.readFileSync(file));
      fonts.set(file, opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength)));
    }
    return fonts.get(file);
  };

  const glyphs = [];
  let template;
  for (const char of SEAL_CHARACTERS) {
    const codePoint = char.codePointAt(0);
    const font = await fontOf(sliceFor(weight, codePoint));
    template ??= font;
    const source = font.charToGlyph(char);
    if (!source || source.index === 0) throw new Error(`${char} is missing from weight ${weight}`);
    glyphs.push(
      new opentype.Glyph({
        name: `uni${codePoint.toString(16).toUpperCase()}`,
        unicode: codePoint,
        advanceWidth: source.advanceWidth,
        path: source.getPath(0, 0, template.unitsPerEm),
      }),
    );
  }

  // getPath draws in screen coordinates (y down); flip back to font units (y up).
  for (const glyph of glyphs) {
    for (const cmd of glyph.path.commands) {
      for (const key of ['y', 'y1', 'y2']) if (key in cmd) cmd[key] = -cmd[key];
    }
  }

  const notdef = new opentype.Glyph({ name: '.notdef', unicode: undefined, advanceWidth: template.unitsPerEm, path: new opentype.Path() });
  const font = new opentype.Font({
    familyName: 'KPS Seal',
    styleName: weight === 900 ? 'Black' : 'SemiBold',
    unitsPerEm: template.unitsPerEm,
    ascender: template.ascender,
    descender: template.descender,
    weightClass: weight,
    glyphs: [notdef, ...glyphs],
  });
  const otf = Buffer.from(font.toArrayBuffer());
  const woff2 = Buffer.from(await wawoff2.compress(otf));
  const file = path.join(OUT_DIR, `kps-seal-${weight}.woff2`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(file, woff2);
  if (woff2.length > LIMIT) throw new Error(`${path.basename(file)} is ${woff2.length} bytes, over ${LIMIT}`);
  console.log(`${path.relative(ROOT, file)}: ${(woff2.length / 1024).toFixed(1)} KB, ${glyphs.length} glyphs`);
}

for (const weight of WEIGHTS) await build(weight);
