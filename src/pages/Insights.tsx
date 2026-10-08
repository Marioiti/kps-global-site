import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import ContentCard from '@/components/ContentCard';
import ContactCta from '@/components/ContactCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';
import { getCollection } from '@/content';

const LINES = ['deals', 'operations'] as const;

const chipClass = (active: boolean) =>
  `px-3 py-1.5 text-sm border rounded-sm transition-colors duration-300 ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-background text-foreground/80 border-border hover:border-primary/40'
  }`;

/** /insights/: newest first, filters by line and commodity kept in the address (?line=&commodity=). */
const Insights: React.FC = () => {
  const { t, language } = useLanguage();
  const all = getCollection('insights');
  const [searchParams, setSearchParams] = useSearchParams();
  const [line, setLine] = useState<string | null>(null);
  const [commodity, setCommodity] = useState<string | null>(null);

  // Filters apply after hydration: the prerendered page lists everything.
  useEffect(() => {
    setLine(searchParams.get('line'));
    setCommodity(searchParams.get('commodity'));
  }, [searchParams]);

  const update = (key: 'line' | 'commodity', value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const shown = useMemo(
    () =>
      all.filter(
        (entry) => (!line || entry.line === line) && (!commodity || entry.commodity.includes(commodity)),
      ),
    [all, line, commodity],
  );

  const title = t('nav.insights');
  const seo = all.length ? (
    <PageSEO
      title={title}
      description={t('seo.insights.description')}
      path="/insights/"
      crumbs={[{ name: title, path: '/insights/' }]}
    />
  ) : (
    <SEO title={t('seo.titleSuffix', { title })} description={t('seo.insights.description')} noindex />
  );

  return (
    <>
      {seo}
      <PageHeader label={title} title={title} lead={all.length ? t('insights.lead') : t('insights.empty')} />

      {all.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="space-y-4 mb-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold w-28">
                  {t('filter.line')}
                </span>
                <button type="button" className={chipClass(!line)} onClick={() => update('line', null)}>
                  {t('filter.all')}
                </button>
                {LINES.map((id) => (
                  <button key={id} type="button" className={chipClass(line === id)} aria-pressed={line === id} onClick={() => update('line', id)}>
                    {t(`line.${id}`)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold w-28">
                  {t('filter.commodity')}
                </span>
                <button type="button" className={chipClass(!commodity)} onClick={() => update('commodity', null)}>
                  {t('filter.all')}
                </button>
                {canon.commodities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={chipClass(commodity === c.id)}
                    aria-pressed={commodity === c.id}
                    onClick={() => update('commodity', c.id)}
                  >
                    {c.name[language]}
                  </button>
                ))}
              </div>
            </div>

            {shown.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shown.map((entry) => (
                  <ContentCard key={entry.slug} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t('insights.noMatches')}{' '}
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

export default Insights;
