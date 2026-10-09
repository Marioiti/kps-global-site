import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { allTranslations as translations } from "@/i18n/all-strings";

const html = document.documentElement;

/** prefers-color-scheme as the system reports it. */
const systemTheme = (dark: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: dark && query.includes("dark"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

const renderAt = async (path: string) => {
  const router = createMemoryRouter(routes as RouteObject[], { initialEntries: [path] });
  render(
    <HelmetProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </HelmetProvider>,
  );
  await waitFor(() => expect(router.state.initialized).toBe(true));
  await screen.findAllByRole("heading", { level: 1 });
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  html.className = "";
  systemTheme(false);
});

describe("theme", () => {
  it("follows the system setting when nothing is saved", async () => {
    systemTheme(true);
    await renderAt("/");
    await waitFor(() => expect(html.classList.contains("dark")).toBe(true));
    expect(localStorage.getItem("kps-theme")).toBeNull();
  });

  it("switches light and dark on click, saves the choice, and returns to the system theme", async () => {
    systemTheme(false);
    await renderAt("/ru/");
    const toggle = await screen.findByRole("button", { name: translations.ru["theme.toDark"] });
    fireEvent.click(toggle);
    await waitFor(() => expect(html.classList.contains("dark")).toBe(true));
    expect(localStorage.getItem("kps-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: translations.ru["theme.toLight"] }));
    await waitFor(() => expect(html.classList.contains("dark")).toBe(false));
    expect(localStorage.getItem("kps-theme")).toBe("light");

    fireEvent.contextMenu(screen.getByRole("button", { name: translations.ru["theme.toDark"] }));
    await waitFor(() => expect(localStorage.getItem("kps-theme")).toBe("system"));
  });

  it("keeps a saved choice over the system setting", async () => {
    systemTheme(true);
    localStorage.setItem("kps-theme", "light");
    await renderAt("/zh/");
    await screen.findByRole("button", { name: translations.zh["theme.toDark"] });
    expect(html.classList.contains("dark")).toBe(false);
  });

  it("offers light, dark and system in the mobile menu", async () => {
    await renderAt("/");
    fireEvent.click(screen.getByRole("button", { name: translations.en["nav.openMenu"] }));
    const group = await screen.findByRole("group", { name: translations.en["theme.label"] });
    for (const key of ["theme.light", "theme.dark", "theme.system"]) {
      expect(group).toContainElement(screen.getByRole("button", { name: translations.en[key] }));
    }
    expect(screen.getByRole("button", { name: translations.en["theme.system"] })).toHaveAttribute("aria-pressed", "true");
  });

  it("points the browser bar colour at the chosen theme, not only the system one", async () => {
    systemTheme(false);
    for (const media of ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"]) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.media = media;
      meta.content = media.includes("dark") ? "#0E1626" : "#16233F";
      document.head.appendChild(meta);
    }
    const colours = () => [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.getAttribute("content"));

    await renderAt("/");
    fireEvent.click(await screen.findByRole("button", { name: translations.en["theme.toDark"] }));
    await waitFor(() => expect(colours()).toEqual(["#0E1626", "#0E1626"]));
    fireEvent.click(screen.getByRole("button", { name: translations.en["theme.toLight"] }));
    await waitFor(() => expect(colours()).toEqual(["#16233F", "#16233F"]));
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  });
});

