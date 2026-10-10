import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageSEO from '@/components/PageSEO';
import ContactForm from '@/components/ContactForm';
import GlyphHero from '@/components/v3/GlyphHero';
import DossierSection from '@/components/v3/DossierSection';
import { statusClass } from '@/components/v3/status';
import { COMMODITY_GLYPHS } from '@/components/v3/glyphs';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { localizePath } from '@/i18n/locales';
import { findMandate, mandateDescription, sectionHasItems } from '@/content';

const STEPS = [1, 2, 3, 4];

/** /mandates/<id>/: the card, how to get the details, and a request form with the number prefilled. */
const Mandate: React.FC = () => {
  const { t, language } = useLanguage();
  const { id = '' } = useParams();
  const mandate = findMandate(id);
  if (!mandate) return <NotFound />;

  const commodity = canon.commodities.find((c) => c.id === mandate.commodity)?.name[language] ?? mandate.commodity;
  const side = t(`mandate.side.${mandate.side}`);
  const path = `/mandates/${mandate.slug}/`;
  const description = mandateDescription(mandate, language);
  const fields = [
    ['mandate.field.id', mandate.id],
    ['mandate.field.commodity', commodity],
    ['mandate.field.side', side],
    ['mandate.field.volume', mandate.volume],
    ['mandate.field.basis', `${mandate.basis} (Incoterms 2020)`],
    ['mandate.field.originRegion', t(`mandate.region.${mandate.originRegion}`)],
    ['mandate.field.instrument', t(`mandate.instrument.${mandate.instrument}`)],
    ['mandate.field.published', formatDate(mandate.published, language)],
    ['mandate.field.validUntil', formatDate(mandate.validUntil, language)],
  ];

  return (
    <>
      <PageSEO
        title={t('seo.mandate.title', { id: mandate.id, side, commodity })}
        description={description}
        path={path}
        crumbs={[
          { name: t('nav.mandates'), path: '/mandates/' },
          { name: mandate.id, path },
        ]}
      />
      <GlyphHero
        glyph={COMMODITY_GLYPHS[mandate.commodity]}
        crumb={{ label: t('nav.mandates'), path: '/mandates/' }}
        current={mandate.id}
        title={t('mandate.cardTitle', { side, commodity })}
        lead={
          <>
            <p>{description}</p>
            <p className={`text-[15px] font-semibold ${statusClass(mandate.status)}`}>{t(`mandate.status.${mandate.status}`)}</p>
          </>
        }
      />

      <DossierSection id="card" n={1}>
        <h2 className="h2-v3 mb-5">{t('mandate.cardHeading')}</h2>
        <dl className={`max-w-3xl border-b border-border text-base ${mandate.status === 'closed' ? 'text-muted-foreground' : ''}`}>
          {[...fields, ['mandate.field.status', t(`mandate.status.${mandate.status}`)]].map(([labelKey, value]) => (
            <div key={labelKey} className="grid sm:grid-cols-[240px_minmax(0,1fr)] gap-1 sm:gap-6 py-3 border-t border-border">
              <dt className="text-muted-foreground">{t(labelKey)}</dt>
              <dd className="text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-body measure">{t('mandate.role')}</p>
      </DossierSection>

      <DossierSection id="process" n={2} band>
        <h2 className="h2-v3 mb-[26px]">{t('mandate.processTitle')}</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {STEPS.map((n, i) => (
            <li key={n} className={`pt-[18px] lg:pr-5 border-t-[3px] ${i < 2 ? 'border-accent' : 'border-foreground'}`}>
              <h3 className="font-sans text-lg font-semibold text-foreground">{t(`mandate.step${n}.title`)}</h3>
              <p className="text-[15px] text-body">{t(`mandate.step${n}.desc`)}</p>
            </li>
          ))}
        </ol>
        {sectionHasItems('/procedures/') && (
          <Link to={localizePath('/procedures/', language)} className="link-v3 inline-block mt-8 text-base">
            {t('mandate.proceduresLink')}
          </Link>
        )}
      </DossierSection>

      {mandate.status !== 'closed' && (
        <DossierSection id="request" n={3}>
          <h2 className="h2-v3 mb-3">{t('mandate.requestTitle')}</h2>
          <p className="text-body mb-8 measure">{t('mandate.requestSubtitle')}</p>
          <div className="max-w-2xl bg-card border border-border p-6 md:p-9">
            <ContactForm regarding={t('contact.regardingMandate', { id: mandate.id })} need="deal-structuring" />
          </div>
        </DossierSection>
      )}
    </>
  );
};

export default Mandate;
