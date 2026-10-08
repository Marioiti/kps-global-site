import type { Language } from './translations';

/**
 * Date and period formatting with fixed month names, so the prerendered HTML
 * and the browser produce the same text (Intl output can differ between them).
 */

const MONTHS_SHORT: Record<Language, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

const MONTHS_LONG: Record<Language, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  zh: MONTHS_SHORT.zh,
};

/** `2026-09` → "Sep 2026" / "сент. 2026" / "2026年9月"; `2017` → "2017". */
export function formatMonthYear(value: string, language: Language): string {
  const [year, month] = value.split('-');
  if (!month) return year;
  const name = MONTHS_SHORT[language][Number(month) - 1];
  return language === 'zh' ? `${year}年${name}` : `${name} ${year}`;
}

/** `2026-09-02` → "2 September 2026" / "2 сентября 2026 г." / "2026年9月2日". */
export function formatDate(value: string, language: Language): string {
  const [year, month, day] = value.split('-').map(Number);
  const name = MONTHS_LONG[language][month - 1];
  if (language === 'zh') return `${year}年${name}${day}日`;
  if (language === 'ru') return `${day} ${name} ${year} г.`;
  return `${day} ${name} ${year}`;
}

/** "2017–2025", "2025 – Sep 2026", or "since Sep 2026" via the `sinceTemplate`. */
export function formatPeriod(
  from: string,
  to: string | null,
  language: Language,
  sinceTemplate: string,
): string {
  const start = formatMonthYear(from, language);
  if (!to) return sinceTemplate.replace('{date}', start);
  const end = formatMonthYear(to, language);
  const separator = from.includes('-') || to.includes('-') ? ' – ' : '–';
  return `${start}${separator}${end}`;
}
