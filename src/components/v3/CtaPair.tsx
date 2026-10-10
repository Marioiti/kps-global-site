import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';

/** The two actions of the site: send an offer for a check, or ask for a proposal. */
const CtaPair: React.FC<{ large?: boolean; className?: string }> = ({ large = false, className = '' }) => {
  const { t, language } = useLanguage();
  const contact = localizePath('/contact/', language);
  const size = large ? 'md:px-[30px] md:py-[18px] md:text-[17px]' : '';
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <Link to={`${contact}?service=offer-check`} className={`btn-accent ${size}`}>
        {t('cta.sendOffer')}
      </Link>
      <Link to={`${contact}?intent=proposal`} className={`btn-outline ${size}`}>
        {t('cta.proposal')}
      </Link>
    </div>
  );
};

export default CtaPair;
