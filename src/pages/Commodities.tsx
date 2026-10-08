import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import Corridor from '@/components/Corridor';
import ContactCta from '@/components/ContactCta';
import Reveal from '@/hooks/use-reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { commodityCard, sectionHasItems } from '@/content';

/** /commodities/: one card per commodity, and the way into the procedures. */
const Commodities: React.FC = () => {
  const { t, language } = useLanguage();
  const title = t('nav.commodities');

  return (
    <>
      <PageSEO
        title={title}
        description={t('seo.commodities.description')}
        path="/commodities/"
        crumbs={[{ name: title, path: '/commodities/' }]}
      />
      <PageHeader label={title} title={t('commodities.title')} lead={t('commodities.lead')}>
        <div className="mt-12 pt-8 border-t border-border/70 space-y-4">
          <Corridor />
          <p className="text-sm text-muted-foreground">{t('deal.originNote')}</p>
        </div>
      </PageHeader>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {canon.commodities.map((commodity, i) => {
            const card = commodityCard(commodity.id, language);
            return (
              <Reveal key={commodity.id} delay={(i % 3) * 100}>
                <Link
                  to={localizePath(`/commodities/${commodity.id}/`, language)}
                  className="group h-full flex flex-col bg-secondary/50 border border-border/60 p-8 rounded-sm hover:bg-secondary/70 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">{commodity.name[language]}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card?.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary/80 group-hover:text-primary">
                    {t('common.learnMore')}
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}

          {sectionHasItems('/procedures/') && (
            <Reveal delay={200}>
              <Link
                to={localizePath('/procedures/', language)}
                className="group h-full flex flex-col border border-primary/20 bg-primary/[0.03] p-8 rounded-sm hover:border-primary/40 transition-colors duration-300"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{t('nav.procedures')}</span>
                <p className="text-foreground/80 leading-relaxed mb-6">{t('commodities.proceduresText')}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary/80 group-hover:text-primary">
                  {t('commodities.proceduresLink')}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <ContactCta />
    </>
  );
};

export default Commodities;
