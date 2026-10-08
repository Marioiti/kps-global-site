import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SectionHeader from '@/components/SectionHeader';
import FeatureGrid from '@/components/FeatureGrid';
import ContentCard from '@/components/ContentCard';
import ContactCta from '@/components/ContactCta';
import OpenMandates from '@/components/OpenMandates';
import DocumentsBlock from '@/components/DocumentsBlock';
import Reveal from '@/hooks/use-reveal';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternalLinks } from '@/hooks/use-internal-links';
import { localizePath } from '@/i18n/locales';
import { documentsByGroups, relatedToCommodity, type CommodityContent, type Collection } from '@/content';
import type { CommodityFullPage } from '@/content/schema';

export interface CommodityData {
  page: CommodityContent | null;
}

/** Related material groups, in display order. Mandates and documents join as their sections appear. */
const RELATED: { collection: Collection; titleKey: string }[] = [
  { collection: 'insights', titleKey: 'nav.insights' },
  { collection: 'procedures', titleKey: 'nav.procedures' },
];

/** /commodities/<id>/: a full page, or a short card for commodities with `format: short`. */
const Commodity: React.FC = () => {
  const data = useLoaderData() as CommodityData | null;
  const page = data?.page;
  if (!page) return <NotFound />;
  return page.format === 'short' ? <ShortCommodity page={page} /> : <FullCommodity page={page as CommodityContent & CommodityFullPage} />;
};

const CommoditySEO: React.FC<{ page: CommodityContent }> = ({ page }) => {
  const { t } = useLanguage();
  const path = `/commodities/${page.id}/`;
  return (
    <PageSEO
      title={page.title}
      description={page.description}
      path={path}
      crumbs={[
        { name: t('nav.commodities'), path: '/commodities/' },
        { name: page.title, path },
      ]}
    />
  );
};

const BackLink: React.FC = () => {
  const { t, language } = useLanguage();
  return (
    <Link
      to={localizePath('/commodities/', language)}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
    >
      <ArrowLeft size={16} />
      {t('nav.commodities')}
    </Link>
  );
};

/** Checklists by deal step: the same for every commodity. */
const CommodityDocuments: React.FC = () => {
  const { t } = useLanguage();
  return (
    <DocumentsBlock
      id="commodity-documents"
      documents={documentsByGroups(['checklists'])}
      label={t('commodity.related')}
      title={t('documents.group.checklists')}
    />
  );
};

const Cta: React.FC<{ page: CommodityContent }> = ({ page }) => {
  const { t } = useLanguage();
  return (
    <ContactCta
      title={t('commodity.ctaTitle')}
      subtitle={t('article.ctaSubtitle')}
      label={t('commodity.ctaLabel')}
      topic={page.title}
    />
  );
};

/** Three paragraphs: the deal and who it is for, what we check and how we structure it, the origin line. */
const ShortCommodity: React.FC<{ page: CommodityContent }> = ({ page }) => {
  const { t } = useLanguage();
  const onBodyClick = useInternalLinks();
  return (
    <>
      <CommoditySEO page={page} />
      <PageHeader label={t('nav.commodities')} title={page.title} lead={page.summary} />
      <section id="deal" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <BackLink />
          <div
            className="prose prose-slate max-w-none prose-a:text-primary prose-a:underline-offset-4"
            onClick={onBodyClick}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          <p className="mt-5 text-foreground/80 leading-relaxed border-l-2 border-accent pl-4">{t('deal.originNote')}</p>
        </div>
      </section>
      <OpenMandates commodity={page.id} surface />
      <CommodityDocuments />
      <Cta page={page} />
    </>
  );
};

const FullCommodity: React.FC<{ page: CommodityContent & CommodityFullPage }> = ({ page }) => {
  const { t } = useLanguage();
  const onBodyClick = useInternalLinks();
  const listTitle = t('nav.commodities');
  const related = RELATED.map((group) => ({ ...group, items: relatedToCommodity(group.collection, page.id) })).filter(
    (group) => group.items.length > 0,
  );
  const structure = [
    { title: t('commodity.basis'), desc: page.structure.basis },
    { title: t('commodity.payment'), desc: page.structure.payment },
    { title: t('commodity.inspection'), desc: page.structure.inspection },
  ];

  return (
    <>
      <CommoditySEO page={page} />
      <PageHeader label={listTitle} title={page.title} lead={page.summary}>
        <p className="mt-10 pt-6 border-t border-border/70 text-sm text-muted-foreground">{t('deal.originNote')}</p>
      </PageHeader>

      <section id="deal" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <BackLink />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">{t('commodity.dealTitle')}</h2>
          <div
            className="prose prose-slate max-w-none prose-a:text-primary prose-a:underline-offset-4"
            onClick={onBodyClick}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </div>
      </section>

      <section id="checks" className="py-24 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 line-rule" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('commodity.checksLabel')} title={t('commodity.checksTitle')} className="mb-12" />
          <Reveal as="div" className="grid md:grid-cols-2 gap-x-12 gap-y-5 max-w-5xl">
            {page.checks.map((check) => (
              <p key={check} className="flex gap-3 text-foreground/80 leading-relaxed">
                <Check size={18} className="text-primary shrink-0 mt-1" />
                <span>{check}</span>
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="structure" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('commodity.structureLabel')} title={t('commodity.structureTitle')} className="mb-12" />
          <FeatureGrid items={structure} columns={3} />
        </div>
      </section>

      <section id="route" className="py-24 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 line-rule" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('commodity.routeLabel')} title={t('commodity.routeTitle')} className="mb-12" />
          <FeatureGrid items={page.route.map((step) => ({ title: step.title, desc: step.detail }))} columns={3} />
        </div>
      </section>

      <section id="stalls" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('commodity.stallsLabel')} title={t('commodity.stallsTitle')} className="mb-12" />
          <Reveal className="border border-primary/20 bg-primary/[0.03] rounded-sm p-8 md:p-10 max-w-5xl">
            <ul className="space-y-4">
              {page.stalls.map((stall) => (
                <li key={stall} className="flex gap-3 text-foreground/80 leading-relaxed">
                  <span className="text-accent shrink-0">—</span>
                  <span>{stall}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <OpenMandates commodity={page.id} />
      <CommodityDocuments />

      {related.map((group) => (
        <section key={group.collection} className="py-24 bg-surface relative">
          <div className="absolute top-0 left-0 right-0 line-rule" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionHeader label={t('commodity.related')} title={t(group.titleKey)} className="mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {group.items.slice(0, 3).map((entry) => (
                <ContentCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <Cta page={page} />
    </>
  );
};

export default Commodity;
