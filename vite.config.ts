import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";
import type {} from "vite-react-ssg"; // adds `ssgOptions` to the Vite config type
import { prerenderPaths } from "./src/i18n/locales";
import { contentPlugin } from "./src/content/vite-plugin";
import { assertNoDocumentFiles, writeContentOutputs, writePagePreviews } from "./src/content/build-output";
import { improvePageHead, type BuildManifest } from "./src/content/page-head";
import { checkBuiltPages } from "./src/content/page-check";

/** The client build manifest, read once while the pages are prerendered. */
let clientManifest: BuildManifest | null = null;
const readClientManifest = (): BuildManifest =>
  (clientManifest ??= JSON.parse(fs.readFileSync(path.resolve(__dirname, "dist/.vite/manifest.json"), "utf8")));

/** Rendered through the catch-all route, then moved to dist/404.html. */
const NOT_FOUND_ROUTE = "/404";

/**
 * Makes `vite preview` answer like GitHub Pages: `/privacy` redirects to
 * `/privacy/`, and unknown addresses get dist/404.html with status 404
 * instead of the SPA fallback to index.html.
 */
const githubPagesPreview = (): Plugin => ({
  name: "kps:github-pages-preview",
  configurePreviewServer(server) {
    const distDir = path.resolve(server.config.root, server.config.build.outDir);
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      const target = path.join(distDir, pathname);

      if (fs.existsSync(target) && fs.statSync(target).isFile()) return next();
      if (fs.existsSync(path.join(target, "index.html"))) {
        if (pathname.endsWith("/")) return next();
        res.statusCode = 301;
        res.setHeader("Location", `${url.pathname}/${url.search}`);
        return res.end();
      }

      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(fs.readFileSync(path.join(distDir, "404.html")));
    });
  },
});

const NOTO_SC_DIR = path.resolve(__dirname, "node_modules/@fontsource-variable/noto-sans-sc");
const NOTO_SC_URL = "/fonts/noto-sans-sc/";

/**
 * Serves the self-hosted Chinese font at a stable address, /fonts/noto-sans-sc/,
 * so the prerendered /zh/ pages and the browser bundle link the same stylesheet.
 * The package CSS is split by unicode-range: browsers fetch only the slices a page needs.
 */
const notoSansSc = (): Plugin => {
  let ssrBuild = false;
  return {
    name: "kps:noto-sans-sc",
    configResolved(config) {
      ssrBuild = Boolean(config.build.ssr);
    },
    configureServer(server) {
      server.middlewares.use(NOTO_SC_URL, (req, res, next) => {
        const file = path.join(NOTO_SC_DIR, decodeURIComponent((req.url ?? "/").split("?")[0]));
        if (!file.startsWith(NOTO_SC_DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
        res.setHeader("Content-Type", file.endsWith(".css") ? "text/css" : "font/woff2");
        res.end(fs.readFileSync(file));
      });
    },
    generateBundle() {
      if (ssrBuild) return;
      const out = NOTO_SC_URL.slice(1);
      const emit = (fileName: string, file: string) =>
        this.emitFile({ type: "asset", fileName, source: fs.readFileSync(file) });
      emit(`${out}index.css`, path.join(NOTO_SC_DIR, "index.css"));
      for (const name of fs.readdirSync(path.join(NOTO_SC_DIR, "files"))) {
        if (name.endsWith(".woff2")) emit(`${out}files/${name}`, path.join(NOTO_SC_DIR, "files", name));
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), contentPlugin(__dirname), notoSansSc(), githubPagesPreview()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false,
  },
  ssgOptions: {
    // /ru/privacy → dist/ru/privacy/index.html
    dirStyle: "nested",
    // Pages and lists, plus one page per published article from the routes' getStaticPaths.
    includedRoutes: (paths) => {
      const articles = paths
        .filter((p) => /(^|\/)(insights|news|procedures|commodities|mandates|documents)\/[a-z0-9-]+$/.test(p))
        // Same form as the links (/insights/<slug>/): the browser looks up prerendered data by exact path.
        .map((p) => `${p.startsWith("/") ? p : `/${p}`}/`);
      return [...new Set([...prerenderPaths(), ...articles, NOT_FOUND_ROUTE])];
    },
    // Helmet tags are injected right after <head>; keep the charset declaration first.
    onPageRendered: (route, html) => {
      const charset = html.match(/<meta charset="[^"]*">/i)?.[0];
      const sorted = charset ? html.replace(charset, "").replace("<head>", `<head>${charset}`) : html;
      const language = route.match(/^\/?(ru|zh)(\/|$)/)?.[1] ?? "en";
      return improvePageHead(sorted, readClientManifest(), language);
    },
    onFinished: async (dir) => {
      const outDir = path.resolve(__dirname, dir);
      const notFoundDir = path.join(outDir, NOT_FOUND_ROUTE);
      fs.renameSync(path.join(notFoundDir, "index.html"), path.join(outDir, "404.html"));
      fs.rmSync(notFoundDir, { recursive: true });
      // Build manifests are not needed on the server.
      fs.rmSync(path.join(outDir, ".vite"), { recursive: true, force: true });
      // sitemap.xml, robots.txt, RSS feeds, article preview images.
      await writeContentOutputs(__dirname, outDir);
      // Preview images of fixed pages, from their prerendered og:title.
      await writePagePreviews(__dirname, outDir);
      // Custom domain (kpsglobal.id) travels with the site.
      fs.copyFileSync(path.resolve(__dirname, "CNAME"), path.join(outDir, "CNAME"));
      // No PDF, DOCX or XLSX ever leaves the repository through the site.
      assertNoDocumentFiles(outDir);
      // One canonical, unique titles and descriptions, JSON-LD that parses, a sitemap without noindex pages.
      const problems = checkBuiltPages(outDir);
      if (problems.length) throw new Error(`Built pages:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    },
  },
});
