import { describe, it, expect } from "vitest";
import path from "node:path";
import { loadContent } from "@/content/load";
import { sitemapPages } from "@/content/build-output";
import { canon, formatPrice } from "@/data/canon";
import { makeLastmod } from "@/seo/lastmod";
import { buildLlms, buildLlmsFull } from "@/seo/llms";
import { ALLOWED_BOTS, buildRobots, buildSitemap } from "@/seo/sitemap";
import { shorten } from "@/seo/text";
import { SERVICES } from "@/components/service/services";

const PROJECT = path.resolve(__dirname, "../..");
const { entries, mandates, commodities } = loadContent(PROJECT);
const input = { commodities, documents: entries.filter((entry) => entry.collection === "documents") };

describe("robots.txt", () => {
  const robots = buildRobots();

  it("allows the whole site to every crawler and names search and AI crawlers one by one", () => {
    expect(robots.startsWith("User-agent: *\nAllow: /\n")).toBe(true);
    for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "YandexBot"]) {
      expect(ALLOWED_BOTS).toContain(bot);
      expect(robots).toContain(`User-agent: ${bot}\nAllow: /\n`);
    }
    expect(robots).toContain("Sitemap: https://kpsglobal.id/sitemap.xml");
    expect(robots).not.toMatch(/Disallow|card/);
  });
});

describe("sitemap.xml", () => {
  it("gives every page a lastmod and alternates in all languages, without changefreq or priority", () => {
    const xml = buildSitemap(sitemapPages(entries, mandates, () => "2026-10-01"));
    const urls = xml.split("<url>").slice(1);
    expect(urls.length).toBeGreaterThan(40);
    for (const url of urls) {
      expect(url).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      expect(url).toContain('hreflang="x-default"');
    }
    expect(xml).toContain('hreflang="zh" href="https://kpsglobal.id/zh/services/deal-structuring/"');
    expect(xml).not.toMatch(/changefreq|priority|\/card\//);
  });

  it("dates a page by the last commit to its sources, else by the build date", () => {
    const lastmod = makeLastmod(PROJECT, "2000-01-01");
    expect(lastmod(["package.json"])).toMatch(/^20\d{2}-\d{2}-\d{2}$/);
    expect(lastmod(["no/such/file.tsx"])).toBe("2000-01-01");
    expect(makeLastmod(path.parse(PROJECT).root, "2000-01-01")(["package.json"])).toBe("2000-01-01");
  });
});

describe("llms.txt and llms-full.txt", () => {
  const llms = buildLlms(input);
  const full = buildLlmsFull(input);

  it("open with the full company name and who we are, then link the sections in English first", () => {
    expect(llms.startsWith("# KPS Global Solutions\n\n> KPS Global Solutions (PT KPS Global Solutions, Bali, Indonesia)")).toBe(true);
    const order = ["## Services", "## Commodities", "## Documents", "## About", "## Contact", "## Русский", "## 中文", "## Optional"].map((h) => llms.indexOf(h));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1]))).toBe(true);
    expect(llms).toContain("(https://kpsglobal.id/services/deal-structuring/)");
    expect(llms).toContain("(https://kpsglobal.id/ru/services/deal-structuring/)");
    expect(llms).toContain("(https://kpsglobal.id/llms-full.txt)");
  });

  it("carry the service texts, prices from the canon only, and the questions in three languages", () => {
    const prices = Object.values(canon.products).flatMap((p) => ("priceFrom" in p && p.priceFrom ? [p.priceFrom] : []));
    for (const price of prices) {
      for (const language of ["en", "ru", "zh"] as const) expect(full).toContain(formatPrice(price, language).replace(/\u00a0/g, " "));
    }
    const amounts = [...full.matchAll(/USD\s?([\d\s,]+\d)/g)].map((m) => Number(m[1].replace(/\D/g, "")));
    const allowed = prices.map((price) => Number(price.replace(/\D/g, "")));
    expect(amounts.length).toBeGreaterThan(0);
    for (const amount of amounts) expect(allowed).toContain(amount);
    expect(full).toContain("## English");
    expect(full).toContain("## Русский");
    expect(full).toContain("## 中文");
  });

  it("name no phone number and no hidden page", () => {
    for (const text of [llms, full]) {
      expect(text).not.toMatch(/\+\d|\/card\/|\.vcf/);
      // The company registration number (NIB) is the only long number.
      expect(text.split(`NIB ${canon.legal.nib}`).join("")).not.toMatch(/\d{3}[\s-]?\d{3}[\s-]?\d{4}/);
    }
  });
});

describe("shorten", () => {
  it("cuts at a word and ends with an ellipsis", () => {
    expect(shorten("short", 10)).toBe("short");
    const cut = shorten("Independent advisory for cross-border commodity deals, offer checks", 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut).toBe("Independent advisory for cross-border…");
  });
});

describe("service pages", () => {
  it("each link two published documents and a commodity with a page", () => {
    const published = new Set(input.documents.map((entry) => entry.slug));
    for (const service of SERVICES) {
      expect(service.related.documents.filter((slug) => published.has(slug)), service.slug).toHaveLength(2);
      expect(commodities[service.related.commodity]?.en, service.slug).toBeTruthy();
    }
  });
});
