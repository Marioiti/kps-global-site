#!/usr/bin/env node
/**
 * Site icons with the KPS seal: 合 in white on a vermilion square. The character is taken as
 * outlines from the seal font subset (public/fonts/kps-seal-900.woff2), so the SVG needs no font.
 *
 * Writes public/favicon.svg, favicon.ico (32 px), favicon-32.png, favicon-192.png,
 * favicon-512.png and apple-touch-icon.png (180 px). Install the tools first, then run:
 *   npm install --no-save opentype.js@1 wawoff2@2 sharp@0.33
 *   node scripts/make-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUBLIC = path.join(ROOT, 'public');
const ACCENT = '#B3261E';
const SIZE = 64;

const load = (name) => {
  try {
    return require(name);
  } catch {
    console.error(`Missing ${name}. Install the tools first:\n  npm install --no-save opentype.js@1 wawoff2@2 sharp@0.33`);
    process.exit(1);
  }
};
const opentype = load('opentype.js');
const wawoff2 = load('wawoff2');
const sharp = load('sharp');

const ttf = await wawoff2.decompress(fs.readFileSync(path.join(PUBLIC, 'fonts/kps-seal-900.woff2')));
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));
const glyph = font.charToGlyph('合');

// Fit the character into the square with a margin, centred on its own bounding box.
const box = glyph.getPath(0, 0, 100).getBoundingBox();
const margin = SIZE * 0.14;
const scale = (SIZE - margin * 2) / Math.max(box.x2 - box.x1, box.y2 - box.y1);
const width = (box.x2 - box.x1) * scale;
const height = (box.y2 - box.y1) * scale;
const x = (SIZE - width) / 2 - box.x1 * scale;
const y = (SIZE - height) / 2 - box.y1 * scale;
const d = glyph.getPath(x, y, 100 * scale).toPathData(2);

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">` +
  `<rect width="${SIZE}" height="${SIZE}" rx="5" fill="${ACCENT}"/>` +
  `<path d="${d}" fill="#FFFFFF"/>` +
  `</svg>\n`;
fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), svg);

const png = (size) => sharp(Buffer.from(svg), { density: 72 * (size / SIZE) * 4 }).resize(size, size).png().toBuffer();
const outputs = { 'favicon-32.png': 32, 'favicon-192.png': 192, 'favicon-512.png': 512, 'apple-touch-icon.png': 180 };
for (const [file, size] of Object.entries(outputs)) fs.writeFileSync(path.join(PUBLIC, file), await png(size));

// favicon.ico: one 32 px PNG image in an ICO container.
const image = await png(32);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(image.length, 8);
entry.writeUInt32LE(6 + 16, 12);
fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), Buffer.concat([header, entry, image]));

console.log('icons:', ['favicon.svg', 'favicon.ico', ...Object.keys(outputs)].join(', '));
