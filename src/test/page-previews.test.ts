// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writePagePreviews } from "@/content/build-output";
import { pagePreviewPath } from "@/content/preview";

const PROJECT = path.resolve(__dirname, "../..");

describe("fixed-page previews", () => {
  it("names the image after the page path and language", () => {
    expect(pagePreviewPath("/", "en")).toBe("/og/page-home-en.png");
    expect(pagePreviewPath("/services/compliance-kyc/", "zh")).toBe("/og/page-services-compliance-kyc-zh.png");
  });

  it("draws the image each prerendered page points at, once", async () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), "kps-og-"));
    const page = (lang: string) =>
      `<html lang="${lang}"><head><meta data-rh="true" property="og:title" content="Services &amp; more — KPS Global Solutions">` +
      `<meta data-rh="true" property="og:image" content="https://kpsglobal.id/og/page-services-${lang}.png"></head></html>`;
    fs.mkdirSync(path.join(dist, "services"), { recursive: true });
    fs.writeFileSync(path.join(dist, "services", "index.html"), page("en"));
    fs.writeFileSync(path.join(dist, "copy.html"), page("en"));
    fs.writeFileSync(path.join(dist, "other.html"), '<html lang="en"><meta property="og:image" content="https://kpsglobal.id/og-image.png"></html>');

    expect(await writePagePreviews(PROJECT, dist)).toEqual(["/og/page-services-en.png"]);
    const png = fs.readFileSync(path.join(dist, "og", "page-services-en.png"));
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(627);
  });
});
