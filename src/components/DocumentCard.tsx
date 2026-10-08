import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { displayVersion, entryUrl, type ContentEntry } from '@/content';

/** A document of the library: group, title, summary, access and version. */
const DocumentCard: React.FC<{ entry: ContentEntry }> = ({ entry }) => {
  const { t, language } = useLanguage();
  const version = displayVersion(entry, language);

  return (
    <Link
      to={entryUrl(entry, language)}
      className="group h-full flex flex-col bg-secondary/50 border border-border/60 p-8 rounded-sm hover:bg-secondary/70 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <span className="text-xs tracking-[0.15em] uppercase text-primary mb-5">
        {entry.group ? t(`documents.group.${entry.group}`) : ''}
      </span>
      <h3 lang={version.language} className="font-semibold text-lg text-foreground leading-snug mb-3">
        {version.title}
      </h3>
      <p lang={version.language} className="text-muted-foreground text-sm leading-relaxed mb-6">
        {version.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{entry.access ? t(`documents.access.${entry.access}`) : ''}</span>
        <span className="inline-flex items-center gap-1.5">
          {entry.version && t('documents.version', { version: entry.version })}
          <ArrowRight size={12} className="text-primary/70 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default DocumentCard;
