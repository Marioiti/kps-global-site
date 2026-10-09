import React from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import NotFound from '@/pages/NotFound';
import Reveal from '@/hooks/use-reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternalLinks } from '@/hooks/use-internal-links';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { absoluteUrl, localizePath } from '@/i18n/locales';
import { displayVersion, entryPath, findEntry, publishedLanguages } from '@/content';
import { previewImage } from '@/content/preview';
import { breadcrumbJsonLd } from '@/seo/jsonld';
import type { ArticleData } from '@/pages/Article';

/** Turnaround of the fixed-scope products, from the canon. */
const useTurnaround = (slug: string): string | null => {
  const { t } = useLanguage();
  const { offerCheck, dealHealthCheck } = canon.products;
  if (slug === 'offer-check') return t('deal.offerCheck.turnaround', { hours: offerCheck.turnaroundHours });
  if (slug === 'deal-health-check') return t('deal.healthCheck.turnaround', { days: dealHealthCheck.turnaroundBusinessDays });
  return null;
};

/** /documents/<slug>/: what it is, who issues it, at which step, what is inside; preview; request. */
const DocumentPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { slug = '' } = useParams();
  const data = useLoaderData() as ArticleData | null;
  const onBodyClick = useInternalLinks();
  const turnaround = useTurnaround(slug);
  const entry = findEntry('documents', slug);
  const body = data?.body;
  if (!entry || !body?.document) return <NotFound />;

  const version = displayVersion(entry, language);
  const path = entryPath(entry);
  const preview = previewImage(entry, version.language);
  const listTitle = t('nav.documents');
  const fields = [
    ['documents.field.issuer', entry.issuer ? t(`documents.issuer.${entry.issuer}`) : ''],
    ['documents.field.dealStep', body.document.dealStep],
    ['documents.field.access', entry.access ? t(`documents.access.${entry.access}`) : ''],
    ...(turnaround ? [['documents.field.turnaround', turnaround]] : []),
    ['documents.field.version', entry.version ?? ''],
    ['documents.field.date', formatDate(entry.date, language)],
  ];
  const requestUrl = `${localizePath('/contact/', language)}?docs=${encodeURIComponent(entry.slug)}`;

  return (
    <>
      <SEO
        title={t('seo.titleSuffix', { title: version.title })}
        description={version.description}
        path={path}
        canonicalLanguage={version.language}
        alternateLanguages={publishedLanguages(entry)}
        image={preview ? absoluteUrl(preview.path) : absoluteUrl('/og-image.png')}
        imageSize={preview ? preview.size : undefined}
        jsonLd={[
          breadcrumbJsonLd(
            [
              { name: t('nav.home'), path: '/' },
              { name: listTitle, path: '/documents/' },
              { name: version.title, path },
            ],
            language,
          ),
        ]}
      />
      <PageHeader
        label={entry.group ? t(`documents.group.${entry.group}`) : listTitle}
        title={version.title}
        lead={version.description}
      >
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            to={requestUrl}
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground text-sm tracking-wide font-semibold hover:bg-primary/90 hover:gap-4 transition-all duration-300 rounded-sm"
          >
            {t('documents.request')}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <span className="text-sm text-muted-foreground max-w-md">{t('documents.requestText')}</span>
        </div>
      </PageHeader>

      <section className="py-16 md:py-20 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            to={localizePath('/documents/', language)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            {t('documents.back')}
          </Link>

          {version.language !== language && (
            <p className="mb-8 text-sm text-muted-foreground border-l-2 border-accent pl-4">{t('article.fallbackNote')}</p>
          )}

          <dl className="border border-border/60 rounded-sm divide-y divide-border/40 bg-background mb-14">
            {fields.map(([labelKey, value]) => (
              <div key={labelKey} className="grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-6 px-6 py-4">
                <dt className="text-xs tracking-[0.15em] uppercase text-muted-foreground pt-0.5">{t(labelKey)}</dt>
                <dd lang={labelKey === 'documents.field.dealStep' ? version.language : undefined} className="text-sm text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-5">{t('documents.whatItIs')}</h2>
          <div
            lang={version.language}
            className="prose prose-slate dark:prose-invert max-w-none prose-a:text-primary prose-a:underline-offset-4 mb-14"
            onClick={onBodyClick}
            dangerouslySetInnerHTML={{ __html: body.html }}
          />

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">{t('documents.contents')}</h2>
          <ul lang={version.language} className="space-y-3 mb-14">
            {body.document.contents.map((item) => (
              <li key={item} className="flex gap-3 text-foreground/80 leading-relaxed">
                <Check size={18} className="text-primary shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {entry.access === 'preview' && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">{t('documents.preview')}</h2>
              {entry.previewImages?.length ? (
                <div className="space-y-6 mb-14">
                  {entry.previewImages.map((src, i) => (
                    <Reveal key={src}>
                      <img
                        src={src}
                        alt={t('documents.previewAlt', { title: version.title, n: i + 1 })}
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(event) => event.preventDefault()}
                        className="w-full border border-border/60 rounded-sm bg-background select-none"
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <p className="mb-14 text-muted-foreground">{t('documents.previewSoon')}</p>
              )}
            </>
          )}

          <p className="text-sm text-muted-foreground border-t border-border/60 pt-6">{t('documents.disclaimer')}</p>
        </div>
      </section>
    </>
  );
};

export default DocumentPage;
