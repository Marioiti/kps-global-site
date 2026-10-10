import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { allTranslations as translations } from "@/i18n/all-strings";
import { interpolate } from "@/i18n/translations";
import { LANGUAGES } from "@/i18n/locales";
import { canon, formatPrice } from "@/data/canon";
import { ContentError, loadContent } from "@/content/load";

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

describe("services menu", () => {
  it("opens with Enter, moves with the arrows and closes with Escape back on the button", async () => {
    await renderAt("/");
    const button = screen.getByRole("button", { name: "Services" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(button, { key: "Enter" });
    await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "true"));
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    const links = within(panel).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/services/deal-structuring/",
      "/services/compliance-kyc/",
      "/services/fractional-coo/",
      "/services/",
    ]);
    await waitFor(() => expect(links[0]).toHaveFocus());

    fireEvent.keyDown(links[0], { key: "ArrowDown" });
    expect(links[1]).toHaveFocus();
    fireEvent.keyDown(links[1], { key: "ArrowUp" });
    fireEvent.keyDown(links[0], { key: "ArrowUp" });
    expect(links[3]).toHaveFocus();

    fireEvent.keyDown(links[3], { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
    expect(panel).not.toBeVisible();
  });

  it("puts the proposal button and the email at the bottom of the mobile menu", async () => {
    await renderAt("/ru/");
    fireEvent.click(screen.getByRole("button", { name: translations.ru["nav.openMenu"] }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("link", { name: translations.ru["cta.proposal"] })).toHaveAttribute("href", "/ru/contact/?intent=proposal");
    expect(within(dialog).getByRole("link", { name: canon.contacts.email })).toHaveAttribute("href", `mailto:${canon.contacts.email}`);
    expect(within(dialog).getByText(translations.ru["menu.coo.desc"])).toBeInTheDocument();
    expect(within(dialog).queryByText(/\+62|\+7 914/)).toBeNull();
  });

  it("closes the mobile menu with a button in the page's language and returns focus to the menu button", async () => {
    await renderAt("/zh/");
    const menuButton = screen.getByRole("button", { name: translations.zh["nav.openMenu"] });
    fireEvent.click(menuButton);
    const dialog = await screen.findByRole("dialog");
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(within(dialog).getByRole("button", { name: translations.zh["nav.closeMenu"] }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });
});

describe("header and footer", () => {
  it("show the seal with the name, four menu items, and one line of company details", async () => {
    await renderAt("/");
    const header = document.querySelector("header")!;
    expect(within(header).getByRole("link", { name: canon.brand })).toHaveAttribute("href", "/");
    const nav = within(header).getByRole("navigation", { name: translations.en["nav.main"] });
    expect(within(nav).getByRole("button", { name: "Services" })).toBeInTheDocument();
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["/commodities/", "/documents/", "/about/"]);
    expect(within(header).getByRole("link", { name: translations.en["cta.proposal"] })).toHaveAttribute("href", "/contact/?intent=proposal");
    const footer = document.querySelector("footer")!;
    expect(footer).toHaveTextContent(`${canon.legal.name} · NIB ${canon.legal.nib} · KBLI ${canon.legal.kbli.code}`);
    expect(within(footer).getByRole("link", { name: translations.en["footer.privacy"] })).toHaveAttribute("href", "/privacy/");
    expect(within(footer).getByRole("link", { name: "WeChat" })).toHaveAttribute("href", "/contact/#wechat");
    expect(footer).not.toHaveTextContent(/Reputation over speed|Independent/);
  });
});

describe("home page", () => {
  it("leads with the seal, the promise and two actions: send the offer, request a proposal", async () => {
    await renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: translations.en["home.title"] })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: translations.en["seal.label"] }).length).toBeGreaterThan(0);
    const hero = screen.getByRole("heading", { level: 1 }).parentElement!;
    // jest-dom collapses the no-break space in the price to a plain one.
    const price = canon.products.offerCheck.priceFrom.replace(/\u00a0/g, " ");
    expect(hero).toHaveTextContent(`In ${canon.products.offerCheck.turnaroundHours} hours`);
    expect(hero).toHaveTextContent(`From ${price}`);
    const actions = within(hero).getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")]);
    expect(actions).toEqual([
      [translations.en["cta.sendOffer"], "/contact/?service=offer-check"],
      [translations.en["cta.proposal"], "/contact/?intent=proposal"],
    ]);
  });

  it("has the sections of the dossier in order, numbered with financial numerals", async () => {
    await renderAt("/");
    expect([...document.querySelectorAll("main section[id]")].map((s) => s.id)).toEqual(["sample", "what", "cases", "quote", "questions"]);
    expect(document.getElementById("what")).toHaveTextContent("壹");
    expect(document.getElementById("questions")).toHaveTextContent("肆");
    expect(document.querySelector("main details")).toBeNull();
  });

  it("shows a sample verdict with each result in words and a stop stamp", async () => {
    await renderAt("/");
    const sheet = document.getElementById("sample")!;
    const rows = within(sheet).getAllByRole("row").map((r) => r.lastElementChild!.textContent);
    expect(rows).toEqual(["Pass", "Pass", "Fail", "Open"]);
    expect(within(sheet).getByRole("img", { name: translations.en["stamp.stop"] })).toBeInTheDocument();
    expect(sheet).toHaveTextContent(translations.en["verdict.sample"]);
  });

  it("lists the three services with their terms and a proposal link each", async () => {
    await renderAt("/ru/");
    const what = document.getElementById("what")!;
    expect(within(what).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      translations.ru["menu.deals.title"],
      translations.ru["menu.kyc.title"],
      translations.ru["menu.coo.title"],
    ]);
    const proposals = within(what).getAllByRole("link", { name: translations.ru["cta.proposal"] }).map((a) => a.getAttribute("href"));
    expect(proposals).toEqual([
      "/ru/contact/?intent=proposal&service=deal-structuring",
      "/ru/contact/?intent=proposal&service=compliance-kyc",
      "/ru/contact/?intent=proposal&service=fractional-coo",
    ]);
    expect(what).toHaveTextContent(`${canon.products.kycCheck.turnaroundBusinessDays} рабочих дней`);
  });

  it("shows the first three cases by order, each with a stamp and its figure", async () => {
    await renderAt("/ru/");
    const section = document.getElementById("cases")!;
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
    expect(within(section).getAllByRole("img").map((img) => img.getAttribute("aria-label"))).toEqual(
      expect.arrayContaining([translations.ru["stamp.stop"]]),
    );
    expect(section).toHaveTextContent("USD 480,000");
    expect(section).toHaveTextContent("сохранены клиенту");
    expect(section).toHaveTextContent("Сера, Персидский залив → Китай, 2025.");
  });

  it("quotes the director with his photo and links to the company page", async () => {
    await renderAt("/");
    const quote = document.getElementById("quote")!;
    expect(within(quote).getByRole("img")).toHaveAttribute("src", canon.founder!.photo!.replace(/\.jpg$/, "-600.jpg"));
    expect(quote).toHaveTextContent(translations.en["home.quote"]);
    expect(quote).toHaveTextContent(`${canon.founder!.name.en}, Director`);
    expect(within(quote).getByRole("link", { name: translations.en["home.quoteLink"] })).toHaveAttribute("href", "/about/");
  });

  it("publishes the questions as FAQPage data with exactly the questions and answers on the page", async () => {
    await renderAt("/zh/");
    const visible = [...document.querySelectorAll("#questions dl > div")].map((d) => ({
      question: d.querySelector("dt")!.textContent,
      answer: d.querySelector("dd")!.textContent,
    }));
    expect(visible).toHaveLength(4);
    await waitFor(() => expect(document.head.innerHTML).toContain('"FAQPage"'));
    const data = [...document.head.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((d) => d["@type"] === "FAQPage");
    expect(
      data.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ question: q.name, answer: q.acceptedAnswer.text })),
    ).toEqual(visible);
  });

});

