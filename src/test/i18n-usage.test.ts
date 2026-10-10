import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { allTranslations } from "@/i18n/all-strings";
import { notFoundStrings } from "@/i18n/strings/not-found";

const ROOT = path.resolve(__dirname, "../..");

/** Source files that may use interface strings: the app, build-time code and scripts; not tests or the strings. */
const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return ["test", "strings"].includes(d.name) ? [] : sources(full);
    return /\.(ts|tsx|mjs)$/.test(d.name) ? [full] : [];
  });

describe("interface strings", () => {
  const code = [...sources(path.join(ROOT, "src")), ...sources(path.join(ROOT, "scripts"))]
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  // Keys built in code: t(`documents.stage.${stage}`) uses every documents.stage.* key.
  const prefixes = [...code.matchAll(/`([a-zA-Z0-9_.-]+)\$\{/g)].map((m) => m[1]);
  const quoted = (value: string) => code.includes(`'${value}'`) || code.includes(`"${value}"`) || code.includes(`\`${value}\``);

  const isUsed = (key: string, withPrefixes = true) => {
    if (quoted(key) || (withPrefixes && prefixes.some((prefix) => key.startsWith(prefix)))) return true;
    // `${item.key}.title`, where item.key is a quoted key such as 'menu.coo'.
    const cut = key.lastIndexOf(".");
    return code.includes(`}${key.slice(cut)}\``) && quoted(key.slice(0, cut));
  };

  it("are all used somewhere in the code", () => {
    // Service pages build their keys from the config (svc.<key>.when1 …); check those against it.
    const svcParts = /^svc\.(deal|kyc|coo)\.(title|lead|when\d|step\d\.(title|desc)|q\d|a\d)$/;
    const svcUnused = Object.keys(allTranslations.en).filter((key) => key.startsWith("svc.") && !svcParts.test(key) && !isUsed(key, false));
    expect(svcUnused).toEqual([]);
    expect(Object.keys(allTranslations.en).filter((key) => !isUsed(key))).toEqual([]);
  });

  it("have the same keys in every language", () => {
    const en = Object.keys(allTranslations.en).sort();
    expect(Object.keys(allTranslations.ru).sort()).toEqual(en);
    expect(Object.keys(allTranslations.zh).sort()).toEqual(en);
  });

  it("have no long dash in English: short sentences instead", () => {
    const english = [...Object.entries(allTranslations.en), ...Object.entries(notFoundStrings.en)];
    expect(english.filter(([, value]) => value.includes("\u2014")).map(([key]) => key)).toEqual([]);
  });
});
