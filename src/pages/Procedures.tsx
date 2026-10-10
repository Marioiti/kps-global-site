import React from 'react';
import GlyphHero from '@/components/v3/GlyphHero';
import EntryRows from '@/components/v3/EntryRows';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCollection } from '@/content';

/** /procedures/: the order of a deal step by step, for each side. */
const Procedures: React.FC = () => {
  const { t } = useLanguage();
  const all = getCollection('procedures');
  const title = t('nav.procedures');

  return (
    <>
      {all.length ? (
        <PageSEO
          title={title}
          description={t('seo.procedures.description')}
          path="/procedures/"
          crumbs={[{ name: title, path: '/procedures/' }]}
        />
      ) : (
        <SEO title={t('seo.titleSuffix', { title })} description={t('seo.procedures.description')} noindex />
      )}
      <GlyphHero title={title} lead={<p>{all.length ? t('procedures.lead') : t('procedures.empty')}</p>} />

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

export default Procedures;
