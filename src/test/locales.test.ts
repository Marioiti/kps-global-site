import { describe, it, expect } from "vitest";
import {
  COLLECTION_PATHS,
  PAGE_PATHS,
  getLanguageFromPath,
  localizePath,
  localizedPagePaths,
  prerenderPaths,
  stripLanguagePrefix,
} from "@/i18n/locales";
import { buildRobots, buildSitemap } from "@/seo/sitemap";

describe("language URLs", () => {
  it("reads the language from the path prefix", () => {
    expect(getLanguageFromPath("/")).toBe("en");
    expect(getLanguageFromPath("/privacy/")).toBe("en");
    expect(getLanguageFromPath("/ru")).toBe("ru");
    expect(getLanguageFromPath("/ru/services/fractional-coo/")).toBe("ru");
    expect(getLanguageFromPath("/zh/")).toBe("zh");
    expect(getLanguageFromPath("/en/")).toBe("en");
    expect(getLanguageFromPath("/russia/")).toBe("en");
  });

  it("strips and adds the prefix", () => {
    expect(stripLanguagePrefix("/ru")).toBe("/");
    expect(stripLanguagePrefix("/ru/")).toBe("/");
    expect(stripLanguagePrefix("/zh/services/compliance-kyc/")).toBe("/services/compliance-kyc/");
    expect(stripLanguagePrefix("/privacy")).toBe("/privacy");
    expect(localizePath("/", "en")).toBe("/");
    expect(localizePath("/", "ru")).toBe("/ru/");
    expect(localizePath("/about/", "zh")).toBe("/zh/about/");
  });

  it("publishes every page and stub in three languages", () => {
    expect(localizedPagePaths()).toHaveLength(PAGE_PATHS.length * 3);
    expect(prerenderPaths()).toHaveLength((PAGE_PATHS.length + COLLECTION_PATHS.length) * 3);
    expect(localizedPagePaths()).toContain("/ru/services/deal-structuring/");
  });
});

describe("sitemap.xml and robots.txt", () => {
  it("lists indexed pages in three languages with hreflang alternates", () => {
    const xml = buildSitemap();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(localizedPagePaths().map((p) => `https://kpsglobal.id${p}`));
    expect(xml.match(/<xhtml:link /g)).toHaveLength(locs.length * 4);
    expect(xml).toContain('hreflang="x-default" href="https://kpsglobal.id/privacy/"');
  });

  it("leaves empty sections out of the default sitemap", () => {
    const xml = buildSitemap();
    for (const list of COLLECTION_PATHS) expect(xml).not.toContain(`kpsglobal.id${list}<`);
  });

  it("points robots.txt at the sitemap", () => {
    expect(buildRobots()).toContain("Sitemap: https://kpsglobal.id/sitemap.xml");
  });
});
