import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';
import { Layers, Globe } from 'lucide-react';
import { canon } from '@/data/canon';
import Corridor from '@/components/Corridor';

const CapabilitiesSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="sectors" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
            {t('sectors.sectionLabel')}
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          {t('sectors.title')}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mb-16">
          {t('sectors.subtitle')}
        </p>

        {/* Sectors + offices */}
        <div className="grid lg:grid-cols-2 gap-px bg-border/30 overflow-hidden rounded-sm">
          {/* Sectors */}
          <Reveal className="bg-background p-10 md:p-14">
            <Layers size={30} className="text-primary/60 mb-8" strokeWidth={1.5} />
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">
              {t('sectors.industries.title')}
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {canon.commodities.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1.5 text-sm text-foreground/80 border border-border rounded-sm bg-background"
                >
                  {c.name[language]}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('sectors.industries.projects')}
            </p>
          </Reveal>

          {/* Offices and corridor */}
          <Reveal delay={140} className="bg-background p-10 md:p-14">
            <Globe size={30} className="text-primary/60 mb-8" strokeWidth={1.5} />
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">
              {t('sectors.presenceTitle')}
            </h3>
            {canon.offices.length > 0 && (
              <>
                <span className="text-xs tracking-[0.2em] uppercase text-primary/70 font-semibold block mb-4">
                  {t('sectors.officesLabel')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                  {canon.offices.map((o) => (
                    <div key={o.city.en}>
                      <div className="text-foreground font-semibold">{o.city[language]}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">{o.country[language]}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="mt-8 pt-6 border-t border-border/60">
              <span className="text-xs tracking-[0.2em] uppercase text-primary/70 font-semibold block mb-4">
                {t('sectors.corridorLabel')}
              </span>
              <Corridor />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
