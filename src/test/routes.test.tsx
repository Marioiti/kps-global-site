import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { COLLECTION_PATHS, LANGUAGES, PAGE_PATHS, localizePath } from "@/i18n/locales";
import { allTranslations as translations } from "@/i18n/all-strings";
import { canon } from "@/data/canon";
import { forbidden } from "./forbidden";

/** Renders a path and waits until its lazy page module has loaded. */
const renderAt = async (path: string) => {
  const router = createMemoryRouter(routes as RouteObject[], { initialEntries: [path] });
  render(
    <HelmetProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </HelmetProvider>,
  );
  await waitFor(() => expect(router.state.initialized).toBe(true));
  await screen.findAllByRole("heading", { level: 1 });
  return router;
};

const switcherHrefs = () =>
  ["EN", "RU", "中文"].map((label) => screen.getAllByRole("link", { name: label })[0].getAttribute("href"));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("routes", () => {
  it("gives every route object its own place in the tree", () => {
    const seen = new Set<object>();
    const walk = (list: RouteObject[]) =>
      list.forEach((route) => {
        expect(seen.has(route)).toBe(false);
        seen.add(route);
        if (route.children) walk(route.children);
      });
    walk(routes as RouteObject[]);
  });

  it.each(LANGUAGES.flatMap((lang) => [...PAGE_PATHS, ...COLLECTION_PATHS].map((p) => localizePath(p, lang))))(
    "renders %s with one h1 and no 404",
    async (path) => {
      await renderAt(path);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.queryByText("404")).not.toBeInTheDocument();
    },
  );

  it("renders the home page in the language of the URL", async () => {
    await renderAt("/ru/");
    expect(screen.getByRole("heading", { level: 1, name: translations.ru["hero.title"] })).toBeInTheDocument();
  });

  it("links the language switcher to the same page in other languages", async () => {
    await renderAt("/zh/services/fractional-coo/");
    expect(switcherHrefs()).toEqual([
      "/services/fractional-coo/",
      "/ru/services/fractional-coo/",
      "/zh/services/fractional-coo/",
    ]);
  });

  it("highlights the active menu item, including on sub-pages", async () => {
    await renderAt("/services/deal-structuring/");
    const services = screen.getAllByRole("link", { name: "Services" })[0];
    expect(services).toHaveAttribute("aria-current", "page");
  });

  it("serves /privacy without a trailing slash", async () => {
    await renderAt("/privacy");
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
  });

  it.each([
    ["#about", "/about/"],
    ["#services", "/services/"],
    ["#contact", "/contact/"],
  ])("sends the old anchor %s to %s", async (hash, target) => {
    const router = await renderAt(`/ru/${hash}`);
    await waitFor(() => expect(router.state.location.pathname).toBe(`/ru${target}`));
  });

  it.skipIf(!forbidden).each(["/about/", "/ru/privacy/", "/zh/"])(
    "keeps restricted strings inside the history block on %s",
    async (path) => {
      await renderAt(path);
      document.querySelectorAll("[data-history]").forEach((block) => block.remove());
      for (const item of [...forbidden!.everywhere, ...forbidden!.outsideHistory]) {
        expect(document.body.textContent, item).not.toContain(item);
        expect(document.head.innerHTML, item).not.toContain(item);
      }
    },
  );

  it("renders the company history from the canon on /about/", async () => {
    await renderAt("/about/");
    const text = document.getElementById("history")?.textContent;
    for (const entry of canon.history) expect(text).toContain(entry.name);
  });

  it("shows the 404 page in all three languages", async () => {
    await renderAt("/ru/no-such-page/");
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
    expect(screen.getByText("Страница не найдена")).toBeInTheDocument();
    expect(screen.getByText("页面未找到")).toBeInTheDocument();
  });
});

describe("contact form", () => {
  const fill = () => {
    const ru = translations.ru;
    fireEvent.change(screen.getByLabelText(ru["contact.name"]), { target: { value: "Иван" } });
    fireEvent.change(screen.getByLabelText(ru["contact.country"]), { target: { value: "Казахстан" } });
    fireEvent.change(screen.getByLabelText(ru["contact.email"]), { target: { value: "ivan@example.com" } });
    fireEvent.change(screen.getByLabelText(ru["contact.role"]), { target: { value: "intermediary" } });
    fireEvent.change(screen.getByLabelText(ru["contact.commodity"]), { target: { value: "sulphur" } });
    fireEvent.change(screen.getByLabelText(ru["contact.message"]), { target: { value: "Нужна проверка" } });
    fireEvent.click(screen.getByRole("checkbox", { name: new RegExp(ru["contact.privacyPrefix"].trim()) }));
  };

  it("prefills the topic and documents from the address and sends every field", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", "https://formspree.io/f/test");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await renderAt("/ru/contact/?topic=Offer%20Check&docs=nda-form,unknown");
    await waitFor(() =>
      expect(screen.getByLabelText(translations.ru["contact.topic"])).toHaveValue("Offer Check"),
    );
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Тестовое NDA" })).toBeChecked());
    expect(screen.getByRole("checkbox", { name: "Test checklist" })).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "Hidden form" })).toBeNull();
    fill();
    fireEvent.click(screen.getByRole("button", { name: translations.ru["contact.submit"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://formspree.io/f/test");
    expect(JSON.parse(init.body)).toMatchObject({
      name: "Иван",
      country: "Казахстан",
      email: "ivan@example.com",
      _replyto: "ivan@example.com",
      role: "intermediary",
      commodity: "sulphur",
      documents: "Test NDA",
      topic: "Offer Check",
      language: "ru",
      page: "/ru/contact/",
    });
    expect(await screen.findByRole("heading", { name: new RegExp(canon.contacts.email) })).toBeInTheDocument();
  });

  it("shows the email address instead of the button when the form endpoint is not set", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", "");
    await renderAt("/ru/contact/");
    expect(screen.queryByRole("button", { name: translations.ru["contact.submit"] })).toBeNull();
    const withEmail = (text: string) => text.replace("{email}", canon.contacts.email);
    expect(screen.getByText(withEmail(translations.ru["contact.noForm"]))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: withEmail(translations.ru["contact.emailUs"]) })).toHaveAttribute(
      "href",
      `mailto:${canon.contacts.email}`,
    );
  });
});

describe("link previews", () => {
  const ogImage = () => document.head.querySelector('meta[property="og:image"]')?.getAttribute("content");

  it("gives every indexed fixed page its own preview image", async () => {
    await renderAt("/ru/services/deal-structuring/");
    await waitFor(() => expect(ogImage()).toBe("https://kpsglobal.id/og/page-services-deal-structuring-ru.png"));
    expect(document.head.querySelector('meta[property="og:image:height"]')?.getAttribute("content")).toBe("627");
  });

  it("keeps the site-wide image for pages that are not indexed", async () => {
    await renderAt("/no-such-page/");
    await waitFor(() => expect(ogImage()).toBe("https://kpsglobal.id/og-image.png"));
  });
});

describe("sections with published items", () => {
  it("appear in the menu, the footer and cross-links", async () => {
    await renderAt("/");
    const hrefs = [...document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    for (const section of ["/insights/", "/news/", "/procedures/", "/mandates/"]) expect(hrefs, section).toContain(section);
  });
});

