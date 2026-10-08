import { describe, it, expect } from "vitest";
import { allTranslations as translations } from "@/i18n/all-strings";
import { canon } from "@/data/canon";
import { formatDate, formatPeriod } from "@/i18n/format";
import { forbidden } from "./forbidden";

const { history, ...canonWithoutHistory } = canon;
const allText = JSON.stringify({ translations, canon: canonWithoutHistory });

describe("interface strings", () => {
  it("exist in all three languages", () => {
    const keys = Object.keys(translations.en).sort();
    expect(Object.keys(translations.ru).sort()).toEqual(keys);
    expect(Object.keys(translations.zh).sort()).toEqual(keys);
  });

  it("use the same placeholders in every language", () => {
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(translations.en)) {
      expect(placeholders(translations.ru[key]), key).toEqual(placeholders(translations.en[key]));
      expect(placeholders(translations.zh[key]), key).toEqual(placeholders(translations.en[key]));
    }
  });
});

describe.skipIf(!forbidden)("restricted strings", () => {
  const list = forbidden!;

  it("are absent from interface strings and the canon", () => {
    for (const item of [...list.everywhere, ...list.outsideHistory]) expect(allText, item).not.toContain(item);
    for (const phrase of list.phrases) expect(allText.toLowerCase(), phrase).not.toContain(phrase.toLowerCase());
  });

  it("are absent from the history, except where allowed", () => {
    const historyText = JSON.stringify(history);
    for (const item of list.everywhere) expect(historyText, item).not.toContain(item);
  });
});

describe("canon", () => {
  it("shows exactly the four canon figures", () => {
    expect(canon.stats.map((s) => s.value)).toEqual(["2017", "20+", "$2B+", "200+"]);
  });
});

describe("dates", () => {
  it("formats registration date and history periods per language", () => {
    expect(formatDate("2026-09-02", "en")).toBe("2 September 2026");
    expect(formatDate("2026-09-02", "ru")).toBe("2 сентября 2026 г.");
    expect(formatDate("2026-09-02", "zh")).toBe("2026年9月2日");
    expect(formatPeriod("2017", "2025", "en", "since {date}")).toBe("2017–2025");
    expect(formatPeriod("2025", "2026-09", "en", "since {date}")).toBe("2025 – Sep 2026");
    expect(formatPeriod("2026-09", null, "zh", "{date}起")).toBe("2026年9月起");
  });
});
