import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_SIZE } from '../content/preview';

/**
 * Link-preview images: 1200 × 627 PNG per article (dist/og/) and the site-wide
 * dist/og-image.png (1200 × 630), in design v3: the seal 合, the title, the name; rendered at build time.
 *
 * Fonts (woff, which satori reads; woff2 it does not): Spectral 500 for the title and the name,
 * Golos Text 400/600 for the small lines, latin + cyrillic; for Chinese only the Noto Sans SC
 * slices whose unicode-range covers the characters of the text (@fontsource/noto-sans-sc,
 * a build-time dependency).
 */

const OG_WIDTH = OG_SIZE.width;
const OG_HEIGHT = OG_SIZE.height;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600 | 800; style: 'normal' };

let fonts: Font[] | null = null;
const loadFonts = (rootDir: string): Font[] => {
  if (fonts) return fonts;
  const file = (pkg: string, subset: string, weight: number) =>
    fs.readFileSync(path.join(rootDir, `node_modules/@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-normal.woff`));
  // Distinct names per subset: satori falls back between families, not between faces of one family.
  fonts = (['latin', 'cyrillic'] as const).flatMap((subset) => {
    const suffix = subset === 'latin' ? '' : ' Cyrillic';
    return [
      { name: `Spectral${suffix}`, data: file('spectral', subset, 500), weight: 500 as const, style: 'normal' as const },
      { name: `Golos${suffix}`, data: file('golos-text', subset, 400), weight: 400 as const, style: 'normal' as const },
      { name: `Golos${suffix}`, data: file('golos-text', subset, 600), weight: 600 as const, style: 'normal' as const },
    ];
  });
  return fonts;
};

interface Slice {
  ranges: [number, number][];
  file: string;
}

const sliceCache = new Map<number, Slice[]>();
const notoSlices = (rootDir: string, weight: 600 | 800): Slice[] => {
  const cached = sliceCache.get(weight);
  if (cached) return cached;
  const dir = path.join(rootDir, 'node_modules/@fontsource/noto-sans-sc');
  const css = fs.readFileSync(path.join(dir, `${weight}.css`), 'utf8');
  const slices = [...css.matchAll(/url\(\.\/files\/([^)]+\.woff)\) format\('woff'\);\s*unicode-range: ([^;]+);/g)].map(
    ([, file, ranges]): Slice => ({
      file: path.join(dir, 'files', file),
      ranges: ranges.split(',').map((range) => {
        const [start, end = start] = range.trim().replace(/^U\+/i, '').split('-');
        return [parseInt(start, 16), parseInt(end, 16)];
      }),
    }),
  );
  sliceCache.set(weight, slices);
  return slices;
};

/** Noto Sans SC slices covering the CJK characters of `text`, each under its own family name. */
const chineseFonts = (rootDir: string, text: string): Font[] => {
  const codes = [...new Set([...text].map((ch) => ch.codePointAt(0)!))].filter((code) => code > 0x2e7f);
  if (codes.length === 0) return [];
  return ([600, 800] as const).flatMap((weight) =>
    notoSlices(rootDir, weight)
      .filter((slice) => codes.some((code) => slice.ranges.some(([a, b]) => code >= a && code <= b)))
      .map((slice): Font => ({
        name: `Noto SC ${path.basename(slice.file).split('-')[3]}`,
        data: fs.readFileSync(slice.file),
        weight,
        style: 'normal',
      })),
  );
};

export interface OgImageText {
  eyebrow: string;
  title: string;
  /** The name under the title. */
  brand: string;
  site: string;
}

/** Design v3, light theme: paper ground, ink type, the vermilion seal. */
const BG = '#FBFAF7';
const INK = '#121A2B';
const MUTED = '#5A6170';
const RULE = '#D9D3C7';

/** The seal: 合 in white on vermilion, as outlines (public/favicon.svg, scripts/make-icons.mjs). */
const SEAL_FILE = 'public/favicon.svg';
const SEAL_SIZE = 112;

export async function renderOgImage(
  rootDir: string,
  text: OgImageText,
  size: { width: number; height: number } = { width: OG_WIDTH, height: OG_HEIGHT },
): Promise<Buffer> {
  const seal = `data:image/svg+xml;base64,${fs.readFileSync(path.join(rootDir, SEAL_FILE)).toString('base64')}`;
  const titleSize = text.title.length > 90 ? 50 : text.title.length > 60 ? 58 : 66;
  const cjk = chineseFonts(rootDir, `${text.eyebrow}${text.title}`);
  const cjkFamilies = [...new Set(cjk.map((font) => font.name))];
  const serif = ['Spectral', 'Spectral Cyrillic', ...cjkFamilies].join(', ');
  const sans = ['Golos', 'Golos Cyrillic', ...cjkFamilies].join(', ');

  const tree = h(
    'div',
    {
      width: size.width,
      height: size.height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 88px',
      backgroundColor: BG,
      fontFamily: sans,
      color: INK,
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 32 }, [
        h('img', { width: SEAL_SIZE, height: SEAL_SIZE }, undefined, { src: seal, alt: '', width: SEAL_SIZE, height: SEAL_SIZE }),
        h('div', { color: MUTED, fontSize: 24, fontWeight: 400 }, text.eyebrow),
      ]),
      h('div', { display: 'flex', fontFamily: serif, fontSize: titleSize, fontWeight: 500, lineHeight: 1.1, maxWidth: 1000 }, text.title),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 24,
        },
        [
          h('div', { fontFamily: serif, fontSize: 30, fontWeight: 500 }, text.brand),
          h('div', { fontSize: 22, fontWeight: 400, color: MUTED }, text.site),
        ],
      ),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: size.width,
    height: size.height,
    fonts: [...loadFonts(rootDir), ...cjk],
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: size.width } }).render().asPng();
}
