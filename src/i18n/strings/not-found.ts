import type { Language } from '../translations';

/** The 404 page carries all three languages, so its strings are always in the main bundle. */
export const notFoundStrings: Record<
  Language,
  { title: string; text: string; backHome: string; services: string; contact: string }
> = {
  en: {
    title: 'Page not found',
    text: 'The address may be mistyped, or the page has moved.',
    backHome: 'Home page',
    services: 'Services',
    contact: 'Contact us',
  },
  ru: {
    title: 'Страница не найдена',
    text: 'Возможно, в адресе опечатка или страница переехала.',
    backHome: 'Главная',
    services: 'Услуги',
    contact: 'Связаться с нами',
  },
  zh: {
    title: '页面未找到',
    text: '地址可能有误，或页面已移动。',
    backHome: '首页',
    services: '服务',
    contact: '联系我们',
  },
};
