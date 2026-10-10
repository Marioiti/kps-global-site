import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlyphHero from '@/components/v3/GlyphHero';
import EntryRows from '@/components/v3/EntryRows';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { chipClass, chipLabelClass } from '@/components/filter-chip';
import { canon } from '@/data/canon';
import { getCollection } from '@/content';

const LINES = ['deals', 'operations'] as const;


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
      <GlyphHero title={title} lead={<p>{all.length ? t('insights.lead') : t('insights.empty')}</p>} />

      {all.length > 0 && (
        <section className="border-t border-border">
          <div className="page-container section-y">
            <div className="space-y-4 mb-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className={chipLabelClass}>
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
                <span className={chipLabelClass}>
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
              <EntryRows entries={shown} />
            ) : (
              <p className="text-muted-foreground">
                {t('insights.noMatches')}{' '}
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

export default Insights;
