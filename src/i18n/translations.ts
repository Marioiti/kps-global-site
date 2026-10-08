import { en } from './strings/en';

export type Language = 'en' | 'ru' | 'zh';

/**
 * Interface strings for the browser. English ships with the main bundle; Russian and
 * Chinese are separate chunks, loaded by their routes before the page renders (see
 * `loadStrings` in App.tsx). Build-time code uses `allTranslations` from ./all-strings.
 */
export const translations: Record<Language, Record<string, string>> = { en, ru: {}, zh: {} };

const LOADERS: Record<Exclude<Language, 'en'>, () => Promise<Record<string, string>>> = {
  ru: () => import('./strings/ru').then((m) => m.ru),
  zh: () => import('./strings/zh').then((m) => m.zh),
};

export async function loadStrings(language: Language): Promise<void> {
  if (language === 'en' || Object.keys(translations[language]).length > 0) return;
  Object.assign(translations[language], await LOADERS[language]());
}

export type TranslationVars = Record<string, string | number>;

/** Replaces `{name}` placeholders; unknown placeholders are left as is. */
export const interpolate = (template: string, vars: TranslationVars): string =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
