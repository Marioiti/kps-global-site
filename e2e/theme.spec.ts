import { test, expect, type Page } from "@playwright/test";

const isDark = (page: Page) => page.evaluate(() => document.documentElement.classList.contains("dark"));

test.describe("theme", () => {
  test("follows prefers-color-scheme before any script of the app runs", async ({ browser }) => {
    for (const colorScheme of ["dark", "light"] as const) {
      // The inline script alone: the app bundle is blocked.
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.route("**/assets/*.js", (route) => route.abort());
      await page.goto("/");
      expect(await isDark(page)).toBe(colorScheme === "dark");
      await context.close();
    }
  });

  test("a saved choice wins over the system setting", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    await context.addInitScript(() => localStorage.setItem("kps-theme", "light"));
    const page = await context.newPage();
    await page.goto("/documents/");
    expect(await isDark(page)).toBe(false);
    await context.close();
  });

  test("the header button switches the theme and the choice survives a reload", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    expect(await isDark(page)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("kps-theme"))).toBe("dark");

    await page.reload();
    expect(await isDark(page)).toBe(true);
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("the browser bar colour follows the shown theme", async ({ browser }) => {
    const colours = (page: Page) =>
      page.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.getAttribute("content")));
    const context = await browser.newContext({ colorScheme: "light" });
    await context.addInitScript(() => localStorage.setItem("kps-theme", "dark"));
    const page = await context.newPage();
    // The inline script alone: the app bundle is blocked.
    await page.route("**/assets/*.js", (route) => route.abort());
    await page.goto("/");
    expect(await colours(page)).toEqual(["#0E1626", "#0E1626"]);
    await page.unroute("**/assets/*.js");

    await page.reload();
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect.poll(() => colours(page)).toEqual(["#16233F", "#16233F"]);
    await context.close();
  });
});

