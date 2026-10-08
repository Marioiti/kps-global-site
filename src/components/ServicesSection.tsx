import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import Reveal from '@/hooks/use-reveal';
import { Handshake, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

const lines = [
  { key: 'dealStructuring', labelKey: 'hero.lineA.label', path: '/services/deal-structuring/', icon: Handshake },
  { key: 'fractionalCoo', labelKey: 'hero.lineB.label', path: '/services/fractional-coo/', icon: Compass },
];

const support = {
  key: 'complianceKyc',
  labelKey: 'services.supportLabel',
  path: '/services/compliance-kyc/',
  icon: ShieldCheck,
};

type Item = typeof support;

/** Two equal lines side by side, compliance & KYC underneath both. */
interface ServicesSectionProps {
  /** Off when the page header already carries the title (the /services/ page). */
  heading?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ heading = true }) => {
  const { t, language } = useLanguage();

  // Without the section heading the cards sit right under the page h1.
  const CardHeading = heading ? 'h3' : 'h2';

  const card = (item: Item, wide = false) => {
    const Icon = item.icon;
    return (
      <Link
        to={localizePath(item.path, language)}
        className={`w-full h-full text-left bg-secondary/50 border border-border/60 p-8 md:p-10 group hover:bg-secondary/70 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background rounded-sm block ${
          wide ? 'md:flex md:items-start md:gap-10' : ''
        }`}
      >
        <Icon
          size={24}
          className="text-foreground/70 mb-6 group-hover:text-primary transition-colors shrink-0"
          strokeWidth={1.5}
        />
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{t(item.labelKey)}</span>
          <CardHeading className="font-semibold text-base text-foreground mb-4">{t(`services.${item.key}.title`)}</CardHeading>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t(`services.${item.key}.desc`)}</p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary/80 group-hover:text-primary">
            {t('common.learnMore')}
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section id="services" className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {heading && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
                {t('services.sectionLabel')}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              {t('services.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mb-20">
              {t('services.subtitle')}
            </p>
          </>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {lines.map((line, i) => (
            <Reveal key={line.key} delay={i * 120} as="div">
              {card(line)}
            </Reveal>
          ))}
        </div>
        <Reveal delay={240} as="div">
          {card(support, true)}
        </Reveal>
      </div>
    </section>
  );
};

export default ServicesSection;
