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
};

describe("/about/", () => {
  it("leads with the seal and has the numbered sections in order", async () => {
    await renderAt("/about/");
    expect(screen.getByRole("heading", { level: 1, name: translations.en["about.hero.title"] })).toBeInTheDocument();
    expect([...document.querySelectorAll("main section[id]")].map((s) => s.id)).toEqual(["founder", "history", "principles", "cases", "legal"]);
    expect(document.getElementById("legal")).toHaveTextContent("伍");
  });

  it("introduces the founder with the photo, the quote, the facts and LinkedIn", async () => {
    await renderAt("/ru/about/");
    const founder = canon.founder!;
    const section = document.getElementById("founder")!;
    expect(within(section).getByRole("heading", { level: 2, name: founder.name.ru })).toBeInTheDocument();
    const photo = within(section).getByRole("img");
    expect(photo).toHaveAttribute("src", founder.photo!.replace(/\.jpg$/, "-600.jpg"));
    expect(section).toHaveTextContent(translations.ru["home.quote"]);
    expect(within(section).getAllByRole("listitem").map((li) => li.textContent)).toEqual(founder.facts.ru);
    expect(within(section).getByRole("link", { name: translations.ru["founder.linkedin"] })).toHaveAttribute("href", founder.linkedin);
  });

  it("shows every name of the practice and the four rules as paragraphs", async () => {
    await renderAt("/about/");
    const history = document.getElementById("history")!;
    expect(within(history).getAllByRole("listitem").map((li) => li.querySelector("p:nth-of-type(2)")!.textContent)).toEqual(
      canon.history.map((h) => h.name),
    );
    const rules = [...document.querySelectorAll("#principles p")].map((p) => p.querySelector("strong")!.textContent);
    expect(rules).toEqual([1, 2, 3, 4].map((n) => translations.en[`about.principle${n}.title`]));
  });

  it("lists every case with a stamp", async () => {
    await renderAt("/about/");
    const cases = document.getElementById("cases")!;
    expect(within(cases).getAllByRole("listitem")).toHaveLength(4);
    expect(within(cases).getAllByRole("img").length).toBe(4);
  });

  it("lists the company details and links the privacy policy", async () => {
    await renderAt("/zh/about/");
    const legal = document.getElementById("legal")!;
    for (const value of [canon.legal.name, canon.legal.nib, canon.legal.kbli.code, canon.legal.ministryDecision, canon.contacts.email]) {
      expect(legal).toHaveTextContent(value);
    }
    for (const office of canon.offices) expect(legal).toHaveTextContent(office.city.zh);
    expect(within(legal).getByRole("link", { name: translations.zh["footer.privacy"] })).toHaveAttribute("href", "/zh/privacy/");
  });
});

describe("/commodities/", () => {
  it("lists every commodity as a row with its sign, grade and typical basis", async () => {
    await renderAt("/commodities/");
    const table = within(document.getElementById("commodities")!).getByRole("table");
    const links = within(table).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(canon.commodities.map((c) => `/commodities/${c.id}/`));
    expect(links.map((a) => a.textContent)).toEqual(canon.commodities.map((c) => c.name.en));
    expect(table).toHaveTextContent("硫");
    expect(table).toHaveTextContent("Fixture basis sulphur");
    expect(table).not.toHaveTextContent(/USD/);
  });
});
