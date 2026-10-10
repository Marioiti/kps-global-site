import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { ContentError, loadContent } from "@/content/load";
import { assertNoDocumentFiles } from "@/content/build-output";
import { allTranslations as translations } from "@/i18n/all-strings";

const FIXTURES = path.resolve(__dirname, "fixtures");

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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kps-docs-"));
  fs.cpSync(path.join(FIXTURES, "content/commodities"), path.join(root, "content/commodities"), { recursive: true });
  return root;
};

const write = (root: string, rel: string, text: string | Buffer) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

const card = (extra: string[] = [], text = "Body.") =>
  [
    "---",
    'title: "Form"',
    "group: standard-forms",
    "stage: before-loi",
    "issuer: kps",
    'dealStep: "Step"',
    'summary: "Summary"',
    "contents:",
    '  - "One"',
    'version: "1.0"',
    'date: "2026-01-01"',
    "access: on-request",
    ...extra,
    "---",
    "",
    text,
    "",
  ].join("\n");

const problemsOf = (root: string): string => {
  try {
    loadContent(root);
  } catch (error) {
    expect(error).toBeInstanceOf(ContentError);
    return (error as ContentError).problems.join("\n");
  }
  throw new Error("expected a ContentError");
};

describe("document cards", () => {
  it("publishes cards with group, issuer, access and version; drafts stay off the site", () => {
    const { entries } = loadContent(FIXTURES);
    const documents = entries.filter((e) => e.collection === "documents");
    expect(documents.map((e) => e.slug).sort()).toEqual(["check-one", "nda-form"]);
    const nda = documents.find((e) => e.slug === "nda-form")!;
    expect(nda).toMatchObject({ group: "standard-forms", issuer: "kps", access: "on-request", version: "1.0" });
    expect(Object.keys(nda.versions).sort()).toEqual(["en", "ru"]);
  });

  it("stops the build on a file field, TODO in a published card and previews of an on-request document", () => {
    const root = tempRoot();
    write(root, "content/documents/with-file/en.md", card(['file: "x.pdf"']));
    write(root, "content/documents/with-todo/en.md", card([], "TODO: write the text."));
    write(root, "content/documents/hidden/en.md", card(["draft: true"]));
    write(root, "public/docs-preview/hidden/page-1.webp", "x");
    write(root, "content/documents/on-request/en.md", card());
    write(root, "public/docs-preview/on-request/page-1.webp", "x");
    const problems = problemsOf(root);
    expect(problems).toContain("content/documents/with-file/en.md");
    expect(problems).toMatch(/with-file\/en\.md › .*file/);
    expect(problems).toMatch(/with-todo\/en\.md › .*TODO/);
    expect(problems).toMatch(/on-request/);
    expect(problems).not.toMatch(/documents\/hidden\/en\.md › .*TODO/);
  });

  it("rejects origin and producer fields anywhere in content, and document files in public/", () => {
    const root = tempRoot();
    write(root, "content/documents/one/en.md", card());
    write(
      root,
      "content/procedures/p/en.md",
      '---\ntitle: "T"\ndescription: "D"\naudience: buyer\nupdated: "2026-01-01"\nversion: "1.0"\norigin: "X"\nsteps:\n  - { title: a, actor: b, document: c, receives: d }\n---\n\nText\n',
    );
    write(root, "public/files/form.pdf", "%PDF-1.4");
    write(root, "public/files/form.docx", "x");
    const problems = problemsOf(root);
    expect(problems).toMatch(/content\/procedures\/p\/en\.md › .*origin/);
    expect(problems).toContain("public/files/form.pdf");
    expect(problems).toContain("public/files/form.docx");
  });

  it("checks every content text against the blocked names, without printing the name", () => {
    const root = tempRoot();
    write(root, "content/documents/one/en.md", card([], "Prepared with Acme Holding."));
    write(root, "_internal/blocked-names.json", JSON.stringify(["acme holding"]));
    const problems = problemsOf(root);
    expect(problems).toMatch(/content\/documents\/one\/en\.md:\d+ › text: contains a blocked counterparty name/);
    expect(problems).not.toContain("Acme");
  });

  it("refuses a build output with a PDF, DOCX or XLSX in it", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kps-dist-"));
    write(dir, "index.html", "<html></html>");
    expect(() => assertNoDocumentFiles(dir)).not.toThrow();
    write(dir, "assets/sheet.xlsx", "x");
    expect(() => assertNoDocumentFiles(dir)).toThrow(/sheet\.xlsx/);
  });
});

