import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_SIZE } from '../content/preview';

/**
 * Link-preview images: 1200 × 627 PNG per article (dist/og/) and the site-wide
 * dist/og-image.png (1200 × 630), with the title and the S2 lockup, rendered at build time.
 *
 * Fonts (woff, which satori reads; woff2 it does not): Manrope latin + cyrillic for
 * English and Russian, and for Chinese only the Noto Sans SC slices whose
 * unicode-range covers the characters of the text (@fontsource/noto-sans-sc,
 * a build-time dependency).
 */

const OG_WIDTH = OG_SIZE.width;
const OG_HEIGHT = OG_SIZE.height;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

type Font = { name: string; data: Buffer; weight: 600 | 800; style: 'normal' };

let fonts: Font[] | null = null;
const loadFonts = (rootDir: string): Font[] => {
  if (fonts) return fonts;
  const dir = path.join(rootDir, 'node_modules/@fontsource/manrope/files');
  fonts = (['latin', 'cyrillic'] as const).flatMap((subset) =>
    ([600, 800] as const).map((weight) => ({
      // Distinct names per subset: satori falls back between families, not between faces of one family.
      name: subset === 'latin' ? 'Manrope' : 'Manrope Cyrillic',
      data: fs.readFileSync(path.join(dir, `manrope-${subset}-${weight}-normal.woff`)),
      weight,
      style: 'normal' as const,
    })),
  );
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
  /** Accessible name of the logo; the lockup itself carries the brand. */
  brand: string;
  site: string;
}

/** Brand palette: navy ground, white type, a vermilion marker, paper for secondary text. */
const NAVY = '#16233F';
const VERMILION = '#B3261E';
const WHITE = '#FFFFFF';
const PAPER_SOFT = 'rgba(246, 242, 234, 0.78)';
const RULE = 'rgba(246, 242, 234, 0.22)';

/** The white S2 lockup (viewBox 593.6 × 168) shown at the bottom left. */
const LOCKUP_FILE = 'public/brand/kps-lockup-s2-white.svg';
const LOCKUP_HEIGHT = 52;
const LOCKUP_WIDTH = Math.round((LOCKUP_HEIGHT * 593.62) / 168);

export async function renderOgImage(
  rootDir: string,
  text: OgImageText,
  size: { width: number; height: number } = { width: OG_WIDTH, height: OG_HEIGHT },
): Promise<Buffer> {
  const lockup = `data:image/svg+xml;base64,${fs.readFileSync(path.join(rootDir, LOCKUP_FILE)).toString('base64')}`;
  const titleSize = text.title.length > 90 ? 50 : text.title.length > 60 ? 58 : 66;
  const cjk = chineseFonts(rootDir, `${text.eyebrow}${text.title}`);
  const families = ['Manrope', 'Manrope Cyrillic', ...new Set(cjk.map((font) => font.name))].join(', ');

  const tree = h(
    'div',
    {
      width: size.width,
      height: size.height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 96px',
      backgroundColor: NAVY,
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
      fontFamily: families,
      color: WHITE,
    },
    [
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { color: PAPER_SOFT, fontSize: 21, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }, text.eyebrow),
        h('div', { width: 68, height: 4, backgroundColor: VERMILION, marginTop: 22 }),
      ]),
      h('div', { display: 'flex', fontSize: titleSize, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1, maxWidth: 1000 }, text.title),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 26,
        },
        [
          h('img', { width: LOCKUP_WIDTH, height: LOCKUP_HEIGHT }, undefined, {
            src: lockup,
            alt: text.brand,
            width: LOCKUP_WIDTH,
            height: LOCKUP_HEIGHT,
          }),
          h('div', { fontSize: 22, fontWeight: 600, color: PAPER_SOFT }, text.site),
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
