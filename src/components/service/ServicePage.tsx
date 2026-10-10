import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon, formatPrice } from '@/data/canon';
import { localizePath } from '@/i18n/locales';
import { getCases } from '@/content';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';
import DossierSection from '@/components/v3/DossierSection';
import RuledList from '@/components/v3/RuledList';
import CaseRows from '@/components/v3/CaseRows';
import QuestionsList from '@/components/v3/QuestionsList';
import FinalCta from '@/components/home/FinalCta';
import { faqJsonLd, serviceJsonLd } from '@/seo/jsonld';
import { serviceBySlug, serviceFaq, type ServiceSlug } from './services';

const count = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/**
 * One service page: the page sign and the promise, then numbered sections: when clients call us,
 * how it runs, fees, cases of the service (when there are any), questions, and a proposal.
 */
const ServicePage: React.FC<{ slug: ServiceSlug }> = ({ slug }) => {
  const { t, language } = useLanguage();
  const config = serviceBySlug(slug);
  const k = (key: string) => t(`svc.${config.key}.${key}`);
  const name = t(`${config.menuKey}.title`);
  const path = `/services/${slug}/`;
  const faq = serviceFaq(config, t);
  const cases = getCases().filter((item) => item.services.includes(slug));
  const contact = localizePath('/contact/', language);
  const proposal = `${contact}?intent=proposal&service=${slug}`;
  let n = 0;
  const next = () => ++n;

  return (
    <>
      <PageSEO
        title={t(config.seoTitleKey)}
        description={t(config.seoKey)}
        path={path}
        crumbs={[
          { name: t('nav.services'), path: '/services/' },
          { name, path },
        ]}
        jsonLd={[
          serviceJsonLd({ name, serviceType: config.serviceType, description: t(config.seoKey), path, language }),
          faqJsonLd(faq),
        ]}
      />

      <GlyphHero glyph={config.glyph} crumb={{ label: t('nav.services'), path: '/services/' }} current={name} title={k('title')} lead={<p>{k('lead')}</p>}>
        <div className="flex flex-wrap items-center gap-3.5">
          <Link to={proposal} className="btn-accent">
            {t('cta.proposal')}
          </Link>
          {config.offerAction && (
            <Link to={`${contact}?service=offer-check`} className="btn-outline">
              {t('cta.sendOffer')}
            </Link>
          )}
        </div>
      </GlyphHero>

      <DossierSection id="when" n={next()}>
        <h2 className="h2-v3 mb-[22px]">{t('svc.when.title')}</h2>
        <RuledList items={count(config.when).map((i) => ({ key: String(i), content: <p className="py-3.5 text-body">{k(`when${i}`)}</p> }))} />
      </DossierSection>

      <DossierSection id="how" n={next()} band>
        <h2 className="h2-v3 mb-[26px]">{t('svc.how.title')}</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {config.steps.map((step, i) => (
            <li key={step} className={`pt-[18px] lg:pr-5 border-t-[3px] ${i < 2 ? 'border-accent' : 'border-foreground'}`}>
              <h3 className="font-sans text-lg font-semibold text-foreground">{k(`${step}.title`)}</h3>
              <p className="text-[15px] text-body">{k(`${step}.desc`)}</p>
            </li>
          ))}
        </ol>
      </DossierSection>

      <DossierSection id="fees" n={next()}>
        <h2 className="h2-v3 mb-[22px]">{t('svc.fees.title')}</h2>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t('svc.fees.title')}>
          <table className="w-full min-w-[540px] text-left tabular-nums border-b border-border">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th scope="col" className="py-3 pr-6 font-normal">{t('svc.fees.work')}</th>
                <th scope="col" className="py-3 pr-6 font-normal w-[200px]">{t('svc.fees.time')}</th>
                <th scope="col" className="py-3 font-normal w-[200px]">{t('svc.fees.fee')}</th>
              </tr>
            </thead>
            <tbody>
              {config.fees.map((row, i) => {
                const price = row.price ? canon.products[row.price].priceFrom : null;
                return (
                  <tr key={row.key} className={`border-t align-top ${i === 0 ? 'border-foreground' : 'border-border'}`}>
                    <th scope="row" className="py-4 pr-6 font-normal text-body">
                      <strong className="font-semibold text-foreground">{t(`${row.key}.name`)}.</strong> {t(`${row.key}.desc`)}
                    </th>
                    <td className="py-4 pr-6 text-body">{t(row.time)}</td>
                    <td className="py-4">
                      {price ? (
                        <span className="font-display text-[22px] text-foreground">{t('svc.fee.from', { price: formatPrice(price, language) })}</span>
                      ) : (
                        <Link to={proposal} className="link-v3">
                          {t('cta.proposal')}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-[18px] text-[15px] text-muted-foreground">{t(config.feesNote)}</p>
      </DossierSection>

      {cases.length > 0 && (
        <DossierSection id="results" n={next()} band>
          <h2 className="h2-v3 mb-[22px]">{t('svc.files.title')}</h2>
          <CaseRows cases={cases} />
          <Link to={`${localizePath('/about/', language)}#cases`} className="link-v3 inline-block mt-[18px] text-base">
            {t('home.cases.all')}
          </Link>
        </DossierSection>
      )}

      <DossierSection id="faq" n={next()} band={cases.length === 0}>
        <h2 className="h2-v3 mb-6">{t('svc.faq.title')}</h2>
        <QuestionsList items={faq} />
      </DossierSection>

      <FinalCta title={t(config.finalKey)} bare action={{ label: t('cta.proposal'), to: proposal }} />
    </>
  );
};

export default ServicePage;