describe("document pages", () => {
  it("lists documents as rows with group, version and a request, and the disclaimer", async () => {
    await renderAt("/documents/");
    const en = translations.en;
    expect(screen.getByRole("heading", { level: 1, name: en["nav.documents"] })).toBeInTheDocument();
    expect(document.querySelector("main")).toHaveTextContent("文件");
    const rows = within(document.getElementById("library")!).getAllByRole("listitem");
    expect(rows.map((li) => within(li).getAllByRole("link")[0].getAttribute("href"))).toEqual(["/documents/check-one/", "/documents/nda-form/"]);
    expect(within(rows[1]).getByRole("link", { name: new RegExp(`^${en["documents.requestThis"]}.*Test NDA$`) })).toHaveAttribute("href", "/contact/?docs=nda-form");
    expect(rows[1]).toHaveTextContent(en["documents.group.standard-forms"]);
    expect(screen.getAllByText(en["documents.disclaimer"]).length).toBeGreaterThan(0);
    expect(document.querySelector('a[href="/documents/hidden-form/"]')).toBeNull();
  });

  it("filters by group with buttons; every document stays listed before scripts run", async () => {
    await renderAt("/documents/");
    const group = screen.getByRole("group", { name: translations.en["documents.filter"] });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual([
      translations.en["documents.stage.all"],
      translations.en["documents.group.standard-forms"],
      translations.en["documents.group.checklists"],
    ]);
    fireEvent.click(within(group).getByRole("button", { name: translations.en["documents.group.checklists"] }));
    expect(within(group).getByRole("button", { name: translations.en["documents.group.checklists"] })).toHaveAttribute("aria-pressed", "true");
    expect(within(document.getElementById("library")!).getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(within(group).getByRole("button", { name: translations.en["documents.stage.all"] }));
    expect(within(document.getElementById("library")!).getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows a card in Russian with the request link, the English canonical and related documents", async () => {
    await renderAt("/ru/documents/nda-form/");
    expect(screen.getByRole("heading", { level: 1, name: "Тестовое NDA" })).toBeInTheDocument();
    const requests = screen.getAllByRole("link", { name: translations.ru["documents.requestThis"] });
    expect(new Set(requests.map((a) => a.getAttribute("href")))).toEqual(new Set(["/ru/contact/?docs=nda-form"]));
    expect(screen.getByText(translations.ru["documents.languageNote"])).toBeInTheDocument();
    expect([...document.querySelectorAll("main section[id]")].map((s) => s.id)).toEqual(["what", "when", "contents", "version", "related"]);
    expect(document.getElementById("when")).toHaveTextContent(translations.ru["documents.stage.before-loi"]);
    expect(within(document.querySelector("main")!).getByText("Конфиденциальность")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: translations.ru["documents.preview"] })).toBeNull();
    expect(screen.getByText(translations.ru["documents.disclaimer"])).toBeInTheDocument();
    expect(document.querySelector('a[href$=".pdf"]')).toBeNull();
    expect(within(document.getElementById("related")!).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/ru/documents/check-one/",
    ]);
    await waitFor(() =>
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://kpsglobal.id/documents/nda-form/"),
    );
    expect([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute("hreflang"))).not.toContain("ru");
  });

  it("announces the preview of a preview document until its pages are rendered", async () => {
    await renderAt("/documents/check-one/");
    expect(screen.getByRole("heading", { level: 2, name: translations.en["documents.preview"] })).toBeInTheDocument();
    expect(screen.getByText(translations.en["documents.previewSoon"])).toBeInTheDocument();
    expect(screen.getByText("1.2")).toBeInTheDocument();
  });

  it("links a procedure to the request form and to the standard forms", async () => {
    await renderAt("/procedures/buyer-steps/");
    const link = screen.getByRole("link", { name: translations.en["procedure.request"] });
    expect(link.getAttribute("href")).toMatch(/^\/contact\/\?topic=/);
    expect(document.querySelector('a[href="/documents/nda-form/"]')).not.toBeNull();
  });
});
