import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon, type HistoryEntry } from '@/data/canon';
import { formatDate, formatPeriod } from '@/i18n/format';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/hooks/use-reveal';

const useHistory = () => {
  const { t, language } = useLanguage();
  const period = (entry: HistoryEntry) => formatPeriod(entry.from, entry.to, language, t('history.since'));
  return { t, language, period };
};

/** One line on the home page: BRIK, 2017–2025 → … → PT KPS Global Solutions. */
export const HistoryLine: React.FC = () => {
  const { t, period } = useHistory();
  if (canon.history.length === 0) return null;

  return (
    <p data-history className="text-sm text-muted-foreground leading-relaxed">
      <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold mr-3">
        {t('history.lineLabel')}
      </span>
      {canon.history.map((entry, i) => (
        <React.Fragment key={entry.from}>
          {i > 0 && <span className="mx-2 text-accent">→</span>}
          <span className="text-foreground/80 font-medium">{entry.name}</span>
          <span className="text-muted-foreground">, {period(entry)}</span>
        </React.Fragment>
      ))}
    </p>
  );
};

/** The full table on /about/. */
export const HistorySection: React.FC = () => {
  const { t, language, period } = useHistory();
  if (canon.history.length === 0) return null;

  return (
    <section id="history" data-history className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader label={t('history.label')} title={t('history.title')} className="mb-12" />
        <Reveal className="border border-border/60 rounded-sm overflow-hidden bg-background max-w-3xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th scope="col" className="px-6 py-4 text-xs tracking-[0.2em] uppercase text-primary font-medium">
                  {t('history.period')}
                </th>
                <th scope="col" className="px-6 py-4 text-xs tracking-[0.2em] uppercase text-primary font-medium">
                  {t('history.name')}
                </th>
              </tr>
            </thead>
            <tbody>
              {canon.history.map((entry) => (
                <tr key={entry.from} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap tabular-nums align-top">
                    {period(entry)}
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">
                    {entry.name}
                    {entry.noteKey && (
                      <span className="block text-xs text-muted-foreground font-normal mt-1">{t(entry.noteKey)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="mt-6 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {t('history.note', {
            registered: formatDate(canon.legal.registered, language),
            since: canon.practiceSince,
          })}
        </p>
      </div>
    </section>
  );
};
