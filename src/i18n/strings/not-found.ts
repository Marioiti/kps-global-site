import type { Language } from '../translations';

/** The 404 page shows all three languages at once, so its strings are always in the main bundle. */
export const notFoundStrings: Record<Language, { title: string; backHome: string }> = {
  en: { title: 'Oops! Page not found', backHome: 'Return to Home' },
  ru: { title: 'Страница не найдена', backHome: 'Вернуться на главную' },
  zh: { title: '页面未找到', backHome: '返回首页' },
};
