import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { translations, interpolate, Language, TranslationVars } from '@/i18n/translations';
import { getLanguageFromPath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { feedPath } from '@/seo/feed';

interface LanguageContextType {
  language: Language;
  /** Looks up a string and fills `{placeholders}`; brand, legal name and email are always available. */
  t: (key: string, vars?: TranslationVars) => string;
}

const CANON_VARS: TranslationVars = {
  brand: canon.brand,
  legalName: canon.legal.name,
  email: canon.contacts.email,
};

// Chinese webfont: self-hosted and split by unicode-range (see `notoSansSc` in
// vite.config.ts); linked on /zh/ pages only.
const NOTO_SANS_SC_URL = '/fonts/noto-sans-sc/index.css';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


/** The language comes from the URL: `/ru/...` → ru, `/zh/...` → zh, anything else → en. */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const language = getLanguageFromPath(pathname);

  const t = useCallback(
    (key: string, vars?: TranslationVars): string =>
      interpolate(translations[language][key] || key, { ...CANON_VARS, ...vars }),
    [language],
  );

  const value = useMemo(() => ({ language, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      <Head htmlAttributes={{ lang: language }}>
        <link rel="alternate" type="application/rss+xml" title={t('feed.title')} href={feedPath(language)} />
        {language === 'zh' && <link rel="stylesheet" href={NOTO_SANS_SC_URL} />}
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
