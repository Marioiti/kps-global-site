import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { caseText, type CaseEntry } from '@/content';
import RuledList from './RuledList';
import Stamp from './Stamp';

const TILT = [-3, -6, 5, -4, 3];

interface CaseRowsProps {
  cases: CaseEntry[];
  /** Leave the commodity out of the bold line, on the page of that commodity. */
  withoutCommodity?: boolean;
}

/** Cases as rows: a stamp (止 stopped, 合 joined), commodity, route and year, what happened, the figure. */
const CaseRows: React.FC<CaseRowsProps> = ({ cases, withoutCommodity = false }) => {
  const { t, language } = useLanguage();
  return (
    <RuledList
      items={cases.map((item, i) => {
        const text = caseText(item, language);
        const stop = item.stamp !== 'join';
        const lead = [withoutCommodity ? null : text.commodity, text.route, item.year].filter(Boolean).join(', ');
        return {
          key: item.slug,
          content: (
            <div className="grid grid-cols-[72px_minmax(0,1fr)] md:grid-cols-[88px_minmax(0,1fr)_minmax(0,210px)] gap-x-4 md:gap-x-7 gap-y-3 py-[22px] items-center">
              <Stamp kind={stop ? 'stop' : 'join'} label={t(stop ? 'stamp.stop' : 'stamp.join')} rotate={TILT[i % TILT.length]} />
              <p className="text-body">
                <strong className="font-semibold text-foreground">{lead}.</strong> {text.summary ?? text.result}
              </p>
              {text.metricValue && (
                <p className="col-start-2 md:col-start-auto font-display text-[26px] md:text-[30px] leading-[1.15] tabular-nums text-foreground">
                  {text.metricValue}
                  {text.metricLabel && <span className="block font-sans text-sm text-muted-foreground">{text.metricLabel}</span>}
                </p>
              )}
            </div>
          ),
        };
      })}
    />
  );
};

export default CaseRows;
