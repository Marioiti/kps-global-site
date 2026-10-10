import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { allTranslations as translations } from "@/i18n/all-strings";
import { canon } from "@/data/canon";

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

const jsonLd = async (type: string) => {
  await waitFor(() => expect(document.head.innerHTML).toContain(`"${type}"`));
  return [...document.head.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => JSON.parse(s.textContent!))
    .find((d) => d["@type"] === type);
};

const visibleFaq = () =>
  [...document.querySelectorAll("#faq dl > div")].map((d) => ({
    question: d.querySelector("dt")!.textContent,
    answer: d.querySelector("dd")!.textContent,
  }));

/** jest-dom and the DOM text collapse the no-break space in prices. */
const plain = (value: string) => value.replace(/\u00a0/g, " ");

describe("service pages", () => {
  it("show the sign, the numbered sections in order, the cases of the service and a proposal for it", async () => {
    await renderAt("/services/deal-structuring/");
    expect(screen.getByRole("heading", { level: 1, name: translations.en["svc.deal.title"] })).toBeInTheDocument();
    expect(document.querySelector("main")).toHaveTextContent("合同");
    const ids = [...document.querySelectorAll("main section[id]")].map((s) => s.id);
    expect(ids).toEqual(["when", "how", "fees", "results", "faq"]);
    expect(document.getElementById("faq")).toHaveTextContent("伍");
    const results = document.getElementById("results")!;
    expect(within(results).getAllByRole("listitem")).toHaveLength(4);
    expect(within(results).getByRole("link", { name: translations.en["home.cases.all"] })).toHaveAttribute("href", "/about/#cases");
    expect(document.getElementById("how")).toHaveTextContent(translations.en["svc.deal.step4.desc"]);
    const proposals = screen.getAllByRole("link", { name: translations.en["cta.proposal"] }).map((a) => a.getAttribute("href"));
    expect(proposals).toContain("/contact/?intent=proposal&service=deal-structuring");
    expect(screen.getByRole("link", { name: translations.en["cta.sendOffer"] })).toHaveAttribute("href", "/contact/?service=offer-check");
  });

  it("show the fees as a table: work, time, fee, with prices from the canon and a proposal where there is none", async () => {
    await renderAt("/services/deal-structuring/");
    const table = within(document.getElementById("fees")!).getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Work", "Time", "Fee"]);
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent(plain(`${canon.products.offerCheck.turnaroundHours} hours`));
    expect(rows[0]).toHaveTextContent(plain(`from ${canon.products.offerCheck.priceFrom}`));
    expect(rows[1]).toHaveTextContent(plain(`from ${canon.products.dealHealthCheck.priceFrom}`));
    expect(within(rows[2]).getByRole("link", { name: translations.en["cta.proposal"] })).toBeInTheDocument();
  });

  it("write prices the Russian way on Russian pages", async () => {
    await renderAt("/ru/services/deal-structuring/");
    expect(document.getElementById("fees")).toHaveTextContent("от USD 1 000");
    expect(document.getElementById("fees")).toHaveTextContent("от USD 3 500");
  });

  it("leave the cases out when none belongs to the service, and show no prices outside the checks", async () => {
    await renderAt("/ru/services/fractional-coo/");
    expect(document.getElementById("results")).toBeNull();
    expect(document.getElementById("faq")).toHaveTextContent("肆");
    expect(document.querySelector("main")).not.toHaveTextContent(/USD/);
    expect(screen.queryByRole("link", { name: translations.ru["cta.sendOffer"] })).toBeNull();
  });

  it("show the compliance cases", async () => {
    await renderAt("/services/compliance-kyc/");
    expect(within(document.getElementById("results")!).getAllByRole("listitem")).toHaveLength(1);
  });

  it("describe the service as Service data, provided by the organisation, without a price", async () => {
    await renderAt("/zh/services/compliance-kyc/");
    const data = await jsonLd("Service");
    expect(data).toMatchObject({
      name: translations.zh["menu.kyc.title"],
      serviceType: "Compliance, KYC and sanctions screening",
      url: "https://kpsglobal.id/zh/services/compliance-kyc/",
      provider: { "@id": "https://kpsglobal.id/#organization" },
    });
    expect(data.areaServed.map((p: { name: string }) => p.name)).toEqual(["Gulf", "Central Asia", "China", "Southeast Asia"]);
    expect(JSON.stringify(data)).not.toMatch(/offers|price|USD/i);
  });

  it("publish their questions as FAQPage data matching the visible ones", async () => {
    await renderAt("/ru/services/deal-structuring/");
    const data = await jsonLd("FAQPage");
    const fromData = data.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ question: q.name, answer: q.acceptedAnswer.text }));
    expect(fromData.map((q: { answer: string }) => ({ ...q, answer: plain(q.answer) }))).toEqual(
      visibleFaq().map((q) => ({ ...q, answer: plain(q.answer!) })),
    );
    expect(fromData.length).toBeGreaterThanOrEqual(4);
    expect(fromData.map((q: { question: string }) => q.question)).toContain(translations.ru["svc.deal.q6"]);
  });

  it("prefill the contact topic from ?service=", async () => {
    await renderAt("/ru/contact/?service=fractional-coo");
    await waitFor(() => expect(screen.getByLabelText(new RegExp(translations.ru["contact.need"].replace("?", "\\?")))).toHaveValue("fractional-coo"));
  });
});

