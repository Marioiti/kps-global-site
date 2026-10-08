import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SectionHeader from '@/components/SectionHeader';
import FeatureGrid from '@/components/FeatureGrid';
import ContactCta from '@/components/ContactCta';
import Reveal from '@/hooks/use-reveal';
import { useLanguage } from '@/contexts/LanguageContext';

const AREAS = [1, 2, 3, 4];

const FractionalCoo: React.FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <PageSEO
        title={t('hero.lineB.title')}
        description={t('seo.fractionalCoo.description')}
        path="/services/fractional-coo/"
        crumbs={[
          { name: t('nav.services'), path: '/services/' },
          { name: t('hero.lineB.title'), path: '/services/fractional-coo/' },
        ]}
      />
      <PageHeader label={t('coo.label')} title={t('coo.title')} lead={t('coo.lead')} />

      <section id="scope" className="py-32 bg-surface relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('coo.areasLabel')} title={t('coo.areasTitle')} />
          <FeatureGrid
            items={AREAS.map((n) => ({ title: t(`coo.area${n}.title`), desc: t(`coo.area${n}.desc`) }))}
          />
          <Reveal className="mt-8 border border-primary/20 bg-primary/[0.03] rounded-sm p-8 md:p-10">
            <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{t('coo.formatTitle')}</span>
            <p className="text-foreground/80 leading-relaxed max-w-3xl">{t('coo.formatDesc')}</p>
          </Reveal>
        </div>
      </section>

      <ContactCta />
    </>
  );
};

export default FractionalCoo;
