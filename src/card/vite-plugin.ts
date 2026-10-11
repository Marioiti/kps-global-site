import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { canon } from '../data/canon';
import { qrShape } from './qr';
import { founderVCard, VCARD_PATH } from './vcard';

/** The links behind the QR codes on /card/. */
export const CARD_URL = 'https://kpsglobal.id/card/';
export const cardLinks = () => ({
  whatsapp: canon.contacts.whatsappBusiness,
  telegram: canon.contacts.telegram?.url ?? '',
  wechat: canon.contacts.wechat?.url ?? '',
  card: CARD_URL,
});

const VIRTUAL = 'virtual:card-qr';
const RESOLVED = `\0${VIRTUAL}`;

/**
 * Build-time pieces of the hidden card page: `virtual:card-qr` with the QR codes as SVG paths
 * (generated here with qrcode, no outside service), and dist/card/andrei-orlov.vcf.
 */
export function cardPlugin(): Plugin {
  let ssrBuild = false;
  return {
    name: 'kps:card',
    configResolved(config) {
      ssrBuild = Boolean(config.build.ssr);
    },
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      const codes = Object.fromEntries(Object.entries(cardLinks()).map(([key, url]) => [key, { url, ...qrShape(url) }]));
      return `export const codes = ${JSON.stringify(codes)};`;
    },
    configureServer(server) {
      server.middlewares.use(`/${VCARD_PATH}`, (_req, res) => {
        res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
        res.end(founderVCard());
      });
    },
    generateBundle() {
      if (ssrBuild) return;
      this.emitFile({ type: 'asset', fileName: VCARD_PATH, source: founderVCard() });
    },
  };
}

/**
 * The prerender lists every route in its loader-data manifest; the card page has no loader data,
 * so its entry and data file go, and the page is named in no file at the site root.
 */
export function unlistCardData(outDir: string): void {
  for (const name of fs.readdirSync(outDir).filter((file) => /^static-loader-data-manifest-.*\.json$/.test(file))) {
    const file = path.join(outDir, name);
    const manifest: Record<string, string> = JSON.parse(fs.readFileSync(file, 'utf8'));
    delete manifest['/card/'];
    fs.writeFileSync(file, JSON.stringify(manifest));
  }
  fs.rmSync(path.join(outDir, 'static-loader-data', 'card'), { recursive: true, force: true });
}
