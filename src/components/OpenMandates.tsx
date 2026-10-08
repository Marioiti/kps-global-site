import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { openMandates } from '@/content';
import SectionHeader from '@/components/SectionHeader';
import MandateCard from '@/components/MandateCard';
import Reveal from '@/hooks/use-reveal';

/** Up to three open mandates (of one commodity, if given). Nothing at all when there are none. */
const OpenMandates: React.FC<{ commodity?: string; surface?: boolean }> = ({ commodity, surface = false }) => {
  const { t, language } = useLanguage();
  const list = openMandates(commodity).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section id="mandates" className={`py-24 relative ${surface ? 'bg-surface' : ''}`}>
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader label={t('home.mandates.label')} title={t('home.mandates.title')} className="" />
          <Link
            to={localizePath('/mandates/', language)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary underline-offset-4 hover:underline transition-colors shrink-0"
          >
            {t('home.mandates.all')}
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {list.map((mandate, i) => (
            <Reveal key={mandate.slug} delay={i * 120}>
              <MandateCard mandate={mandate} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpenMandates;
