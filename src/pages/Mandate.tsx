import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SectionHeader from '@/components/SectionHeader';
import FeatureGrid from '@/components/FeatureGrid';
import ContactSection from '@/components/ContactSection';
import { MandateStatus } from '@/components/MandateCard';
import Reveal from '@/hooks/use-reveal';
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
      <PageHeader label={`${t('mandate.label')} ${mandate.id}`} title={t('mandate.cardTitle', { side, commodity })} lead={description}>
        <div className="mt-8">
          <MandateStatus status={mandate.status} />
        </div>
      </PageHeader>

      <section id="card" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Link
            to={localizePath('/mandates/', language)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            {t('mandate.back')}
          </Link>
          <Reveal className={mandate.status === 'closed' ? 'opacity-70' : ''}>
            <dl className="border border-border/60 rounded-sm divide-y divide-border/40 bg-background">
              {fields.map(([labelKey, value]) => (
                <div key={labelKey} className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 px-6 py-4">
                  <dt className="text-xs tracking-[0.15em] uppercase text-muted-foreground pt-0.5">{t(labelKey)}</dt>
                  <dd className="text-sm text-foreground">{value}</dd>
                </div>
              ))}
              <div className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 px-6 py-4">
                <dt className="text-xs tracking-[0.15em] uppercase text-muted-foreground pt-0.5">{t('mandate.field.status')}</dt>
                <dd>
                  <MandateStatus status={mandate.status} />
                </dd>
              </div>
            </dl>
          </Reveal>
          <p className="mt-8 text-foreground/80 leading-relaxed border-l-2 border-accent pl-4">{t('mandate.role')}</p>
        </div>
      </section>

      <section id="process" className="py-24 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 line-rule" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('mandate.processLabel')} title={t('mandate.processTitle')} className="mb-12" />
          <FeatureGrid
            items={STEPS.map((n) => ({ title: t(`mandate.step${n}.title`), desc: t(`mandate.step${n}.desc`) }))}
          />
          {sectionHasItems('/procedures/') && (
            <Link
              to={localizePath('/procedures/', language)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary underline-offset-4 hover:underline"
            >
              {t('mandate.proceduresLink')}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </section>

      {mandate.status !== 'closed' && (
        <section id="request" className="pt-24 relative">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <SectionHeader label={t('mandate.label')} title={t('mandate.requestTitle')} subtitle={t('mandate.requestSubtitle')} className="mb-0" />
          </div>
          <ContactSection heading={false} topic={mandate.id} commodity={mandate.commodity} />
        </section>
      )}
    </>
  );
};

export default Mandate;
