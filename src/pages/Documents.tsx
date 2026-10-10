import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageSEO from '@/components/PageSEO';
import SEO from '@/components/SEO';
import GlyphHero from '@/components/v3/GlyphHero';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { displayVersion, entryUrl, getCollection, type ContentEntry } from '@/content';
import { DOCUMENT_GROUPS } from '@/content/constants';

type Group = (typeof DOCUMENT_GROUPS)[number];

/** Order of the list: the order of a deal; other documents follow alphabetically. */
const ORDER = [
  'company-presentation',
  'client-information-sheet',
  'mutual-nda',
  'kyc-questionnaire',
  'loi-buyer-form',
  'before-loi',
  'icpo-buyer-form',
  'before-contract',
  'ictsa',
  'jwa',
  'before-payment',
  'before-commission-payout',
  'before-shipment',
  'offer-check',
  'deal-health-check',
  'deal-audit',
  'deal-architecture',
  'execution-support',
];
const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
const byOrder = (a: ContentEntry, b: ContentEntry) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug);

const filterClass = (on: boolean) =>
  `px-4 py-2.5 text-[15px] border transition-colors ${on ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-foreground'}`;

/**
 * /documents/: the library as rows: title and description, group, version and a request.
 * The group buttons filter the list once scripts run; without scripts every document is shown.
 */
const Documents: React.FC = () => {
  const { t, language } = useLanguage();
  const all = getCollection('documents').sort(byOrder);
  const [group, setGroup] = useState<Group | null>(null);
  const groups = DOCUMENT_GROUPS.filter((g) => all.some((entry) => entry.group === g));
  const shown = group ? all.filter((entry) => entry.group === group) : all;
  const title = t('nav.documents');
  const contact = localizePath('/contact/', language);

  return (
    <>
      {all.length ? (
        <PageSEO title={title} description={t('seo.documents.description')} path="/documents/" crumbs={[{ name: title, path: '/documents/' }]} />
      ) : (
        <SEO title={t('seo.titleSuffix', { title })} description={t('seo.documents.description')} noindex />
      )}
      <GlyphHero glyph="文件" title={title} lead={<p>{all.length ? t('documents.lead') : t('documents.empty')}</p>} />

      {all.length > 0 && (
        <section id="library" className="border-t border-border">
          <div className="page-container section-y">
            <div role="group" aria-label={t('documents.filter')} className="flex flex-wrap gap-2.5 mb-8">
              <button type="button" className={filterClass(group === null)} aria-pressed={group === null} onClick={() => setGroup(null)}>
                {t('documents.stage.all')}
              </button>
              {groups.map((g) => (
                <button key={g} type="button" className={filterClass(group === g)} aria-pressed={group === g} onClick={() => setGroup(g)}>
                  {t(`documents.group.${g}`)}
                </button>
              ))}
            </div>

            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_200px_90px_200px] gap-6 py-3 text-sm text-muted-foreground" aria-hidden="true">
              <span>{t('documents.col.document')}</span>
              <span>{t('documents.col.group')}</span>
              <span>{t('documents.field.version')}</span>
              <span />
            </div>
            <ul className="border-b border-border">
              {shown.map((entry, i) => {
                const version = displayVersion(entry, language);
                return (
                  <li
                    key={entry.slug}
                    className={`grid gap-x-6 gap-y-2 py-[18px] md:grid-cols-[minmax(0,1fr)_200px_90px_200px] md:items-baseline border-t ${i === 0 ? 'border-foreground' : 'border-border'}`}
                  >
                    <div>
                      <h2 lang={version.language} className="font-display text-[21px] leading-snug">
                        <Link to={entryUrl(entry, language)} className="text-foreground underline-offset-[5px] hover:underline">
                          {version.title}
                        </Link>
                      </h2>
                      <p lang={version.language} className="text-[15px] text-body">
                        {version.description}
                      </p>
                    </div>
                    <p className="text-[15px] text-muted-foreground">
                      {entry.group ? t(`documents.group.${entry.group}`) : ''}
                      {/* On phones the version follows the group on the same line. */}
                      {entry.version && <span className="md:hidden tabular-nums"> · {t('documents.field.version')} {entry.version}</span>}
                    </p>
                    <p className="hidden md:block text-[15px] text-muted-foreground tabular-nums">{entry.version}</p>
                    <p className="text-[15px]">
                      <Link to={`${contact}?docs=${encodeURIComponent(entry.slug)}`} className="link-v3">
                        {t('documents.requestThis')}
                        <span className="sr-only">: {version.title}</span>
                      </Link>
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-[15px] text-muted-foreground">{t('documents.jva')}</p>
            <p className="mt-2 text-[15px] text-muted-foreground">{t('documents.disclaimer')}</p>
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
};

export default Documents;
