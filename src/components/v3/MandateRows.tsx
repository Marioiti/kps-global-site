import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { localizePath } from '@/i18n/locales';
import type { MandateEntry } from '@/content';
import { statusClass } from './status';

/** Mandates as a table: number, what is offered or asked for, volume and basis, status, valid until. */
const MandateRows: React.FC<{ mandates: MandateEntry[]; label: string }> = ({ mandates, label }) => {
  const { t, language } = useLanguage();
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full min-w-[720px] text-[15px] text-left border-b border-border">
        <thead>
          <tr className="text-sm text-muted-foreground">
            <th scope="col" className="py-3 pr-6 font-normal">{t('mandate.field.id')}</th>
            <th scope="col" className="py-3 pr-6 font-normal">{t('mandate.field.commodity')}</th>
            <th scope="col" className="py-3 pr-6 font-normal">{t('commodity.offers.volumeBasis')}</th>
            <th scope="col" className="py-3 pr-6 font-normal">{t('mandate.field.status')}</th>
            <th scope="col" className="py-3 font-normal">{t('mandate.field.validUntil')}</th>
          </tr>
        </thead>
        <tbody>
          {mandates.map((m, i) => {
            const commodity = canon.commodities.find((c) => c.id === m.commodity)?.name[language] ?? m.commodity;
            return (
              <tr key={m.slug} className={`border-t align-top ${i === 0 ? 'border-foreground' : 'border-border'} ${m.status === 'closed' ? 'text-muted-foreground' : ''}`}>
                <th scope="row" className="py-4 pr-6 font-normal tabular-nums">
                  <Link to={localizePath(`/mandates/${m.slug}/`, language)} className="link-v3 text-foreground">
                    {m.id}
                  </Link>
                </th>
                <td className="py-4 pr-6 text-body">{t('mandate.cardTitle', { side: t(`mandate.side.${m.side}`), commodity })}</td>
                <td className="py-4 pr-6 text-body">{`${m.volume}, ${m.basis}`}</td>
                <td className={`py-4 pr-6 ${statusClass(m.status)}`}>{t(`mandate.status.${m.status}`)}</td>
                <td className="py-4 tabular-nums text-body">{formatDate(m.validUntil, language)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MandateRows;
