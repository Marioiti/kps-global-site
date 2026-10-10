import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkBuiltPages } from "@/content/page-check";
import { improvePageHead } from "@/content/page-head";

const page = (dir: string, rel: string, head: string) => {
  const file = path.join(dir, rel, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `<!DOCTYPE html><html><head>${head}</head><body></body></html>`);
};
const head = (url: string, title: string, description: string, extra = "") =>
  `<title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${url}">${extra}`;

describe("checks of the built pages", () => {
  it("pass a clean site", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kps-pages-"));
    page(dir, "", head("https://kpsglobal.id/", "Home", "About us"));
    page(dir, "ru/documents/nda", head("https://kpsglobal.id/documents/nda/", "Home", "About us"));
    page(dir, "news", head("https://kpsglobal.id/news/", "News", "News", '<meta name="robots" content="noindex, follow">'));
    fs.writeFileSync(path.join(dir, "sitemap.xml"), "<urlset><url><loc>https://kpsglobal.id/</loc></url></urlset>");
    expect(checkBuiltPages(dir)).toEqual([]);
  });

  it("report repeated titles and descriptions, broken JSON-LD, extra canonicals and noindex pages in the sitemap", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kps-pages-"));
    page(dir, "", head("https://kpsglobal.id/", "Home", "Same"));
    page(dir, "about", head("https://kpsglobal.id/about/", "Home", "Same", '<script type="application/ld+json">{oops</script>'));
    page(dir, "contact", head("https://kpsglobal.id/contact/", "Contact", "C", '<link rel="canonical" href="https://kpsglobal.id/">'));
    page(dir, "news", head("https://kpsglobal.id/news/", "News", "N", '<meta name="robots" content="noindex">'));
    fs.writeFileSync(path.join(dir, "sitemap.xml"), "<urlset><url><loc>https://kpsglobal.id/news/</loc></url><url><loc>https://kpsglobal.id/gone/</loc></url></urlset>");
    const problems = checkBuiltPages(dir).join("\n");
    // Whichever of the two is read second is reported.
    expect(problems).toMatch(/(about\/index\.html: same title as \.\/index\.html|\.\/index\.html: same title as about\/index\.html)/);
    expect(problems).toMatch(/: same description as /);
    expect(problems).toMatch(/about\/index\.html: JSON-LD does not parse/);
    expect(problems).toMatch(/contact\/index\.html: 2 canonical links/);
    expect(problems).toMatch(/sitemap\.xml: https:\/\/kpsglobal\.id\/news\/ is marked noindex/);
    expect(problems).toMatch(/sitemap\.xml: https:\/\/kpsglobal\.id\/gone\/ has no page/);
    expect(problems).toMatch(/sitemap\.xml: https:\/\/kpsglobal\.id\/about\/ is missing/);
  });
});

describe("page head", () => {
  const manifest = {
    "index.html": { file: "assets/app.js", isEntry: true },
    "src/i18n/strings/ru.ts": { file: "assets/ru-1.js" },
    "src/i18n/strings/zh.ts": { file: "assets/zh-1.js" },
  };
  const html = "<html><head><title>T</title></head><body></body></html>";

  it("preloads the language's strings with the main script", () => {
    expect(improvePageHead(html, manifest, "ru")).toContain('<link rel="modulepreload" crossorigin="" href="/assets/ru-1.js"></head>');
  });

  it("links the Chinese font on /zh/ pages only, without holding the first paint", () => {
    const zh = improvePageHead(html, manifest, "zh");
    expect(zh).toMatch(/<link id="noto-sans-sc" rel="stylesheet" href="\/fonts\/noto-sans-sc\/index\.css" media="print" onload="[^"]*media='all'/);
    expect(zh).toContain('<noscript><link rel="stylesheet" href="/fonts/noto-sans-sc/index.css"></noscript>');
    expect(improvePageHead(html, manifest, "ru")).not.toContain("noto-sans-sc");
  });
});

describe("seal font", () => {
  it("is a small subset in two weights, under 30 KB each", () => {
    for (const weight of [600, 900]) {
      const file = path.resolve(__dirname, `../../public/fonts/kps-seal-${weight}.woff2`);
      expect(fs.statSync(file).size, `kps-seal-${weight}.woff2`).toBeLessThan(30 * 1024);
    }
  });
});
