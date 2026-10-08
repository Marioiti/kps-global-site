import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import MandateCard from '@/components/MandateCard';
import ContactCta from '@/components/ContactCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { getMandates } from '@/content';

const SIDES = ['supply', 'demand'] as const;
const STATUSES = ['open', 'in-work', 'closed'] as const;
type FilterKey = 'commodity' | 'side' | 'status';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 text-sm border rounded-sm transition-colors duration-300 ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-background text-foreground/80 border-border hover:border-primary/40'
  }`;

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
      <PageHeader label={title} title={title} lead={all.length ? t('mandates.lead') : t('mandates.empty')} />

      {all.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="space-y-4 mb-12">
              {groups.map((group) => (
                <div key={group.key} className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold w-28">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shown.map((mandate) => (
                  <MandateCard key={mandate.slug} mandate={mandate} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t('mandates.noMatches')}{' '}
                <button
                  type="button"
                  className="text-primary underline underline-offset-4"
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
                >
                  {t('filter.reset')}
                </button>
              </p>
            )}
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
};

export default Mandates;
