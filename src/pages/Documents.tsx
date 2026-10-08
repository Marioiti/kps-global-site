import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import DocumentCard from '@/components/DocumentCard';
import ContactCta from '@/components/ContactCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCollection } from '@/content';
import { DOCUMENT_GROUPS } from '@/content/constants';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 text-sm border rounded-sm transition-colors duration-300 ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-background text-foreground/80 border-border hover:border-primary/40'
  }`;

/** Order within a group: the order of the deal; other documents follow alphabetically. */
const ORDER = [
  'company-presentation',
  'client-information-sheet',
  'mutual-nda',
  'kyc-questionnaire',
  'loi-buyer-form',
  'icpo-buyer-form',
  'ictsa',
  'jwa',
  'offer-check',
  'deal-health-check',
  'deal-audit',
  'deal-architecture',
  'execution-support',
  'before-loi',
  'before-contract',
  'before-payment',
  'before-shipment',
  'before-commission-payout',
];
const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);

/** /documents/: the library by group, with a group filter kept in the address (?group=). */
const Documents: React.FC = () => {
  const { t } = useLanguage();
  const all = getCollection('documents');
  const [searchParams, setSearchParams] = useSearchParams();
  const [group, setGroup] = useState<string | null>(null);

  // The filter applies after hydration: the prerendered page lists every group.
  useEffect(() => setGroup(searchParams.get('group')), [searchParams]);

  const select = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('group', value);
    else next.delete('group');
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const groups = DOCUMENT_GROUPS.map((id) => ({
    id,
    items: all.filter((entry) => entry.group === id).sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug)),
  })).filter((g) => g.items.length > 0 || g.id === 'engagement');
  const shown = groups.filter((g) => !group || g.id === group);
  const title = t('nav.documents');

  return (
    <>
      {all.length ? (
        <PageSEO title={title} description={t('seo.documents.description')} path="/documents/" crumbs={[{ name: title, path: '/documents/' }]} />
      ) : (
        <SEO title={t('seo.titleSuffix', { title })} description={t('seo.documents.description')} noindex />
      )}
      <PageHeader label={title} title={title} lead={all.length ? t('documents.lead') : t('documents.empty')}>
        <p className="mt-6 text-sm text-muted-foreground">{t('documents.disclaimer')}</p>
      </PageHeader>

      {all.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 mb-12">
              <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold w-28">
                {t('filter.group')}
              </span>
              <button type="button" className={chipClass(!group)} onClick={() => select(null)}>
                {t('filter.all')}
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={chipClass(group === g.id)}
                  aria-pressed={group === g.id}
                  onClick={() => select(g.id)}
                >
                  {t(`documents.group.${g.id}`)}
                </button>
              ))}
            </div>

            <div className="space-y-20">
              {shown.map((g) => (
                <div key={g.id} id={`group-${g.id}`}>
                  <SectionHeader label={title} title={t(`documents.group.${g.id}`)} className="mb-10" />
                  {g.items.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {g.items.map((entry) => (
                        <DocumentCard key={entry.slug} entry={entry} />
                      ))}
                    </div>
                  )}
                  {g.id === 'engagement' && (
                    <p className="mt-6 text-sm text-muted-foreground border-l-2 border-accent pl-4">{t('documents.jva')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
};

export default Documents;
