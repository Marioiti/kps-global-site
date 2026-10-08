import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { localizePath } from '@/i18n/locales';
import type { MandateEntry } from '@/content';

const STATUS_CLASS: Record<MandateEntry['status'], string> = {
  open: 'bg-primary text-primary-foreground border-primary',
  'in-work': 'bg-background text-foreground border-primary/40',
  closed: 'bg-secondary text-muted-foreground border-border',
};

export const MandateStatus: React.FC<{ status: MandateEntry['status'] }> = ({ status }) => {
  const { t } = useLanguage();
  return (
    <span className={`text-[10px] tracking-[0.2em] uppercase border rounded-sm px-2 py-1 ${STATUS_CLASS[status]}`}>
      {t(`mandate.status.${status}`)}
    </span>
  );
};

/** Number, commodity, side, volume, basis, origin region, instrument, status, dates. Closed ones are muted. */
const MandateCard: React.FC<{ mandate: MandateEntry }> = ({ mandate }) => {
  const { t, language } = useLanguage();
  const commodity = canon.commodities.find((c) => c.id === mandate.commodity)?.name[language] ?? mandate.commodity;
  const fields = [
    ['mandate.field.volume', mandate.volume],
    ['mandate.field.basis', mandate.basis],
    ['mandate.field.originRegion', t(`mandate.region.${mandate.originRegion}`)],
    ['mandate.field.instrument', t(`mandate.instrument.${mandate.instrument}`)],
    ['mandate.field.published', formatDate(mandate.published, language)],
    ['mandate.field.validUntil', formatDate(mandate.validUntil, language)],
  ];

  return (
    <Link
      to={localizePath(`/mandates/${mandate.slug}/`, language)}
      className={`group h-full flex flex-col bg-secondary/50 border border-border/60 p-8 rounded-sm hover:bg-secondary/70 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${
        mandate.status === 'closed' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground tabular-nums">{mandate.id}</span>
        <MandateStatus status={mandate.status} />
      </div>
      <h3 className="font-semibold text-lg text-foreground leading-snug mb-5">
        {t('mandate.cardTitle', { side: t(`mandate.side.${mandate.side}`), commodity })}
      </h3>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
        {fields.map(([labelKey, value]) => (
          <div key={labelKey}>
            <dt className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">{t(labelKey)}</dt>
            <dd className="text-foreground/80">{value}</dd>
          </div>
        ))}
      </dl>
      <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary/80 group-hover:text-primary">
        {t('common.learnMore')}
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
};

export default MandateCard;
