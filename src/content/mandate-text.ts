import fs from 'node:fs';
import path from 'node:path';

/**
 * Line-by-line text checks ("file:line › reason"):
 * - mandates: currency signs and codes are not allowed anywhere; price words are not
 *   allowed on a line that contains a number;
 * - cases: the same, except sums in USD on the `metricValue` line ("USD 480,000", "USD 10M+ / month");
 * - all content: names from _internal/blocked-names.json (outside the repository) are not
 *   allowed; without that file this check is skipped.
 */

const CURRENCY = /[$€£¥₽₹₩₺₫฿]|\b(?:USD|EUR|GBP|CNY|RMB|AED|RUB)\b|美元|долл|руб/i;
/** USD sums allowed in a case metric. */
const METRIC_USD = /\bUSD\s?\d[\d.,\s]*(?:[KMB]\b|млн|млрд|万|亿)?\+?/gi;
const PRICE_WORDS = /\b(?:prices?|priced|pricing|discounts?|below|LME)\b|цен[аыеуоя]?\b|скидк|价格|折扣/i;
const DIGIT = /\d/;

const BLOCKED_NAMES_FILE = '_internal/blocked-names.json';

export function readBlockedNames(rootDir: string): string[] | null {
  const file = path.join(rootDir, BLOCKED_NAMES_FILE);
  if (!fs.existsSync(file)) return null;
  const list: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(list) || list.some((item) => typeof item !== 'string')) {
    throw new Error(`${BLOCKED_NAMES_FILE} must be a JSON array of strings`);
  }
  return (list as string[]).map((name) => name.trim()).filter(Boolean);
}

export function checkMandateText(file: string, text: string): string[] {
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const where = `${file}:${index + 1}`;
    const currency = line.match(CURRENCY);
    if (currency) problems.push(`${where} › text: currency "${currency[0]}" is not allowed in a mandate`);
    const word = line.match(PRICE_WORDS);
    if (word && DIGIT.test(line)) problems.push(`${where} › text: "${word[0]}" next to a number is not allowed in a mandate`);
  });
  return problems;
}

export function checkCaseText(file: string, text: string): string[] {
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const where = `${file}:${index + 1}`;
    const isMetric = /^\s*metricValue\s*:/.test(line);
    const rest = isMetric ? line.replace(METRIC_USD, '') : line;
    const currency = rest.match(CURRENCY);
    if (currency) {
      problems.push(
        isMetric
          ? `${where} › metricValue: sums only in USD, e.g. "USD 480,000" or "USD 10M+"`
          : `${where} › text: currency "${currency[0]}" is allowed only in metricValue`,
      );
    }
    const word = rest.match(PRICE_WORDS);
    if (word && DIGIT.test(line)) problems.push(`${where} › text: "${word[0]}" next to a number is not allowed in a case`);
  });
  return problems;
}

/** The name itself is never printed: the report stays safe to share. */
export function checkBlockedNames(file: string, text: string, blockedNames: string[]): string[] {
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const lower = line.toLowerCase();
    if (blockedNames.some((name) => lower.includes(name.toLowerCase()))) {
      problems.push(`${file}:${index + 1} › text: contains a blocked counterparty name`);
    }
  });
  return problems;
}
