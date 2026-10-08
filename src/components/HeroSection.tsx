import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import Corridor from '@/components/Corridor';
import { ArrowRight } from 'lucide-react';

const LINES = [
  { prefix: 'hero.lineA', path: '/services/deal-structuring/' },
  { prefix: 'hero.lineB', path: '/services/fractional-coo/' },
];

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden border-b border-border">
      {/* Ambient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(110% 90% at 15% 0%, hsl(var(--paper)) 0%, hsl(var(--background)) 55%)',
        }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <span className="w-6 h-px bg-accent" />
            <span className="text-xs tracking-[0.25em] uppercase text-primary/70 font-semibold">
              {t('hero.badge')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-[4.4rem] font-extrabold leading-[1.04] tracking-tight text-foreground mb-7 max-w-3xl text-balance opacity-0 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.55s' }}>
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Two equal lines */}
        <div className="grid md:grid-cols-2 gap-px bg-border/40 overflow-hidden rounded-sm max-w-5xl mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '0.65s' }}>
          {LINES.map((line) => (
            <Link
              key={line.prefix}
              to={localizePath(line.path, language)}
              className="group bg-background/80 p-7 md:p-8 hover:bg-secondary/40 transition-colors duration-300"
            >
              <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">
                {t(`${line.prefix}.label`)}
              </span>
              <span className="flex items-center justify-between gap-4 font-semibold text-lg text-foreground mb-2">
                {t(`${line.prefix}.title`)}
                <ArrowRight size={16} className="text-primary/60 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="block text-muted-foreground text-sm leading-relaxed">{t(`${line.prefix}.desc`)}</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-5 opacity-0 animate-fade-in" style={{ animationDelay: '0.75s' }}>
          <Link
            to={localizePath('/contact/', language)}
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground text-sm tracking-wide font-semibold hover:bg-primary/90 hover:gap-4 transition-all duration-300 rounded-sm"
          >
            {t('hero.cta')}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to={localizePath('/services/', language)}
            className="text-sm font-medium text-primary/80 hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            {t('hero.secondaryCta')}
          </Link>
        </div>

        {/* Corridor */}
        <div className="mt-16 pt-8 border-t border-border/70 opacity-0 animate-fade-in" style={{ animationDelay: '1s' }}>
          <Corridor />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