describe("prices", () => {
  /** Every price the canon publishes; a null price (not set yet) adds nothing. */
  const ALLOWED = Object.values(canon.products)
    .map((product) => ("priceFrom" in product ? product.priceFrom : null))
    .filter((price): price is string => Boolean(price));
  /** A sum in a currency: "USD 1,000", "$2B+", "1 000 руб.", "3500 万美元"… */
  const MONEY =
    /(?:USD|US\$|EUR|GBP|CNY|RMB|IDR|RUB|[$€£¥₽])\s?\d[\d.,\s]*(?:[KMB]\b|млн|млрд|万|亿)?|\d[\d.,\s]*\s?(?:USD|EUR|GBP|CNY|RMB|IDR|RUB|руб|долл|美元|元|万美元)/gi;
  /** The interface strings fill prices in the page's language (see formatPrice). */
  const varsFor = (language: (typeof LANGUAGES)[number]) => ({
    brand: canon.brand,
    legalName: canon.legal.name,
    email: canon.contacts.email,
    offerPrice: formatPrice(canon.products.offerCheck.priceFrom, language),
    offerHours: canon.products.offerCheck.turnaroundHours,
    healthPrice: formatPrice(canon.products.dealHealthCheck.priceFrom, language),
    healthDays: canon.products.dealHealthCheck.turnaroundBusinessDays,
    creditDays: canon.products.dealHealthCheck.creditDays,
    kycDays: canon.products.kycCheck.turnaroundBusinessDays,
    kycPrice: formatPrice(canon.products.kycCheck.priceFrom ?? "", language),
  });

  it("are only the allowed lines in every interface string, in the format of the language", () => {
    for (const language of LANGUAGES) {
      const allowed = ALLOWED.map((price) => formatPrice(price, language));
      const found = new Set<string>();
      for (const [key, value] of Object.entries(translations[language])) {
        for (const match of interpolate(value, varsFor(language)).match(MONEY) ?? []) found.add(`${key}: ${match.replace(/[.,\s]+$/, "")}`);
      }
      const amounts = [...found].map((line) => line.split(": ")[1]);
      expect(amounts.every((amount) => allowed.includes(amount)), `${language}\n${[...found].join("\n")}`).toBe(true);
      expect(new Set(amounts), language).toEqual(new Set(allowed));
    }
    // Offer Check, Deal Health Check and the counterparty check; Russian groups thousands with a space.
    expect(ALLOWED.map((price) => price.replace(/\u00a0/g, " "))).toEqual(["USD 1,000", "USD 3,500", "USD 500"]);
    expect(ALLOWED.map((price) => formatPrice(price, "ru").replace(/\u00a0/g, " "))).toEqual(["USD 1 000", "USD 3 500", "USD 500"]);
  });

  it("never appear in content files, except USD sums in the metricValue of a case", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".md")) {
          const isCase = full.includes(`${path.sep}cases${path.sep}`);
          fs.readFileSync(full, "utf8")
            .split("\n")
            .forEach((line) => {
              const money = line.match(MONEY) ?? [];
              const inMetric = isCase && line.startsWith("metricValue:");
              for (const match of money) {
                if (!inMetric || !/^USD\s?\d/.test(match.trim())) hits.push(`${path.relative(PROJECT, full)}: ${match}`);
              }
            });
        }
      }
    };
    walk(path.join(PROJECT, "content"));
    expect(hits).toEqual([]);
  });

  it("are caught when someone adds another one", () => {
    expect("from USD 2,500".match(MONEY)).toEqual(["USD 2,500"]);
    expect(`from ${canon.products.offerCheck.priceFrom}`.match(MONEY)).toEqual([canon.products.offerCheck.priceFrom]);
    expect("скидка 5 000 руб.".match(MONEY)?.length).toBe(1);
    expect("报价 3500 万美元".match(MONEY)?.length).toBe(1);
  });
});

