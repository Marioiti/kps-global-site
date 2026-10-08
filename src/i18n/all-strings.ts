import type { Language } from './translations';
import { en } from './strings/en';
import { ru } from './strings/ru';
import { zh } from './strings/zh';

/** Every language at once, for build-time code and tests. The browser loads ru and zh on demand. */
export const allTranslations: Record<Language, Record<string, string>> = { en, ru, zh };
