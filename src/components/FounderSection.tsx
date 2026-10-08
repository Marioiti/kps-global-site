import React from 'react';
import { Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import Reveal from '@/hooks/use-reveal';
import SectionHeader from '@/components/SectionHeader';

/** The founder's profile from the canon, followed by the one-line team note. */
const FounderSection: React.FC = () => {
  const { t, language } = useLanguage();
  const founder = canon.founder;
  if (!founder) return null;

  const name = founder.name[language];

  return (
    <section id="founder" className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader label={t('founder.label')} title={name} className="mb-12" />
        <Reveal className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-10 lg:gap-16 items-start">
          {founder.photo && (
            <img
              src={founder.photo}
              alt={t('founder.photoAlt', { name })}
              width={1200}
              height={1200}
              loading="lazy"
              className="w-full max-w-[320px] aspect-square object-cover rounded-sm border border-border/60"
            />
          )}
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-5">{founder.role[language]}</p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{founder.bio[language]}</p>
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors"
            >
              <Linkedin size={16} className="text-primary" />
              {t('founder.linkedin')}
            </a>
            <p className="mt-10 pt-8 border-t border-border/60 text-muted-foreground leading-relaxed">
              {t('about.team')}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FounderSection;
