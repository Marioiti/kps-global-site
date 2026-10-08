import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { ContentError, loadContent } from "@/content/load";
import { renderMarkdown, readingMinutes } from "@/content/markdown";
import { sitemapPages } from "@/content/build-output";
import { buildSitemap } from "@/seo/sitemap";
import { buildFeed } from "@/seo/feed";
import { previewImage } from "@/content/preview";
import { canon } from "@/data/canon";
import { LANGUAGES } from "@/i18n/locales";
import { forbidden } from "./forbidden";

const FIXTURES = path.resolve(__dirname, "fixtures");
const PROJECT = path.resolve(__dirname, "../..");

const renderAt = async (url: string) => {
  const router = createMemoryRouter(routes as RouteObject[], { initialEntries: [url] });
  render(
    <HelmetProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </HelmetProvider>,
  );
  await waitFor(() => expect(router.state.initialized).toBe(true));
  await screen.findAllByRole("heading", { level: 1 });
  return router;
};

/** A temporary project root with the fixture commodity pages (every root needs all five). */
const tempRoot = (): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kps-content-"));
  fs.cpSync(path.join(FIXTURES, "content/commodities"), path.join(root, "content/commodities"), { recursive: true });
  return root;
};

const writeItem = (root: string, rel: string, text: string) => {
  const file = path.join(root, "content", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

describe("content loading and publication rules", () => {
  const { entries, unpublished } = loadContent(FIXTURES);
  const alpha = entries.find((e) => e.slug === "alpha-offer")!;

  it("publishes en and ru, holds back zh without reviewed: true, skips drafts", () => {
    expect(entries.filter((e) => !["procedures", "documents"].includes(e.collection) && e.kind !== "mandate").map((e) => e.slug)).toEqual([
      "launch",
      "alpha-offer",
      "beta-structure",
    ]);
    expect(Object.keys(alpha.versions).sort()).toEqual(["en", "ru"]);
    expect(entries.some((e) => e.slug === "gamma-draft")).toBe(false);
    expect(unpublished).toContain("insights/alpha-offer/zh: not reviewed (zh needs reviewed: true)");
  });

  it("sorts newest first and takes shared fields from en.md", () => {
    expect(entries.map((e) => e.date)).toEqual([...entries.map((e) => e.date)].sort().reverse());
    expect(alpha.commodity).toEqual(["copper"]);
    expect(alpha.versions.ru?.title).toBe("Альфа: как читать оферту");
  });

  it("checks the real content folder without errors", () => {
    expect(() => loadContent(PROJECT)).not.toThrow();
  });

  it("reports file, field and reason for every problem", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kps-content-"));
    writeItem(root, "insights/bad-item/en.md", '---\ntitle: "T"\ndescription: "D"\ndate: "2026-02-30"\nline: trading\nprice: 1\n---\n\n# H1\n');
    writeItem(root, "insights/bad-item/ru.md", '---\ntitle: "T"\ndescription: "D"\ndate: "2026-01-01"\n---\n\nText\n');
    writeItem(root, "news/Bad_Slug/en.md", "---\ntitle: x\n---\n\nx\n");
    writeItem(
      root,
      "procedures/two-steps/en.md",
      '---\ntitle: "T"\ndescription: "D"\naudience: buyer\nupdated: "2026-01-01"\nversion: "1.0"\nsteps:\n  - { title: a, actor: b, document: c, receives: d }\n  - { title: a, actor: b, document: c, receives: d }\n---\n\nText\n',
    );
    writeItem(
      root,
      "procedures/two-steps/ru.md",
      '---\ntitle: "T"\ndescription: "D"\nsteps:\n  - { title: a, actor: b, document: c, receives: d }\n---\n\nText\n',
    );
    writeItem(
      root,
      "procedures/bad-audience/en.md",
      '---\ntitle: "T"\ndescription: "D"\naudience: [buyer, broker]\nupdated: "2026-01-01"\nversion: "1.0"\nsteps:\n  - { title: a, actor: b, document: c, receives: d }\n---\n\nText\n',
    );
    writeItem(root, "commodities/aluminium/en.md", '---\ntitle: "T"\n---\n\nText\n');
    writeItem(
      root,
      "commodities/lng/en.md",
      '---\nformat: short\ntitle: "T"\ndescription: "D"\nsummary: "S"\nchecks: [a]\n---\n\nOne.\n\nTwo.\n\nThree.\n',
    );
    try {
      loadContent(root);
      throw new Error("expected a ContentError");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      const problems = (error as ContentError).problems.join("\n");
      expect(problems).toContain("content/insights/bad-item/en.md › date: not a real calendar date");
      expect(problems).toContain("content/insights/bad-item/en.md › line:");
      expect(problems).toContain('content/insights/bad-item/en.md › (frontmatter): unknown field(s) "price"');
      expect(problems).toContain('content/insights/bad-item/en.md › body: "# " headings are not allowed');
      expect(problems).toContain('content/insights/bad-item/ru.md › (frontmatter): unknown field(s) "date"');
      expect(problems).toContain("content/news/Bad_Slug › folder name");
      expect(problems).toContain("content/procedures/two-steps/ru.md › steps: 1 step(s), en.md has 2");
      expect(problems).toContain("content/commodities/aluminium/en.md › description: is required");
      expect(problems).toContain("content/commodities/copper/en.md › file: every commodity needs en.md, ru.md and zh.md");
      expect(problems).toContain('content/commodities/lng/en.md › (frontmatter): unknown field(s) "checks"');
      expect(problems).toContain("content/procedures/bad-audience/en.md › audience: expected buyer, seller, investor, or a list of them");
      expect(problems).toContain("content/commodities/lng/en.md › body: a short page has two paragraphs");
    }
  });
});

describe("commodity pages and procedures", () => {
  it("loads every commodity in every language from the real content folder", () => {
    const { commodities } = loadContent(PROJECT);
    for (const { id } of canon.commodities) {
      for (const language of LANGUAGES) {
        const page = commodities[id][language];
        expect(page.title, `${id}/${language}`).toBeTruthy();
        expect(page.description.length).toBeLessThanOrEqual(160);
      }
    }
    const titles = Object.values(commodities).flatMap((pages) => Object.values(pages).map((p) => p.title));
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("keeps the same steps in every language of a procedure", () => {
    const { entries } = loadContent(FIXTURES);
    const procedure = entries.find((e) => e.collection === "procedures")!;
    expect(procedure.audience).toEqual(["buyer", "seller"]);
    expect(Object.keys(procedure.versions).sort()).toEqual(["en", "ru"]);
  });
});

describe.skipIf(!forbidden)("restricted strings in content", () => {
  const list = forbidden!;
  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? files(path.join(dir, d.name)) : d.name.endsWith(".md") ? [path.join(dir, d.name)] : [],
    );
  const contentFiles = files(path.join(PROJECT, "content"));

  it("are absent from every content file, drafts included", () => {
    for (const file of contentFiles) {
      const text = fs.readFileSync(file, "utf8");
      for (const item of [...list.everywhere, ...list.outsideHistory]) expect(text, `${file}: ${item}`).not.toContain(item);
      for (const phrase of list.phrases) expect(text.toLowerCase(), `${file}: ${phrase}`).not.toContain(phrase.toLowerCase());
    }
  });

  it("name no country of origin on commodity pages and procedures", () => {
    for (const file of contentFiles.filter((f) => /content\/(commodities|procedures)\//.test(f))) {
      const text = fs.readFileSync(file, "utf8");
      for (const country of list.originCountries) expect(text, `${file}: ${country}`).not.toContain(country);
    }
  });
});

describe("mandates", () => {
  const { mandates, entries } = loadContent(FIXTURES, { today: "2026-10-07" });

  it("closes expired mandates and lists closed ones last", () => {
    expect(mandates.map((m) => [m.id, m.status])).toEqual([
      ["KPS-M-2026-001", "open"],
      ["KPS-M-2026-002", "in-work"],
      ["KPS-M-2026-003", "closed"],
    ]);
  });

  it("announces each open mandate in the news, in the languages it has a description for", () => {
    const news = entries.filter((e) => e.kind === "mandate");
    expect(news.map((e) => e.slug)).toEqual(["mandate-kps-m-2026-001"]);
    expect(news[0].collection).toBe("news");
    expect(news[0].date).toBe("2026-10-03");
    expect(Object.keys(news[0].versions).sort()).toEqual(["en", "ru"]);
    expect(news[0].versions.ru?.title).toBe("Предложение: Алюминий, мандат KPS-M-2026-001");
    expect(news[0].bodies.ru?.html).toContain('href="/ru/mandates/kps-m-2026-001/"');
  });

  it("lists the mandate list and pages in the sitemap only when mandates are published", () => {
    const xml = buildSitemap(sitemapPages(entries, mandates));
    expect(xml).toContain("<loc>https://kpsglobal.id/zh/mandates/</loc>");
    expect(xml).toContain("<loc>https://kpsglobal.id/ru/mandates/kps-m-2026-002/</loc>");
    expect(buildSitemap(sitemapPages(entries, []))).not.toContain("/mandates/");
  });

  it("stops the build on extra fields, prices, currencies, countries and blocked names, naming file and line", () => {
    const root = tempRoot();
    const mandate = (lines: string[]) => ["---", ...lines, "---", ""].join("\n");
    const valid = [
      "id: KPS-M-2026-010",
      "side: supply",
      "commodity: lng",
      'volume: "V"',
      "basis: FOB",
      "originRegion: Gulf",
      "instrument: DLC",
      "status: open",
      'published: "2026-10-01"',
      'validUntil: "2026-12-01"',
    ];
    writeItem(root, "mandates/kps-m-2026-010/en.md", mandate([...valid, "price: 100", 'description: "Below 5 a unit, pay in $"']));
    writeItem(root, "mandates/kps-m-2026-011/en.md", mandate([...valid.map((l) => l.replace("originRegion: Gulf", "originRegion: Qatar").replace("010", "011")), 'description: "Fine, via Acme Holding"']));
    writeItem(root, "mandates/kps-m-2026-014/en.md", mandate([...valid.map((l) => l.replace("010", "015")), 'description: "D"']));
    writeItem(root, "mandates/kps-m-2026-013/en.md", mandate([...valid.map((l) => l.replace("010", "013")), 'description: "D"']) + "Free text\n");
    writeItem(root, "mandates/bad/en.md", mandate(valid));
    fs.mkdirSync(path.join(root, "_internal"));
    fs.writeFileSync(path.join(root, "_internal/blocked-names.json"), JSON.stringify(["acme holding"]));
    try {
      loadContent(root, { today: "2026-10-07" });
      throw new Error("expected a ContentError");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      const problems = (error as ContentError).problems.join("\n");
      expect(problems).toContain('content/mandates/kps-m-2026-010/en.md › (frontmatter): unknown field(s) "price"');
      expect(problems).toContain('content/mandates/kps-m-2026-010/en.md:12 › text: "price" next to a number');
      expect(problems).toContain('content/mandates/kps-m-2026-010/en.md:13 › text: currency "$"');
      expect(problems).toContain('content/mandates/kps-m-2026-010/en.md:13 › text: "Below" next to a number');
      expect(problems).toContain("content/mandates/kps-m-2026-011/en.md › originRegion: expected a region, not a country");
      expect(problems).toContain('content/mandates/kps-m-2026-014/en.md › id: "KPS-M-2026-015" does not match the folder name');
      expect(problems).toContain("content/mandates/kps-m-2026-011/en.md:12 › text: contains a blocked counterparty name");
      expect(problems).not.toContain("Acme");
      expect(problems).toContain("content/mandates/kps-m-2026-013/en.md › body: a mandate has no text outside the frontmatter");
      expect(problems).toContain("content/mandates/bad › folder name");
    }
  });

  it("skips the blocked-names check without the list", () => {
    const root = tempRoot();
    writeItem(
      root,
      "mandates/kps-m-2026-020/en.md",
      '---\nid: KPS-M-2026-020\nside: demand\ncommodity: lng\nvolume: "V"\nbasis: DAP\noriginRegion: Other\ninstrument: SBLC\nstatus: open\npublished: "2026-10-01"\nvalidUntil: "2026-12-01"\ndescription: "Via Acme Holding"\n---\n',
    );
    expect(loadContent(root, { today: "2026-10-07" }).mandates).toHaveLength(1);
  });
});

describe("markdown", () => {
  it("escapes raw HTML and drops javascript: links", () => {
    const { html } = renderMarkdown('<script>alert(1)</script> [x](javascript:alert(1)) [y](https://example.com)');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">');
  });

  it("estimates reading time", () => {
    expect(readingMinutes("word ".repeat(450))).toBe(3);
    expect(readingMinutes("字".repeat(800))).toBe(2);
  });
});

describe("feeds, sitemap and previews", () => {
  const { entries } = loadContent(FIXTURES);

  it("lists sections and items only in languages with their own text", () => {
    const xml = buildSitemap(sitemapPages(entries));
    expect(xml).toContain("<loc>https://kpsglobal.id/ru/insights/alpha-offer/</loc>");
    expect(xml).not.toContain("<loc>https://kpsglobal.id/zh/insights/alpha-offer/</loc>");
    expect(xml).toContain("<loc>https://kpsglobal.id/zh/insights/</loc>");
    expect(buildSitemap(sitemapPages([]))).not.toContain("/insights/");
  });

  it("builds an RSS feed per language", () => {
    const strings = { title: "T & co", description: "D", categories: { insights: "Insight", news: "News" } };
    const ru = buildFeed("ru", entries, strings);
    expect(ru).toContain("<title>T &amp; co</title>");
    expect(ru.match(/<item>/g)).toHaveLength(2);
    expect(ru).toContain("<link>https://kpsglobal.id/ru/news/mandate-kps-m-2026-001/</link>");
    expect(ru).toContain("<link>https://kpsglobal.id/ru/insights/alpha-offer/</link>");
    expect(buildFeed("zh", entries, strings)).not.toContain("<item>");
  });

  it("uses the cover, else an image generated for the shown language", () => {
    expect(previewImage({ slug: "a", cover: "/covers/a.png" }, "en")?.path).toBe("/covers/a.png");
    expect(previewImage({ slug: "a" }, "ru")?.path).toBe("/og/a-ru.png");
    expect(previewImage({ slug: "a" }, "zh")?.path).toBe("/og/a-zh.png");
  });
});

describe("content pages", () => {
  it("renders an article with its own text, author and LinkedIn block", async () => {
    await renderAt("/ru/insights/alpha-offer/");
    expect(screen.getByRole("heading", { level: 1, name: "Альфа: как читать оферту" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 2, name: "Кто подписывает" })).toBeInTheDocument();
    expect(screen.getByText("Андрей Орлов")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Открыть пост в LinkedIn/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/posts/fixture",
    );
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute("content", "article");
    expect(document.querySelector('meta[property="article:published_time"]')).toHaveAttribute("content", "2026-10-05");
  });

  it("shows the English text under /zh/ when zh is not reviewed, without a zh hreflang", async () => {
    await renderAt("/zh/insights/alpha-offer/");
    expect(screen.getByRole("heading", { level: 1, name: "Alpha: reading an offer" })).toBeInTheDocument();
    expect(await screen.findByText("本文中文版正在准备中，以下为英文原文。")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://kpsglobal.id/insights/alpha-offer/",
      ),
    );
    const hreflangs = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute("hreflang"));
    expect(hreflangs.sort()).toEqual(["en", "ru", "x-default"]);
  });

  it("never renders raw HTML from Markdown", async () => {
    await renderAt("/insights/alpha-offer/");
    await screen.findByRole("heading", { level: 2, name: "Who signs" });
    expect(document.querySelector("article script")).toBeNull();
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
  });

  it("opens internal links in the text through the router, external ones in a new tab", async () => {
    const router = await renderAt("/insights/alpha-offer/");
    const internal = await screen.findByRole("link", { name: "our services" });
    const external = screen.getByRole("link", { name: "an outside page" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external.getAttribute("rel")).toContain("noopener");
    fireEvent.click(internal);
    await waitFor(() => expect(router.state.location.pathname).toBe("/services/"));
  });

  it("lists insights newest first", async () => {
    await renderAt("/insights/");
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Alpha: reading an offer", "Beta: structuring a copper deal"]);
  });

  it("links related insights by commodity", async () => {
    await renderAt("/insights/alpha-offer/");
    expect(await screen.findByRole("heading", { level: 3, name: "Beta: structuring a copper deal" })).toBeInTheDocument();
  });

  it("links a news item to its related items", async () => {
    await renderAt("/news/launch/");
    expect(await screen.findByRole("heading", { level: 3, name: "Alpha: reading an offer" })).toBeInTheDocument();
  });

  it("shows the latest insights on the home page", async () => {
    await renderAt("/");
    expect(document.getElementById("insights")).not.toBeNull();
  });

  it("renders a commodity page with its sections, origin rule and contact link", async () => {
    await renderAt("/ru/commodities/copper/");
    expect(screen.getByRole("heading", { level: 1, name: "Медь fixture page" })).toBeInTheDocument();
    expect(screen.getByText("Только товар несанкционного происхождения. Санкционный скрининг всех сторон обязателен.")).toBeInTheDocument();
    for (const heading of ["Сделка глазами покупателя", "Что мы проверяем у продавца", "Типовая структура", "Маршрут документов по шагам", "На чём такие сделки останавливаются"]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /Обсудить сделку/ })).toHaveAttribute(
      "href",
      `/ru/contact/?topic=${encodeURIComponent("Медь fixture page")}`,
    );
    // A procedure without a commodity list applies to every commodity.
    expect(screen.getByRole("heading", { level: 3, name: "Шаги покупателя" })).toBeInTheDocument();
  });

  it("renders a short commodity page: two paragraphs, the origin line and a contact link", async () => {
    await renderAt("/commodities/diesel/");
    expect(screen.getByRole("heading", { level: 1, name: "Diesel short en" })).toBeInTheDocument();
    expect(await screen.findByText("Second paragraph en.")).toBeInTheDocument();
    expect(screen.getByText("Only goods of non-sanctioned origin. Sanctions screening of all parties is mandatory.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "Typical structure" })).toBeNull();
    expect(screen.getByRole("link", { name: /Discuss the deal/ })).toHaveAttribute(
      "href",
      `/contact/?topic=${encodeURIComponent("Diesel short en")}`,
    );
    await waitFor(() =>
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "index, follow, max-image-preview:large"),
    );
  });

  it("renders procedure steps: who acts, which document, what the other side receives", async () => {
    await renderAt("/procedures/buyer-steps/");
    expect(await screen.findByRole("heading", { level: 3, name: "Send the request" })).toBeInTheDocument();
    expect(screen.getByText("For buyers · For sellers")).toBeInTheDocument();
    expect(screen.getAllByText("Who acts")).toHaveLength(2);
    expect(screen.getByText("The seller receives a request.")).toBeInTheDocument();
  });

  it("lists mandates with closed ones last and muted", async () => {
    await renderAt("/mandates/");
    const cards = screen.getAllByRole("heading", { level: 3 }).map((h) => h.closest("a")!);
    expect(cards.map((a) => a.getAttribute("href"))).toEqual([
      "/mandates/kps-m-2026-001/",
      "/mandates/kps-m-2026-002/",
      "/mandates/kps-m-2026-003/",
    ]);
    expect(cards[2].className).toContain("opacity-60");
  });

  it("shows a mandate card, the way to the details and a request form with the number", async () => {
    await renderAt("/ru/mandates/kps-m-2026-001/");
    expect(screen.getByRole("heading", { level: 1, name: "Предложение: Алюминий" })).toBeInTheDocument();
    for (const value of ["KPS-M-2026-001", "Fixture volume", "CIF (Incoterms 2020)", "Залив", "Документарный аккредитив"]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
    for (const step of ["Запрос", "KYC", "NDA", "Детали"]) {
      expect(screen.getByRole("heading", { level: 3, name: step })).toBeInTheDocument();
    }
    expect(screen.getByText(/действует по мандату как независимый консультант/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Как проходит сделка/ })).toHaveAttribute("href", "/ru/procedures/");
    expect(screen.getByLabelText("Тема")).toHaveValue("KPS-M-2026-001");
    expect(screen.getByLabelText("Я обращаюсь как")).toBeRequired();
  });

  it("shows open mandates on the home page and on the commodity page", async () => {
    await renderAt("/");
    expect(document.querySelector('#mandates a[href="/mandates/kps-m-2026-001/"]')).not.toBeNull();
    expect(document.querySelector('#mandates a[href="/mandates/kps-m-2026-002/"]')).toBeNull();
  });

  it("returns 404 content for an unknown slug", async () => {
    await renderAt("/insights/no-such-article/");
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });
});
