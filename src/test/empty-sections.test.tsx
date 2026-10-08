import { describe, it, expect, vi } from "vitest";
import path from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { loadContent } from "@/content/load";
import { sitemapPages } from "@/content/build-output";
import { buildSitemap } from "@/seo/sitemap";

// Nothing published in insights, news, procedures or mandates; documents stay.
vi.mock("virtual:content", async (importOriginal) => {
  const original = await importOriginal<typeof import("virtual:content")>();
  return {
    ...original,
    entries: original.entries.filter((entry) => entry.collection === "documents"),
    mandates: [],
  };
});

const SECTIONS = ["/insights/", "/news/", "/procedures/", "/mandates/"];

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

const hrefs = () => [...document.querySelectorAll("a")].map((a) => a.getAttribute("href"));

describe("empty sections", () => {
  it("are left out of the menu, the footer, the home page and cross-links", async () => {
    await renderAt("/");
    for (const section of SECTIONS) expect(hrefs(), section).not.toContain(section);
    expect(hrefs()).toContain("/documents/");
    expect(document.querySelector("#mandates")).toBeNull();
  });

  it("are left out of links on other pages too", async () => {
    await renderAt("/ru/commodities/");
    expect(hrefs()).not.toContain("/ru/procedures/");
    expect(hrefs()).toContain("/ru/documents/");
  });

  it("stay out of the sitemap until the first item, then appear", () => {
    const { entries, mandates } = loadContent(path.resolve(__dirname, "fixtures"));
    const empty = buildSitemap(sitemapPages(entries.filter((e) => e.collection === "documents"), []));
    const full = buildSitemap(sitemapPages(entries, mandates));
    for (const section of SECTIONS) {
      expect(empty, section).not.toContain(`kpsglobal.id${section}<`);
      expect(full, section).toContain(`kpsglobal.id${section}<`);
    }
  });
});
