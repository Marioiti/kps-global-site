import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';
import StatsBand from '@/components/StatsBand';

interface AboutSectionProps {
  /** Off when the page header already carries the title and lead (the /about/ page). */
  heading?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ heading = true }) => {
  const { t } = useLanguage();
  // Without the section heading the principles sit right under the page h1.
  const PrincipleHeading = heading ? 'h3' : 'h2';

  const principles = [
    { titleKey: 'about.p1.title', descKey: 'about.p1.desc' },
    { titleKey: 'about.p2.title', descKey: 'about.p2.desc' },
    { titleKey: 'about.p3.title', descKey: 'about.p3.desc' },
  ];

  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {heading && (
          <>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
                {t('about.sectionLabel')}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              {t('about.title')}
            </h2>

            {/* Lead */}
            <div className="mb-12 max-w-3xl space-y-5">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.lead')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.team')}
              </p>
            </div>
          </>
        )}

        <StatsBand className="mb-20" />

        {/* Three principles */}
        <div className="grid md:grid-cols-3 gap-px bg-border/30 overflow-hidden rounded-sm">
          {principles.map((p, i) => (
            <Reveal
              key={p.titleKey}
              delay={i * 120}
              className="bg-background p-8 md:p-12 group hover:bg-secondary/30 transition-colors duration-500"
            >
              <span className="text-xs tracking-[0.2em] uppercase text-primary mb-4 block">
                {String(i + 1).padStart(2, '0')}
              </span>
              <PrincipleHeading className="font-serif text-2xl text-foreground mb-3">
                {t(p.titleKey)}
              </PrincipleHeading>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t(p.descKey)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
