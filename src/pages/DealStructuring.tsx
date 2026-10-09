import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SectionHeader from '@/components/SectionHeader';
import FeatureGrid from '@/components/FeatureGrid';
import Corridor from '@/components/Corridor';
import RoleNote from '@/components/RoleNote';
import ContactCta from '@/components/ContactCta';
import DocumentsBlock from '@/components/DocumentsBlock';
import { documentsByGroups, sectionHasItems } from '@/content';
import Reveal from '@/hooks/use-reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';

const STAGES = [1, 2, 3, 4];

const DealStructuring: React.FC = () => {
  const { t, language } = useLanguage();
  const { offerCheck, dealHealthCheck } = canon.products;

  const products = [
    {
      name: offerCheck.name,
      summary: t('deal.offerCheck.summary'),
      desc: t('deal.offerCheck.desc'),
      turnaround: t('deal.offerCheck.turnaround', { hours: offerCheck.turnaroundHours }),
    },
    {
      name: dealHealthCheck.name,
      summary: t('deal.healthCheck.summary'),
      desc: t('deal.healthCheck.desc'),
      turnaround: t('deal.healthCheck.turnaround', { days: dealHealthCheck.turnaroundBusinessDays }),
    },
  ];

  return (
    <>
      <PageSEO
        title={t('hero.lineA.title')}
        description={t('seo.dealStructuring.description')}
        path="/services/deal-structuring/"
        crumbs={[
          { name: t('nav.services'), path: '/services/' },
          { name: t('hero.lineA.title'), path: '/services/deal-structuring/' },
        ]}
      />
      <PageHeader label={t('deal.label')} title={t('deal.title')} lead={t('deal.lead')}>
        <div className="mt-12 pt-8 border-t border-border/70 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold mr-3">
              {t('deal.commoditiesLabel')}
            </span>
            {canon.commodities.map((c) => (
              <Link
                key={c.id}
                to={localizePath(`/commodities/${c.id}/`, language)}
                className="px-3 py-1.5 text-sm text-foreground/80 border border-border rounded-sm bg-background hover:border-primary/40 hover:text-primary transition-colors"
              >
                {c.name[language]}
              </Link>
            ))}
          </div>
          <Corridor />
          <p className="text-sm text-muted-foreground">{t('deal.originNote')}</p>
        </div>
      </PageHeader>

      <section id="stages" className="py-32 bg-surface relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('deal.stagesLabel')} title={t('deal.stagesTitle')} />
          <FeatureGrid
            items={STAGES.map((n) => ({ title: t(`deal.stage${n}.title`), desc: t(`deal.stage${n}.desc`) }))}
          />
          <RoleNote className="mt-8" onSurface />
        </div>
      </section>

      <section id="products" className="py-32 relative">
        <div className="absolute top-0 left-0 right-0 line-rule" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            label={t('deal.productsLabel')}
            title={t('deal.productsTitle')}
            subtitle={t('deal.productsSubtitle')}
          />
          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product, i) => (
              <Reveal
                key={product.name}
                delay={i * 120}
                className="bg-secondary/50 border border-border/60 p-8 md:p-10 rounded-sm flex flex-col"
              >
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">{product.name}</h3>
                <p className="text-foreground/80 font-medium mb-5">{product.summary}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">{product.desc}</p>
                <div className="mt-auto pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-sm text-foreground font-semibold">
                      <Clock size={14} className="text-primary" />
                      {product.turnaround}
                    </span>
                    <span className="block text-xs tracking-[0.12em] uppercase text-muted-foreground">
                      {t('common.feeOnRequest')}
                    </span>
                  </div>
                  <Link
                    to={`${localizePath('/contact/', language)}?topic=${encodeURIComponent(product.name)}`}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary"
                  >
                    {t('deal.request', { product: product.name })}
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="by-commodity" className="py-24 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 line-rule" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('nav.commodities')} title={t('deal.crossTitle')} className="mb-12" />
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { to: '/commodities/', label: t('nav.commodities'), text: t('deal.crossCommodities') },
              { to: '/procedures/', label: t('nav.procedures'), text: t('deal.crossProcedures') },
            ]
              .filter((item) => sectionHasItems(item.to))
              .map((item) => (
              <Link
                key={item.to}
                to={localizePath(item.to, language)}
                className="group bg-background border border-border/60 p-8 rounded-sm hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{item.label}</span>
                <span className="flex items-center justify-between gap-4 text-foreground/80 leading-relaxed">
                  {item.text}
                  <ArrowRight size={16} className="text-primary/60 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DocumentsBlock
        id="service-documents"
        documents={documentsByGroups(['services'])}
        label={t('documents.related')}
        title={t('documents.group.services')}
      />
      <ContactCta />
    </>
  );
};

export default DealStructuring;