describe("/services/", () => {
  it("lists the three services with their terms and compares them in a table", async () => {
    await renderAt("/services/");
    const list = document.getElementById("services-list")!;
    expect(within(list).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      translations.en["menu.deals.title"],
      translations.en["menu.kyc.title"],
      translations.en["menu.coo.title"],
    ]);
    const table = within(document.getElementById("compare")!).getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      translations.en["menu.deals.title"],
      translations.en["menu.kyc.title"],
      translations.en["menu.coo.title"],
    ]);
    expect(within(table).getAllByRole("rowheader")).toHaveLength(5);
    const data = await jsonLd("FAQPage");
    expect(data.mainEntity.map((q: { name: string }) => q.name)).toEqual(visibleFaq().map((q) => q.question));
  });
});

describe("service terms", () => {
  it("show the Fractional COO retainer terms and answer how long and how much time", async () => {
    await renderAt("/services/fractional-coo/");
    const { minMonths, daysPerWeek, noticeDays } = canon.products.fractionalCoo;
    const fees = document.getElementById("fees")!;
    expect(fees).toHaveTextContent(`Monthly retainer, ${daysPerWeek} days a week. Either side can end it with ${noticeDays} days' notice.`);
    expect(fees).toHaveTextContent(`from ${minMonths} months`);
    expect(visibleFaq().map((q) => q.question)).toEqual(
      expect.arrayContaining([translations.en["svc.coo.q5"], translations.en["svc.coo.q6"]]),
    );
  });

  it("show the counterparty check with its turnaround and price, and only the turnaround without a price", async () => {
    const check = canon.products.kycCheck;
    const price = check.priceFrom!;
    await renderAt("/services/compliance-kyc/");
    const fees = document.getElementById("fees")!;
    expect(fees).toHaveTextContent(`${check.turnaroundBusinessDays} working days`);
    expect(fees).toHaveTextContent(plain(`from ${price}`));
    expect(visibleFaq().find((q) => q.question === translations.en["svc.kyc.q4"])?.answer).toContain(price);
    document.body.innerHTML = "";

    check.priceFrom = null;
    try {
      await renderAt("/services/compliance-kyc/");
      expect(document.getElementById("fees")).toHaveTextContent(`${check.turnaroundBusinessDays} working days`);
      expect(document.getElementById("fees")).not.toHaveTextContent(/USD/);
    } finally {
      check.priceFrom = price;
    }
  });

  it("show the counterparty check price in the comparison on /services/", async () => {
    await renderAt("/services/");
    const table = within(document.getElementById("compare")!).getByRole("table");
    expect(table).toHaveTextContent(plain(`Counterparty check from ${canon.products.kycCheck.priceFrom}`));
  });
});

