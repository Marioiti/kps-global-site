import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { displayVersion, entryUrl, type ContentEntry } from '@/content';
import { useEntryLabel } from '@/hooks/use-entry-label';

/** Articles, news and procedures as rows: label and date, title, description, commodities, reading time. */
const EntryRows: React.FC<{ entries: ContentEntry[] }> = ({ entries }) => {
  const { t, language } = useLanguage();
  const label = useEntryLabel();
  return (
    <ul className="border-b border-border">
      {entries.map((entry, i) => {
        const version = displayVersion(entry, language);
        const commodities = canon.commodities.filter((c) => entry.commodity.includes(c.id)).map((c) => c.name[language]);
        return (
          <li key={`${entry.collection}/${entry.slug}`} className={`grid gap-x-6 gap-y-1 py-5 md:grid-cols-[200px_minmax(0,1fr)] border-t ${i === 0 ? 'border-foreground' : 'border-border'}`}>
            <p className="text-[15px] text-muted-foreground">
              {label(entry)}
              <br />
              <time dateTime={entry.date}>{formatDate(entry.date, language)}</time>
            </p>
            <div>
              <h2 lang={version.language} className="font-display text-[23px] leading-snug">
                <Link to={entryUrl(entry, language)} className="text-foreground underline-offset-[5px] hover:underline">
                  {version.title}
                </Link>
              </h2>
              <p lang={version.language} className="text-body">
                {version.description}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[...commodities, t('article.readingTime', { minutes: version.readingMinutes })].join(' · ')}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default EntryRows;
