export type Language = 'en' | 'ru' | 'zh';

/**
 * Interface strings for the browser. Each language is a separate chunk, loaded by its route
 * before the page renders (see `loadStrings` in App.tsx); prerendered pages preload the chunk.
 * Build-time code uses `allTranslations` from ./all-strings.
 */
export const translations: Record<Language, Record<string, string>> = { en: {}, ru: {}, zh: {} };

const LOADERS: Record<Language, () => Promise<Record<string, string>>> = {
  en: () => import('./strings/en').then((m) => m.en),
  ru: () => import('./strings/ru').then((m) => m.ru),
  zh: () => import('./strings/zh').then((m) => m.zh),
};

export async function loadStrings(language: Language): Promise<void> {
  if (Object.keys(translations[language]).length > 0) return;
  Object.assign(translations[language], await LOADERS[language]());
}

export type TranslationVars = Record<string, string | number>;

/** Replaces `{name}` placeholders; unknown placeholders are left as is. */
export const interpolate = (template: string, vars: TranslationVars): string =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
