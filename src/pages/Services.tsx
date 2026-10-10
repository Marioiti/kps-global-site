import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';
import DossierSection from '@/components/v3/DossierSection';
import ServiceRows from '@/components/v3/ServiceRows';
import QuestionsList from '@/components/v3/QuestionsList';
import FinalCta from '@/components/home/FinalCta';
import { SERVICES } from '@/components/service/services';
import { faqJsonLd } from '@/seo/jsonld';

const ROWS = ['who', 'result', 'time', 'fee', 'start'] as const;
const FAQ_COUNT = 4;

/** /services/: the three services as rows with their terms, a comparison table and general questions. */
const Services: React.FC = () => {
  const { t } = useLanguage();
  const title = t('nav.services');
  const faq = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`services.faq.q${i + 1}`),
    answer: t(`services.faq.a${i + 1}`),
  }));
  const cell = (key: string, row: string) => t(`services.compare.${key}.${row}`);

  return (
    <>
      <PageSEO
        title={title}
        description={t('seo.services.description')}
        path="/services/"
        crumbs={[{ name: title, path: '/services/' }]}
        jsonLd={[faqJsonLd(faq)]}
      />

      <GlyphHero glyph="合" title={t('services.hub.title')} lead={<p>{t('services.hub.lead')}</p>} />

      <DossierSection id="services-list" n={1}>
        <h2 className="h2-v3 mb-[30px]">{t('home.what.title')}</h2>
        <ServiceRows />
      </DossierSection>

      <DossierSection id="compare" n={2} band>
        <h2 className="h2-v3 mb-[22px]">{t('services.compare.title')}</h2>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t('services.compare.title')}>
          <table className="w-full min-w-[640px] text-[15px] text-left border-b border-border">
            <thead>
              <tr>
                <td className="w-[18%] py-3" />
                {SERVICES.map((s) => (
                  <th key={s.slug} scope="col" className="py-3 pr-6 font-display text-xl font-medium text-foreground">
                    {t(`${s.menuKey}.title`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row} className={`border-t align-top ${i === 0 ? 'border-foreground' : 'border-border'}`}>
                  <th scope="row" className="py-4 pr-6 font-normal text-muted-foreground">
                    {t(`services.compare.row.${row}`)}
                  </th>
                  {SERVICES.map((s) => (
                    <td key={s.slug} className="py-4 pr-6 text-body">
                      {cell(s.key, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DossierSection>

      <DossierSection id="faq" n={3}>
        <h2 className="h2-v3 mb-6">{t('services.faq.title')}</h2>
        <QuestionsList items={faq} />
      </DossierSection>

      <FinalCta />
    </>
  );
};

export default Services;
