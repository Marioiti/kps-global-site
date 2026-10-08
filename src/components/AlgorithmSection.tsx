import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';

const AlgorithmSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    { num: '01', titleKey: 'approach.step1.title', descKey: 'approach.step1.desc' },
    { num: '02', titleKey: 'approach.step2.title', descKey: 'approach.step2.desc' },
    { num: '03', titleKey: 'approach.step3.title', descKey: 'approach.step3.desc' },
    { num: '04', titleKey: 'approach.step4.title', descKey: 'approach.step4.desc' },
    { num: '05', titleKey: 'approach.step5.title', descKey: 'approach.step5.desc' },
    { num: '06', titleKey: 'approach.step6.title', descKey: 'approach.step6.desc' },
  ];

  return (
    <section id="approach" className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
            {t('approach.sectionLabel')}
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          {t('approach.title')}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mb-20">
          {t('approach.subtitle')}
        </p>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 overflow-hidden rounded-sm">
          {steps.map((step, i) => (
            <Reveal
              key={step.num}
              delay={(i % 3) * 100}
              className="bg-background p-8 md:p-10 group hover:bg-secondary/20 transition-colors duration-500 relative"
            >
              {/* Step number */}
              <span className="text-5xl font-serif text-accent/70 group-hover:text-accent transition-colors duration-500 absolute top-6 right-8">
                {step.num}
              </span>

              <div className="relative z-10 mt-12">
                <h3 className="font-serif text-xl text-foreground mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>

              {/* Connector line (visual only) */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Reveal>
          ))}
        </div>

        {/* Engagement & fees */}
        <Reveal className="mt-8 border border-primary/20 bg-primary/[0.03] rounded-sm p-8 md:p-10">
          <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">
            {t('approach.feeTitle')}
          </span>
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            {t('approach.feeDesc')}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default AlgorithmSection;
