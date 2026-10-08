import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { getCollection } from '@/content';
import SectionHeader from '@/components/SectionHeader';
import ContentCard from '@/components/ContentCard';
import Reveal from '@/hooks/use-reveal';

/** The three newest insights; nothing at all until the first one is published. */
const LatestInsights: React.FC = () => {
  const { t, language } = useLanguage();
  const latest = getCollection('insights').slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section id="insights" className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader label={t('home.insights.label')} title={t('home.insights.title')} className="" />
          <Link
            to={localizePath('/insights/', language)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary underline-offset-4 hover:underline transition-colors shrink-0"
          >
            {t('home.insights.all')}
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {latest.map((entry, i) => (
            <Reveal key={entry.slug} delay={i * 120}>
              <ContentCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestInsights;
