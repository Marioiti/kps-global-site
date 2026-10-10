import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlyphHero from '@/components/v3/GlyphHero';
import MandateRows from '@/components/v3/MandateRows';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { chipClass, chipLabelClass } from '@/components/filter-chip';
import { canon } from '@/data/canon';
import { getMandates } from '@/content';

const SIDES = ['supply', 'demand'] as const;
const STATUSES = ['open', 'in-work', 'closed'] as const;
type FilterKey = 'commodity' | 'side' | 'status';


/** /mandates/: filters by commodity, side and status (kept in the address); closed mandates last and muted. */
const Mandates: React.FC = () => {
  const { t, language } = useLanguage();
  const all = getMandates();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<FilterKey, string | null>>({ commodity: null, side: null, status: null });

  // Filters apply after hydration: the prerendered page lists everything.
  useEffect(() => {
    setFilters({
      commodity: searchParams.get('commodity'),
      side: searchParams.get('side'),
      status: searchParams.get('status'),
    });
  }, [searchParams]);

  const update = (key: FilterKey, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const shown = useMemo(
    () =>
      all.filter(
        (m) =>
          (!filters.commodity || m.commodity === filters.commodity) &&
          (!filters.side || m.side === filters.side) &&
          (!filters.status || m.status === filters.status),
      ),
    [all, filters],
  );

  const groups: { key: FilterKey; label: string; options: { value: string; label: string }[] }[] = [
    { key: 'commodity', label: t('filter.commodity'), options: canon.commodities.map((c) => ({ value: c.id, label: c.name[language] })) },
    { key: 'side', label: t('filter.side'), options: SIDES.map((s) => ({ value: s, label: t(`mandate.side.${s}`) })) },
    { key: 'status', label: t('filter.status'), options: STATUSES.map((s) => ({ value: s, label: t(`mandate.status.${s}`) })) },
  ];

  const title = t('nav.mandates');
  return (
    <>
      {all.length ? (
        <PageSEO title={title} description={t('seo.mandates.description')} path="/mandates/" crumbs={[{ name: title, path: '/mandates/' }]} />
      ) : (
        <SEO title={t('seo.titleSuffix', { title })} description={t('seo.mandates.description')} noindex />
      )}
      <GlyphHero title={title} lead={<p>{all.length ? t('mandates.lead') : t('mandates.empty')}</p>} />

      {all.length > 0 && (
        <section className="border-t border-border">
          <div className="page-container section-y">
            <div className="space-y-4 mb-10">
              {groups.map((group) => (
                <div key={group.key} className="flex flex-wrap items-center gap-2">
                  <span className={chipLabelClass}>
                    {group.label}
                  </span>
                  <button type="button" className={chipClass(!filters[group.key])} onClick={() => update(group.key, null)}>
                    {t('filter.all')}
                  </button>
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={chipClass(filters[group.key] === option.value)}
                      aria-pressed={filters[group.key] === option.value}
                      onClick={() => update(group.key, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {shown.length > 0 ? (
              <MandateRows mandates={shown} label={title} />
            ) : (
              <p className="text-muted-foreground">
                {t('mandates.noMatches')}{' '}
                <button
                  type="button"
                  className="link-v3"
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
                >
                  {t('filter.reset')}
                </button>
              </p>
            )}
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
};

export default Mandates;
