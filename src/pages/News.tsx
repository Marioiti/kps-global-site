import React from 'react';
import GlyphHero from '@/components/v3/GlyphHero';
import EntryRows from '@/components/v3/EntryRows';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCollection } from '@/content';

/** /news/: newest first. */
const News: React.FC = () => {
  const { t } = useLanguage();
  const all = getCollection('news');
  const title = t('nav.news');

  return (
    <>
      {all.length ? (
        <PageSEO title={title} description={t('seo.news.description')} path="/news/" crumbs={[{ name: title, path: '/news/' }]} />
      ) : (
        <SEO title={t('seo.titleSuffix', { title })} description={t('seo.news.description')} noindex />
      )}
      <GlyphHero title={title} lead={<p>{all.length ? t('news.lead') : t('news.empty')}</p>} />

      {all.length > 0 && (
        <section className="border-t border-border">
          <div className="page-container section-y">
            <EntryRows entries={all} />
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
};

export default News;
