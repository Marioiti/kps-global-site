import fs from "node:fs";
import path from "node:path";

/**
 * Restricted strings for content tests. The list lives outside the repository
 * (_internal/forbidden.json); without it these tests are skipped.
 */
export interface ForbiddenList {
  /** Never on the site. */
  everywhere: string[];
  /** Allowed only inside blocks marked with data-history. */
  outsideHistory: string[];
  /** Case-insensitive phrases that must not appear. */
  phrases: string[];
  /** Must not appear on commodity pages or in commodity texts. */
  originCountries: string[];
}

const FILE = path.resolve(__dirname, "../../_internal/forbidden.json");

export const forbidden: ForbiddenList | null = fs.existsSync(FILE)
  ? { everywhere: [], outsideHistory: [], phrases: [], originCountries: [], ...JSON.parse(fs.readFileSync(FILE, "utf8")) }
  : null;
