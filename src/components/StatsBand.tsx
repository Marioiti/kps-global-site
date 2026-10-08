import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';
import { canon } from '@/data/canon';

/** The four canon figures with their caption. Renders nothing without data. */
const StatsBand: React.FC<{ className?: string }> = ({ className = 'mb-8' }) => {
  const { t } = useLanguage();
  if (canon.stats.length === 0) return null;

  return (
    <div className={className}>
      <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold block mb-4">
        {t('stats.caption', { since: canon.practiceSince })}
      </span>
      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 overflow-hidden rounded-sm">
        {canon.stats.map((s) => (
          <div key={s.labelKey} className="bg-background p-7 md:p-8">
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
              {s.value}
            </div>
            <div className="mt-2 text-xs tracking-[0.12em] uppercase text-muted-foreground leading-snug">
              {t(s.labelKey)}
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  );
};

export default StatsBand;
