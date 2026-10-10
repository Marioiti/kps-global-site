import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';
import { localizePath, stripLanguagePrefix } from '@/i18n/locales';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: '中文' },
];

interface LanguageSwitcherProps {
  className?: string;
  onNavigate?: () => void;
}

/** Links to the current page in each language. */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className, onNavigate }) => {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const basePath = stripLanguagePrefix(pathname);

  return (
    <div className={className}>
      {languages.map((lang) => (
        <Link
          key={lang.code}
          to={localizePath(basePath, lang.code)}
          hrefLang={lang.code}
          aria-current={language === lang.code ? 'true' : undefined}
          onClick={onNavigate}
          className={`inline-flex min-h-[44px] items-center px-1 underline-offset-[6px] hover:underline ${
            language === lang.code ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.label}
        </Link>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