describe("cases", () => {
  it("loads published fixture cases by order and keeps drafts out", () => {
    const { cases, unpublished } = loadContent(FIXTURES);
    expect(cases.map((c) => c.slug)).toEqual(["case-901", "case-902", "case-903", "case-905"]);
    expect(cases[0]).toMatchObject({ order: 1, year: 2025, commodityId: "sulphur", services: ["compliance-kyc", "deal-structuring"] });
    expect(cases[1].services).toEqual(["deal-structuring"]);
    expect(cases[1].commodityId).toBeUndefined();
    expect(cases[0].texts.ru).toMatchObject({ metricValue: "USD 480,000", metricLabel: "сохранены клиенту" });
    expect(cases[1].texts.ru).toBeUndefined();
    expect(unpublished).toContain("cases/case-904: draft (en.md), not published");
  });

  it("stops the build on a country of origin, money outside the metric, other currencies, extra fields and body text", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kps-cases-"));
    fs.cpSync(path.join(FIXTURES, "content/commodities"), path.join(root, "content/commodities"), { recursive: true });
    const write = (rel: string, lines: string[], body = "") => {
      const file = path.join(root, "content/cases", rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, ["---", ...lines, "---", body].join("\n"));
    };
    const base = ["order: 1", 'commodity: "Sulphur"', 'title: "T"', 'action: "A"', 'result: "R"'];
    write("case-910/en.md", [...base, 'route: "Qatar → China"', 'problem: "P"']);
    write("case-911/en.md", [...base, 'route: "Gulf → China"', 'problem: "Saved $200 a tonne"', 'metricValue: "EUR 5,000"', "client: X"], "Text");
    write("case-912/en.md", [...base, 'route: "Gulf → China"', 'problem: "P"', 'metricValue: "USD 10M+ / month"', 'metricLabel: "protected"']);
    try {
      loadContent(root);
      throw new Error("expected a ContentError");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      const problems = (error as ContentError).problems.join("\n");
      expect(problems).toContain("content/cases/case-910/en.md › route: the route starts in a region");
      expect(problems).toMatch(/content\/cases\/case-911\/en\.md:\d+ › text: currency "\$" is allowed only in metricValue/);
      expect(problems).toMatch(/content\/cases\/case-911\/en\.md:\d+ › metricValue: sums only in USD/);
      expect(problems).toContain('content/cases/case-911/en.md › (frontmatter): unknown field(s) "client"');
      expect(problems).toContain("content/cases/case-911/en.md › body: a case has no text outside the frontmatter");
      expect(problems).not.toContain("case-912");
    }
  });
});
