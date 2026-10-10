import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import RuledList from './RuledList';

/** The three services with their characters, a line each, the terms and a proposal link. */
const SERVICE_ROWS = [
  { glyph: '合同', key: 'menu.deals', slug: 'deal-structuring', terms: 'home.what.dealsTerms' },
  { glyph: '合规', key: 'menu.kyc', slug: 'compliance-kyc', terms: 'home.what.kycTerms' },
  { glyph: '合作', key: 'menu.coo', slug: 'fractional-coo', terms: 'home.what.cooTerms' },
] as const;

const ServiceRows: React.FC = () => {
  const { t, language } = useLanguage();
  const contact = localizePath('/contact/', language);
  return (
    <RuledList
      strong
      items={SERVICE_ROWS.map((s) => ({
        key: s.slug,
        content: (
          <div className="grid grid-cols-[72px_minmax(0,1fr)] md:grid-cols-[104px_minmax(0,1fr)_minmax(0,200px)] gap-x-4 md:gap-x-6 gap-y-3 py-6">
            <span aria-hidden="true" className="font-seal font-black text-2xl md:text-[32px] leading-tight text-accent">
              {s.glyph}
            </span>
            <div>
              <h3 className="font-display text-[23px] mb-1">
                <Link to={localizePath(`/services/${s.slug}/`, language)} className="underline-offset-[5px] hover:underline">
                  {t(`${s.key}.title`)}
                </Link>
              </h3>
              <p className="text-body">{t(`home.what.${s.slug}`)}</p>
            </div>
            <p className="col-start-2 md:col-start-auto text-[15px] text-muted-foreground">
              {t(s.terms)}
              <br />
              <Link to={`${contact}?intent=proposal&service=${s.slug}`} className="link-v3 text-foreground">
                {t('cta.proposal')}
              </Link>
            </p>
          </div>
        ),
      }))}
    />
  );
};

export default ServiceRows;
