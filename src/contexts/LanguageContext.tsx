import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { translations, interpolate, Language, TranslationVars } from '@/i18n/translations';
import { getLanguageFromPath } from '@/i18n/locales';
import { canon, formatPrice } from '@/data/canon';
import { feedPath } from '@/seo/feed';

interface LanguageContextType {
  language: Language;
  /** Looks up a string and fills `{placeholders}`; brand, legal name and email are always available. */
  t: (key: string, vars?: TranslationVars) => string;
}

const CANON_VARS = (language: Language): TranslationVars => ({
  brand: canon.brand,
  legalName: canon.legal.name,
  email: canon.contacts.email,
  // The only prices on the site, with their terms (see canon.products).
  offerPrice: formatPrice(canon.products.offerCheck.priceFrom, language),
  offerHours: canon.products.offerCheck.turnaroundHours,
  healthPrice: formatPrice(canon.products.dealHealthCheck.priceFrom, language),
  healthDays: canon.products.dealHealthCheck.turnaroundBusinessDays,
  creditDays: canon.products.dealHealthCheck.creditDays,
  kycDays: canon.products.kycCheck.turnaroundBusinessDays,
  kycPrice: canon.products.kycCheck.priceFrom ? formatPrice(canon.products.kycCheck.priceFrom, language) : '',
  cooMinMonths: canon.products.fractionalCoo.minMonths,
  cooDays: canon.products.fractionalCoo.daysPerWeek,
  cooNotice: canon.products.fractionalCoo.noticeDays,
});

// Chinese webfont: self-hosted and split by unicode-range (see `notoSansSc` in
// vite.config.ts); used on /zh/ pages only. Prerendered /zh/ pages link it after the first
// paint (src/content/page-head.ts); this adds it when the visitor moves to /zh/ in the browser.
const NOTO_SANS_SC_URL = '/fonts/noto-sans-sc/index.css';
const NOTO_SANS_SC_ID = 'noto-sans-sc';

const useChineseFont = (language: Language) =>
  useEffect(() => {
    if (language !== 'zh' || document.getElementById(NOTO_SANS_SC_ID)) return;
    const link = document.createElement('link');
    link.id = NOTO_SANS_SC_ID;
    link.rel = 'stylesheet';
    link.href = NOTO_SANS_SC_URL;
    document.head.appendChild(link);
  }, [language]);

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


/** The language comes from the URL: `/ru/...` → ru, `/zh/...` → zh, anything else → en. */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const language = getLanguageFromPath(pathname);

  const t = useCallback(
    (key: string, vars?: TranslationVars): string =>
      interpolate(translations[language][key] || key, { ...CANON_VARS(language), ...vars }),
    [language],
  );

  const value = useMemo(() => ({ language, t }), [language, t]);
  useChineseFont(language);

  return (
    <LanguageContext.Provider value={value}>
      <Head htmlAttributes={{ lang: language }}>
        <link rel="alternate" type="application/rss+xml" title={t('feed.title')} href={feedPath(language)} />
      </Head>
      <div lang={language}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
