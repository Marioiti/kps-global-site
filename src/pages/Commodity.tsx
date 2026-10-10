import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';
import DossierSection from '@/components/v3/DossierSection';
import CaseRows from '@/components/v3/CaseRows';
import { COMMODITY_GLYPHS } from '@/components/v3/glyphs';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { getCases, getMandates, type CommodityContent } from '@/content';

export interface CommodityData {
  page: CommodityContent | null;
}


/**
 * /commodities/<id>/: the sign, what the deals are and two actions; then the typical
 * specification from a named standard, open offers and requests, and cases with checklists.
 * No commodity prices, producers or countries of origin.
 */
const Commodity: React.FC = () => {
  const data = useLoaderData() as CommodityData | null;
  const page = data?.page;
  const { t, language } = useLanguage();
  if (!page) return <NotFound />;

  const name = canon.commodities.find((c) => c.id === page.id)?.name[language] ?? page.title;
  // Mid-sentence in English: "Check an offer for sulphur"; LNG keeps its capitals.
  const inSentence = language === 'en' && name !== name.toUpperCase() ? name.toLowerCase() : name;
  const path = `/commodities/${page.id}/`;
  const contact = localizePath('/contact/', language);
  const cases = getCases().filter((item) => item.commodityId === page.id);
  const offers = getMandates().filter((m) => m.commodity === page.id && m.status !== 'closed');
  const hasLimit = page.spec?.some((row) => row.limit);
  // The grade line names the standard; a column appears only when rows cite different ones.
  const standards = new Set(page.spec?.map((row) => row.standard).filter(Boolean));
  const standardColumn = standards.size > 1;
  let n = 0;
  const next = () => ++n;

  return (
    <>
      <PageSEO
        title={page.title}
        description={page.description}
        path={path}
        crumbs={[
          { name: t('nav.commodities'), path: '/commodities/' },
          { name: page.title, path },
        ]}
      />

      <GlyphHero
        glyph={COMMODITY_GLYPHS[page.id]}
        crumb={{ label: t('nav.commodities'), path: '/commodities/' }}
        current={name}
        title={name}
        lead={
          <>
            <p>{page.summary}</p>
            <p>{page.breaks}</p>
            <p className="text-[15px] text-muted-foreground">{t('deal.originNote')}</p>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3.5">
          <Link to={`${contact}?service=offer-check&commodity=${page.id}`} className="btn-accent">
            {t('commodity.check', { commodity: inSentence })}
          </Link>
          <Link to={`${contact}?intent=proposal&commodity=${page.id}`} className="btn-outline">
            {t('cta.proposal')}
          </Link>
        </div>
      </GlyphHero>

      {page.spec && page.spec.length > 0 && (
        <DossierSection id="spec" n={next()}>
          <h2 className="h2-v3 mb-3">{t('commodity.spec.label')}</h2>
          <p className="text-base text-muted-foreground mb-6 measure">
            {page.grade}
            {hasLimit && <>. {t('commodity.spec.note')}</>}
          </p>
          <div className="overflow-x-auto max-w-4xl" tabIndex={0} role="region" aria-label={t('commodity.spec.label')}>
            <table className="w-full text-[15px] text-left tabular-nums border-b border-border">
              <thead>
                <tr className="text-sm text-muted-foreground">
                  <th scope="col" className="py-3 pr-6 font-normal">{t('commodity.spec.parameter')}</th>
                  {hasLimit && <th scope="col" className="py-3 pr-6 font-normal">{t('commodity.spec.limit')}</th>}
                  {standardColumn && <th scope="col" className="py-3 font-normal">{t('commodity.spec.standard')}</th>}
                </tr>
              </thead>
              <tbody>
                {page.spec.map((row, i) => (
                  <tr key={row.parameter} className={`border-t ${i === 0 ? 'border-foreground' : 'border-border'}`}>
                    <th scope="row" className="py-3 pr-6 font-normal text-foreground">{row.parameter}</th>
                    {hasLimit && <td className="py-3 pr-6 text-body">{row.limit ?? ''}</td>}
                    {standardColumn && <td className="py-3 text-muted-foreground whitespace-nowrap">{row.standard ?? ''}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page.specNote && <p className="mt-4 text-[15px] text-body measure">{page.specNote}</p>}
        </DossierSection>
      )}

      <DossierSection id="offers" n={next()} band>
        <h2 className="h2-v3 mb-3">{t('commodity.offers.title')}</h2>
        {offers.length > 0 ? (
          <>
            <p className="text-base text-muted-foreground mb-6 measure">{t('commodity.offers.note')}</p>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t('commodity.offers.title')}>
              <table className="w-full min-w-[560px] text-[15px] text-left border-b border-border">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th scope="col" className="py-3 pr-6 font-normal">{t('mandate.field.side')}</th>
                    <th scope="col" className="py-3 pr-6 font-normal">{t('commodity.offers.volumeBasis')}</th>
                    <th scope="col" className="py-3 pr-6 font-normal">{t('mandate.field.status')}</th>
                    <td className="py-3" />
                  </tr>
                </thead>
                <tbody>
                  {offers.map((m) => (
                    <tr key={m.slug} className="border-t border-border">
                      <th scope="row" className="py-3.5 pr-6 font-semibold text-foreground">{t(`mandate.side.${m.side}`)}</th>
                      <td className="py-3.5 pr-6 text-body">{`${m.volume}, ${m.basis}`}</td>
                      <td className={`py-3.5 pr-6 ${m.status === 'open' ? 'text-status-green' : 'text-status-amber'}`}>{t(`mandate.status.${m.status}`)}</td>
                      <td className="py-3.5 text-right">
                        <Link to={localizePath(`/mandates/${m.slug}/`, language)} className="link-v3">
                          {t('commodity.offers.details')}
                          <span className="sr-only"> {m.id}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-body">
            {t('commodity.offers.none')}{' '}
            <Link to={`${contact}?intent=proposal&commodity=${page.id}`} className="link-v3">
              {t('cta.proposal')}
            </Link>
          </p>
        )}
      </DossierSection>

      <DossierSection id="results" n={next()}>
        <h2 className="h2-v3 mb-[22px]">{t('commodity.files.title', { commodity: name })}</h2>
        {cases.length > 0 && <CaseRows cases={cases} withoutCommodity />}
        <p className={`text-body ${cases.length > 0 ? 'mt-6' : ''}`}>
          {t('commodity.checklists.before')}{' '}
          <Link to={localizePath('/documents/before-loi/', language)} className="link-v3">
            {t('commodity.checklists.loi')}
          </Link>{' '}
          {t('commodity.checklists.and')}{' '}
          <Link to={localizePath('/documents/before-payment/', language)} className="link-v3">
            {t('commodity.checklists.payment')}
          </Link>
          .
        </p>
      </DossierSection>
    </>
  );
};

export default Commodity;
