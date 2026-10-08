import type { Language } from '../i18n/translations';

/**
 * Single source of facts, figures and contacts for the site. Page texts refer
 * to these values through placeholders instead of repeating them.
 *
 * A field set to `null` hides the block that needs it.
 */

export type Localized = Record<Language, string>;

export interface HistoryEntry {
  /** ISO year or year-month. */
  from: string;
  to: string | null;
  name: string;
  /** Optional localized note shown under the name in the history table. */
  noteKey: string | null;
}

export interface Stat {
  value: string;
  /** Translation key of the label under the figure. */
  labelKey: string;
}

const PRACTICE_SINCE = '2017';

export const canon = {
  brand: 'KPS Global Solutions',

  legal: {
    name: 'PT KPS Global Solutions',
    form: {
      en: 'PT PMA (foreign-investment company), Indonesia',
      ru: 'PT PMA (компания с иностранными инвестициями), Индонезия',
      zh: 'PT PMA（外商投资公司），印度尼西亚',
    } as Localized,
    registered: '2026-09-02',
    ministryDecision: 'AHU-0070927.AH.01.01.TAHUN 2026',
    nib: '0209260088589',
    kbli: { code: '70209', title: 'Other Management Consultancy Activities' },
    address: {
      street: 'Jalan Sidakarya, Sidakarya',
      district: 'Denpasar Selatan',
      city: 'Kota Denpasar',
      region: 'Bali',
      postalCode: '80224',
      country: 'Indonesia',
      countryCode: 'ID',
    },
  },

  practiceSince: PRACTICE_SINCE,

  history: [
    { from: PRACTICE_SINCE, to: '2025', name: 'BRIK', noteKey: null },
    { from: '2025', to: '2026-09', name: 'PT Kusuma Petak Sari', noteKey: 'history.merger' },
    { from: '2026-09', to: null, name: 'PT KPS Global Solutions', noteKey: null },
  ] as HistoryEntry[],

  /** Team track record since `practiceSince`. */
  stats: [
    { value: PRACTICE_SINCE, labelKey: 'stats.since' },
    { value: '20+', labelKey: 'stats.deals' },
    { value: '$2B+', labelKey: 'stats.volume' },
    { value: '200+', labelKey: 'stats.supplierMandates' },
  ] as Stat[],

  offices: [
    {
      city: { en: 'Sanya', ru: 'Санья', zh: '三亚' } as Localized,
      country: { en: 'China', ru: 'Китай', zh: '中国' } as Localized,
    },
    {
      city: { en: 'Denpasar', ru: 'Денпасар', zh: '登巴萨' } as Localized,
      country: { en: 'Indonesia', ru: 'Индонезия', zh: '印度尼西亚' } as Localized,
    },
  ],

  corridor: {
    suppliers: [
      { en: 'Gulf', ru: 'Залив', zh: '海湾地区' },
      { en: 'Central Asia', ru: 'Центральная Азия', zh: '中亚' },
    ] as Localized[],
    buyers: [
      { en: 'China', ru: 'Китай', zh: '中国' },
      { en: 'Southeast Asia', ru: 'Юго-Восточная Азия', zh: '东南亚' },
    ] as Localized[],
  },

  commodities: [
    { id: 'aluminium', name: { en: 'Aluminium', ru: 'Алюминий', zh: '铝' } as Localized },
    { id: 'lng', name: { en: 'LNG', ru: 'СПГ', zh: '液化天然气' } as Localized },
    { id: 'sulphur', name: { en: 'Sulphur', ru: 'Сера', zh: '硫磺' } as Localized },
    { id: 'copper', name: { en: 'Copper', ru: 'Медь', zh: '铜' } as Localized },
    { id: 'diesel', name: { en: 'Diesel', ru: 'Дизельное топливо', zh: '柴油' } as Localized },
  ],

  /** Fixed-scope products: scope and turnaround only, fees on request. */
  products: {
    offerCheck: { name: 'Offer Check', turnaroundHours: '48' },
    dealHealthCheck: { name: 'Deal Health Check', turnaroundBusinessDays: '7' },
  },

  contacts: {
    email: 'mnc@kpsglobal.id',
    whatsapp: { display: '+7 914 557 4000', url: 'https://wa.me/79145574000' } as {
      display: string;
      url: string;
    } | null,
    telegram: { handle: '@An0rlov', url: 'https://t.me/An0rlov' } as {
      handle: string;
      url: string;
    } | null,
    wechat: 'andreworlov' as string | null,
    linkedinCompany: 'https://www.linkedin.com/company/kpsglobal',
    linkedinFounder: 'https://www.linkedin.com/in/anorlov/',
  },

  founder: {
    name: { en: 'Andrei Orlov', ru: 'Андрей Орлов', zh: '安德烈·奥尔洛夫' } as Localized,
    role: {
      en: 'Founder & Director, KPS Global Solutions',
      ru: 'Основатель и директор, KPS Global Solutions',
      zh: 'KPS Global Solutions 创始人兼董事',
    } as Localized,
    photo: '/team/andrei-orlov.jpg' as string | null,
    linkedin: 'https://www.linkedin.com/in/anorlov/',
    bio: {
      en: 'Andrei Orlov is the founder and director of KPS Global Solutions. He structures and runs cross-border commodity deals in aluminium, LNG, sulphur, copper and diesel between suppliers in the Gulf and Central Asia and buyers in China and Southeast Asia, and takes operating roles in international projects as a Fractional COO. He sees the same cargo from both sides: the offers suppliers send, and what a buyer and its bank will accept. Before KPS he spent more than 20 years building operations in China, Hong Kong, the UAE, Singapore, Indonesia and Russia, including a $35M development portfolio in Bali. He works in English and Russian, with elementary Mandarin.',
      ru: 'Андрей Орлов — основатель и директор KPS Global Solutions. Он структурирует и ведёт трансграничные сделки с сырьём — алюминием, СПГ, серой, медью и дизельным топливом — между поставщиками Залива и Центральной Азии и покупателями в Китае и Юго-Восточной Азии, а также берёт на себя операционные роли в международных проектах как Fractional COO. Он видит один и тот же груз с двух сторон: какие оферты присылают поставщики и что примут покупатель и его банк. До KPS он более 20 лет выстраивал операции в Китае, Гонконге, ОАЭ, Сингапуре, Индонезии и России, включая девелоперский портфель на $35 млн на Бали. Работает на английском и русском, владеет китайским на базовом уровне.',
      zh: '安德烈·奥尔洛夫是 KPS Global Solutions 的创始人兼董事。他在海湾地区和中亚的供应商与中国及东南亚的买方之间，构建并推进铝、液化天然气、硫磺、铜和柴油的跨境大宗商品交易，并以 Fractional COO 的身份在国际项目中承担运营职责。他从两端看待同一批货物：供应商发出的报价，以及买方及其银行能够接受的条件。创立 KPS 之前，他在中国、香港、阿联酋、新加坡、印度尼西亚和俄罗斯从事运营建设超过 20 年，其中包括巴厘岛一个 3500 万美元的开发项目组合。他的工作语言为英语和俄语，并具备基础中文能力。',
    } as Localized,
  } as {
    name: Localized;
    role: Localized;
    photo: string | null;
    linkedin: string;
    bio: Localized;
  } | null,
};

/** One-line legal address, e.g. for the footer, privacy policy and JSON-LD. */
export const legalAddressLine = (): string => {
  const a = canon.legal.address;
  return `${a.street}, ${a.district}, ${a.city}, ${a.region} ${a.postalCode}, ${a.country}`;
};
