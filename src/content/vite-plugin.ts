import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { ContentError, loadContent, type LoadedContent } from './load';

const INDEX_ID = 'virtual:content';
const BODY_PREFIX = 'virtual:content-body/';

/**
 * Exposes content/ to the app:
 * - `virtual:content` — published entries (metadata only), commodity titles and summaries,
 *   and a lazy loader per body;
 * - `virtual:content-body/<collection>/<slug>/<lang>` — the rendered body, one chunk each,
 *   so texts stay out of the main bundle (`commodities/<id>/<lang>` for commodity pages).
 * A content problem fails the build with the list from ContentError.
 */
export function contentPlugin(rootDir: string): Plugin {
  const contentDir = path.join(rootDir, 'content');
  let cache: LoadedContent | null = null;

  const load = (fail: (message: string) => never): LoadedContent => {
    if (cache) return cache;
    try {
      cache = loadContent(rootDir);
      return cache;
    } catch (error) {
      if (error instanceof ContentError) fail(error.message);
      throw error;
    }
  };

  const reload = (server: ViteDevServer) => {
    cache = null;
    for (const id of server.moduleGraph.idToModuleMap.keys()) {
      if (id.startsWith(`\0${INDEX_ID}`)) {
        const mod = server.moduleGraph.getModuleById(id);
        if (mod) server.moduleGraph.invalidateModule(mod);
      }
    }
    server.ws.send({ type: 'full-reload' });
  };

  return {
    name: 'kps:content',
    resolveId(id) {
      if (id === INDEX_ID || id.startsWith(BODY_PREFIX)) return `\0${id}`;
    },
    load(id) {
      if (!id.startsWith(`\0${INDEX_ID}`)) return;
      const content = load((message) => this.error(message));
      for (const file of content.files) this.addWatchFile(path.join(rootDir, file));

      if (id === `\0${INDEX_ID}`) {
        const entries = content.entries.map(({ bodies: _bodies, ...entry }) => entry);
        const keys = [
          ...content.entries.flatMap((entry) =>
            Object.keys(entry.bodies).map((language) => `${entry.collection}/${entry.slug}/${language}`),
          ),
          ...Object.entries(content.commodities).flatMap(([commodity, pages]) =>
            Object.keys(pages).map((language) => `commodities/${commodity}/${language}`),
          ),
        ];
        const commodities = Object.fromEntries(
          Object.entries(content.commodities).map(([commodity, pages]) => [
            commodity,
            Object.fromEntries(
              Object.entries(pages).map(([language, page]) => [
                language,
                { title: page.title, description: page.description, summary: page.summary },
              ]),
            ),
          ]),
        );
        const loaders = keys.map((key) => `  ${JSON.stringify(key)}: () => import(${JSON.stringify(BODY_PREFIX + key)}),`);
        return [
          `export const entries = ${JSON.stringify(entries)};`,
          `export const commodities = ${JSON.stringify(commodities)};`,
          `export const mandates = ${JSON.stringify(content.mandates)};`,
          `export const bodies = {\n${loaders.join('\n')}\n};`,
          '',
        ].join('\n');
      }

      const [collection, slug, language] = id.slice(`\0${BODY_PREFIX}`.length).split('/');
      if (collection === 'commodities') {
        const page = content.commodities[slug]?.[language as keyof (typeof content.commodities)[string]];
        if (!page) this.error(`No commodity page for ${slug}/${language}`);
        return `export default ${JSON.stringify(page)};\n`;
      }
      const entry = content.entries.find((e) => e.collection === collection && e.slug === slug);
      const body = entry?.bodies[language as keyof typeof entry.bodies];
      if (body === undefined) this.error(`No published body for ${collection}/${slug}/${language}`);
      return `export default ${JSON.stringify(body)};\n`;
    },
    configureServer(server) {
      server.watcher.add(contentDir);
      const onChange = (file: string) => {
        if (file.startsWith(contentDir)) reload(server);
      };
      server.watcher.on('add', onChange);
      server.watcher.on('change', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
