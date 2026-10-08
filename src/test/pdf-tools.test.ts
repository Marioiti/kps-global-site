// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import {
  REGISTER_HEADER,
  appendRegister,
  auditSources,
  nextIssueNumber,
  parseArgs,
  slugify,
  stampPdf,
} from "../../scripts/lib/pdf-tools";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "kps-pdf-"));

describe("document tools", () => {
  it("reads --flags and bare words", () => {
    expect(parseArgs(["--doc", "mutual-nda", "--to", "Acme Ltd", "--", "x"])).toEqual({
      doc: "mutual-nda",
      to: "Acme Ltd",
      _: "x",
    });
  });

  it("numbers issues per day and keeps a register", () => {
    const register = path.join(tmp(), "issued", "register.csv");
    expect(nextIssueNumber(register, "2026-10-08")).toBe("KPS-20261008-001");
    appendRegister(register, {
      number: "KPS-20261008-001",
      date: "2026-10-08",
      document: "mutual-nda",
      version: "1.0",
      recipient: "Acme, Ltd",
    });
    expect(nextIssueNumber(register, "2026-10-08")).toBe("KPS-20261008-002");
    expect(nextIssueNumber(register, "2026-10-09")).toBe("KPS-20261009-001");
    expect(fs.readFileSync(register, "utf8")).toBe(
      `${REGISTER_HEADER}\nKPS-20261008-001,2026-10-08,mutual-nda,1.0,"Acme, Ltd"\n`,
    );
  });

  it("marks every page with the recipient and the number", async () => {
    const source = await PDFDocument.create();
    source.addPage([595, 842]);
    source.addPage([595, 842]);
    const stamped = await stampPdf(
      await source.save(),
      { recipient: { company: "Acme Ltd", person: "J. Doe" }, date: "2026-10-08", number: "KPS-20261008-001" },
      null,
    );
    const pdf = await PDFDocument.load(stamped);
    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getTitle()).toBe("KPS-20261008-001");
    expect(pdf.getSubject()).toBe("Issued to Acme Ltd / J. Doe");
    for (const page of pdf.getPages()) {
      expect(page.node.Contents()).toBeDefined();
    }
  });

  it("makes file-safe recipient names", () => {
    expect(slugify("Acme Trading, Ltd.")).toBe("acme-trading-ltd");
    expect(slugify("!!!")).toBe("recipient");
  });

  it("lists published cards without a PDF or DOCX source, and skips without _internal", () => {
    const root = tmp();
    const card = (slug: string, draft: boolean) => {
      const dir = path.join(root, "content", "documents", slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "en.md"),
        `---\ntitle: "T"\ngroup: checklists\naccess: preview\ndraft: ${draft}\n---\n\nBody.\n`,
      );
    };
    card("with-pdf", false);
    card("with-docx", false);
    card("no-source", false);
    card("a-draft", true);
    expect(auditSources(root)).toEqual({ skipped: true });

    const source = (slug: string, name: string) => {
      const dir = path.join(root, "_internal", "documents", slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), "x");
    };
    source("with-pdf", "with-pdf.pdf");
    source("with-docx", "Form v1.DOCX");
    source("no-source", "notes.txt");
    expect(auditSources(root)).toEqual({
      skipped: false,
      checked: 3,
      missing: [
        { slug: "no-source", group: "checklists", access: "preview", expected: "_internal/documents/no-source/" },
      ],
    });
  });
});
