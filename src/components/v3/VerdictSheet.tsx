import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Stamp from './Stamp';

type Result = 'pass' | 'fail' | 'open';

const ROWS: { key: string; result: Result }[] = [
  { key: 'verdict.row1', result: 'pass' },
  { key: 'verdict.row2', result: 'pass' },
  { key: 'verdict.row3', result: 'fail' },
  { key: 'verdict.row4', result: 'open' },
];

const RESULT_CLASS: Record<Result, string> = {
  pass: 'text-status-green',
  fail: 'text-accent',
  open: 'text-status-amber',
};

/** A sample offer-check verdict: what was checked, the result in words and colour, one decision. */
const VerdictSheet: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();
  return (
    <figure className={`relative m-0 bg-card border border-border px-6 pt-6 pb-8 md:px-[30px] md:pt-[30px] md:pb-[34px] ${className}`}>
      <div className="flex justify-between mb-3.5 text-[13px] text-muted-foreground tabular-nums">
        <span>{t('verdict.ref')}</span>
        <span>{t('verdict.sample')}</span>
      </div>
      <p className="font-display text-[21px] md:text-[23px] mb-3.5 text-foreground">{t('verdict.subject')}</p>
      <table className="w-full text-[15px] border-collapse">
        <caption className="sr-only">{t('verdict.caption')}</caption>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-y border-rule-soft">
              <th scope="row" className="py-[11px] pr-4 text-left font-normal text-body">
                {t(row.key)}
              </th>
              <td className={`py-[11px] w-[66px] font-semibold ${RESULT_CLASS[row.result]}`}>{t(`verdict.${row.result}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-[18px] font-display text-[19px] leading-[1.4] max-w-[15em] pr-24 text-foreground">{t('verdict.decision')}</figcaption>
      <Stamp kind="stop" label={t('stamp.stop')} caption={t('verdict.stampWord')} size="lg" rotate={-8} className="absolute right-6 bottom-5" />
    </figure>
  );
};

export default VerdictSheet;
