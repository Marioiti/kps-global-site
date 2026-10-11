import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import jsQR from "jsqr";
import { codes } from "virtual:card-qr";
import { routes } from "@/App";
import { canon } from "@/data/canon";
import { founderVCard } from "@/card/vcard";
import { cardLinks } from "@/card/vite-plugin";
import { checkCardPage } from "@/content/page-check";
import { sitemapPages } from "@/content/build-output";

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

afterEach(() => vi.unstubAllGlobals());

/** Draws a QR path (as the page gets it) on a white raster and reads it back with jsQR. */
const decode = (code: { size: number; d: string }): string | null => {
  const scale = 6;
  const quiet = 4;
  const side = (code.size + quiet * 2) * scale;
  const data = new Uint8ClampedArray(side * side * 4).fill(255);
  for (const [, x, y, w] of code.d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let my = 0; my < scale; my++) {
      for (let mx = 0; mx < Number(w) * scale; mx++) {
        const px = (Number(x) + quiet) * scale + mx;
        const py = (Number(y) + quiet) * scale + my;
        const i = (py * side + px) * 4;
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
  }
  return jsQR(data, side, side)?.data ?? null;
};

describe("card page", () => {
  it("shows the card with every channel, is not indexed, and has no phone number", async () => {
    await renderAt("/card/");
    const founder = canon.founder!;
    expect(screen.getByRole("heading", { level: 1, name: founder.name.en })).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow"));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    const hrefs = [...document.querySelectorAll("main a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        canon.contacts.whatsappBusiness,
        canon.contacts.telegram!.url,
        `mailto:${canon.contacts.email}`,
        founder.linkedin,
        "https://kpsglobal.id/",
        "/card/andrei-orlov.vcf",
        canon.contacts.linkedinCompany,
      ]),
    );
    expect(screen.getByText(canon.contacts.wechat!.id)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\+62|\+7\s?914/);
    // Outside the site layout: no header menu and no footer.
    expect(document.querySelector("header nav")).toBeNull();
    expect(document.querySelector("footer")).toBeNull();
  });

  it("shares the page, or copies the link where sharing is not available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: { writeText } });
    await renderAt("/card/");
    fireEvent.click(screen.getByRole("button", { name: "Share card" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://kpsglobal.id/card/"));
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("is linked from no other page and stays out of the sitemap", async () => {
    await renderAt("/");
    expect(document.querySelector('a[href*="/card"]')).toBeNull();
    expect(sitemapPages([]).map((p) => p.path)).not.toContain("/card/");
  });

  it("shows one large QR code with a switch between WhatsApp, Telegram, WeChat and the card", async () => {
    await renderAt("/card/");
    const group = await screen.findByRole("group", { name: "QR codes" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["WhatsApp", "Telegram", "WeChat", "Card"]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    const shownQr = () => within(document.querySelector('section[aria-label="QR codes"] ul')!).getAllByRole("img");
    expect(shownQr().map((img) => img.getAttribute("aria-label"))).toEqual(["QR code: WhatsApp"]);
    fireEvent.click(buttons[3]);
    expect(buttons[3]).toHaveAttribute("aria-pressed", "true");
    expect(shownQr().map((img) => img.getAttribute("aria-label"))).toEqual(["QR code: Card"]);
    expect(screen.getByRole("link", { name: /linkedin\.com\/company\/kpsglobal/ })).toHaveAttribute("href", canon.contacts.linkedinCompany);
  });

  it("draws QR codes that read back as the right links", () => {
    expect(cardLinks()).toEqual({
      whatsapp: "https://wa.me/message/OA27FPCRDJMQK1",
      telegram: "https://t.me/An0rlov",
      wechat: "https://u.wechat.com/kJdzNbiDgZUtw27Bk3pN6lg?s=2",
      card: "https://kpsglobal.id/card/",
    });
    for (const [key, url] of Object.entries(cardLinks())) {
      const code = codes[key as keyof typeof codes];
      expect(code.url).toBe(url);
      expect(decode(code), key).toBe(url);
    }
  });
});

describe("vCard", () => {
  const card = founderVCard();
  it("is Andrei's card as given: vCard 3.0, his channels, no +62 and no company registration", () => {
    expect(card.split("\r\n")).toEqual([
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Orlov;Andrei;;;",
      "FN:Andrei Orlov",
      "ORG:KPS Global Solutions",
      "TITLE:Founder & Director",
      "TEL;TYPE=CELL:+79145574000",
      "EMAIL:mnc@kpsglobal.id",
      "URL:https://kpsglobal.id",
      "URL:https://www.linkedin.com/in/anorlov",
      "X-SOCIALPROFILE;TYPE=telegram:https://t.me/An0rlov",
      "X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/message/OA27FPCRDJMQK1",
      "NOTE:WeChat: andreworlov · LinkedIn company: https://www.linkedin.com/company/kpsglobal",
      "END:VCARD",
      "",
    ]);
    expect(card).not.toMatch(/\+62|PHOTO|NPWP|NIB/);
  });
});

describe("build check of the card page", () => {
  const page = (dir: string, rel: string, html: string) => {
    fs.mkdirSync(path.join(dir, rel), { recursive: true });
    fs.writeFileSync(path.join(dir, rel, "index.html"), html);
  };

  it("passes a hidden card and reports one that is indexed, listed or linked", () => {
    const ok = fs.mkdtempSync(path.join(os.tmpdir(), "kps-card-"));
    page(ok, "card", '<meta name="robots" content="noindex, nofollow">');
    page(ok, "", '<a href="/about/">About</a>');
    fs.writeFileSync(path.join(ok, "sitemap.xml"), "<loc>https://kpsglobal.id/</loc>");
    expect(checkCardPage(ok)).toEqual([]);

    const bad = fs.mkdtempSync(path.join(os.tmpdir(), "kps-card-"));
    page(bad, "card", '<meta name="robots" content="noindex, follow">');
    page(bad, "about", '<a href="/card/">Card</a>');
    fs.writeFileSync(path.join(bad, "llms.txt"), "https://kpsglobal.id/card/");
    fs.writeFileSync(path.join(bad, "llms-full.txt"), "## Card\nhttps://kpsglobal.id/card/");
    fs.writeFileSync(path.join(bad, "indexnow-urls.json"), '{"urlList":["https://kpsglobal.id/card/"]}');
    const problems = checkCardPage(bad).join("\n");
    expect(problems).toMatch(/expected noindex, nofollow/);
    expect(problems).toMatch(/llms\.txt: mentions/);
    expect(problems).toMatch(/llms-full\.txt: mentions/);
    expect(problems).toMatch(/indexnow-urls\.json: mentions/);
    expect(problems).toMatch(/about\/index\.html: links to/);
  });
});
