import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import ContentCard from '@/components/ContentCard';
import ContactCta from '@/components/ContactCta';
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
      <PageHeader label={title} title={title} lead={all.length ? t('procedures.lead') : t('procedures.empty')} />

      {all.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {all.map((entry) => (
              <ContentCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
};

export default Procedures;
