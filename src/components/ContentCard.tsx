import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { displayVersion, entryUrl, type ContentEntry } from '@/content';
import { useEntryLabel } from '@/hooks/use-entry-label';

const ContentCard: React.FC<{ entry: ContentEntry }> = ({ entry }) => {
  const { t, language } = useLanguage();
  const label = useEntryLabel()(entry);
  const version = displayVersion(entry, language);
  const commodities = canon.commodities.filter((c) => entry.commodity.includes(c.id));

  return (
    <Link
      to={entryUrl(entry, language)}
      className="group h-full flex flex-col bg-secondary/50 border border-border/60 p-8 rounded-sm hover:bg-secondary/70 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 text-xs tracking-[0.15em] uppercase">
        <span className="text-primary">{label}</span>
        <span className="text-muted-foreground/60">·</span>
        <time dateTime={entry.date} className="text-muted-foreground">{formatDate(entry.date, language)}</time>
      </div>
      <h3 lang={version.language} className="font-semibold text-lg text-foreground leading-snug mb-3">
        {version.title}
      </h3>
      <p lang={version.language} className="text-muted-foreground text-sm leading-relaxed mb-6">
        {version.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {commodities.map((c) => (
            <span key={c.id} className="px-2 py-0.5 text-xs text-foreground/70 border border-border rounded-sm bg-background">
              {c.name[language]}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {t('article.readingTime', { minutes: version.readingMinutes })}
          <ArrowRight size={12} className="text-primary/70 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default ContentCard;
