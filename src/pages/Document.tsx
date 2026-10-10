import React from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import GlyphHero from '@/components/v3/GlyphHero';
import DossierSection from '@/components/v3/DossierSection';
import RuledList from '@/components/v3/RuledList';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternalLinks } from '@/hooks/use-internal-links';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { absoluteUrl, localizePath } from '@/i18n/locales';
import { displayVersion, entryPath, entryUrl, findEntry, getCollection, type ContentEntry } from '@/content';
import { DOCUMENT_STAGES } from '@/content/constants';
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

const stageIndex = (entry: ContentEntry) => (entry.stage ? DOCUMENT_STAGES.indexOf(entry.stage) : DOCUMENT_STAGES.length);

/** Up to three other documents: the same deal step first, then the nearest steps. */
const relatedDocuments = (entry: ContentEntry): ContentEntry[] =>
  getCollection('documents')
    .filter((other) => other.slug !== entry.slug)
    .sort(
      (a, b) =>
        Math.abs(stageIndex(a) - stageIndex(entry)) - Math.abs(stageIndex(b) - stageIndex(entry)) ||
        stageIndex(a) - stageIndex(b) ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, 3);

/**
 * /documents/<slug>/: what it is, when it is needed, what is inside, version and date, preview,
 * a request and related documents. The document itself is in English, so the English page is canonical.
 */
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
  const stageLabel = entry.stage ? t(`documents.stage.${entry.stage}`) : listTitle;
  const fields = [
    ['documents.field.issuer', entry.issuer ? t(`documents.issuer.${entry.issuer}`) : ''],
    ['documents.field.access', entry.access ? t(`documents.access.${entry.access}`) : ''],
    ...(turnaround ? [['documents.field.turnaround', turnaround]] : []),
    ['documents.field.version', entry.version ?? ''],
    ['documents.field.date', formatDate(entry.date, language)],
  ];
  const requestUrl = `${localizePath('/contact/', language)}?docs=${encodeURIComponent(entry.slug)}`;
  const related = relatedDocuments(entry);
  let n = 0;
  const next = () => ++n;

  return (
    <>
      <SEO
        title={t('seo.titleSuffix', { title: version.title })}
        description={version.description}
        path={path}
        canonicalLanguage="en"
        alternateLanguages={['en']}
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
      <GlyphHero
        glyph="文件"
        crumb={{ label: listTitle, path: '/documents/' }}
        current={stageLabel}
        title={version.title}
        titleLang={version.language}
        lead={
          <>
            <p lang={version.language}>{version.description}</p>
            {language !== 'en' && (
              <p className="text-[15px] text-muted-foreground">{version.language !== language ? t('article.fallbackNote') : t('documents.languageNote')}</p>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to={requestUrl} className="btn-accent">
            {t('documents.requestThis')}
          </Link>
          <span className="text-[15px] text-muted-foreground max-w-[26em]">{t('documents.requestText')}</span>
        </div>
      </GlyphHero>

      <DossierSection id="what" n={next()}>
        <h2 className="h2-v3 mb-5">{t('documents.whatItIs')}</h2>
        <div
          lang={version.language}
          className="prose dark:prose-invert max-w-none measure text-body prose-p:text-body prose-a:text-foreground prose-a:underline-offset-4"
          onClick={onBodyClick}
          dangerouslySetInnerHTML={{ __html: body.html }}
        />
      </DossierSection>

      <DossierSection id="when" n={next()} band>
        <h2 className="h2-v3 mb-5">{t('documents.when')}</h2>
        <p className="text-body">
          <strong className="font-semibold text-foreground">{stageLabel}.</strong> <span lang={version.language}>{body.document.dealStep}</span>
        </p>
      </DossierSection>

      <DossierSection id="contents" n={next()}>
        <h2 className="h2-v3 mb-5">{t('documents.contents')}</h2>
        <RuledList
          className="measure"
          items={body.document.contents.map((item) => ({ key: item, content: <p lang={version.language} className="py-3 text-body">{item}</p> }))}
        />
      </DossierSection>

      <DossierSection id="version" n={next()} band>
        <h2 className="h2-v3 mb-5">{t('documents.field.version')}</h2>
        <dl className="max-w-2xl border-b border-border text-base">
          {fields.map(([labelKey, value]) => (
            <div key={labelKey} className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-1 sm:gap-6 py-3 border-t border-border">
              <dt className="text-muted-foreground">{t(labelKey)}</dt>
              <dd className="text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <Link to={requestUrl} className="btn-accent mt-8">
          {t('documents.requestThis')}
        </Link>
        <p className="mt-6 text-[15px] text-muted-foreground">{t('documents.disclaimer')}</p>
      </DossierSection>

      {entry.access === 'preview' && (
        <DossierSection id="preview" n={next()}>
          <h2 className="h2-v3 mb-5">{t('documents.preview')}</h2>
          {entry.previewImages?.length ? (
            <div className="space-y-6 max-w-3xl">
              {entry.previewImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={t('documents.previewAlt', { title: version.title, n: i + 1 })}
                  width={1200}
                  height={1697}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onContextMenu={(event) => event.preventDefault()}
                  className="w-full border border-border bg-card select-none"
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('documents.previewSoon')}</p>
          )}
        </DossierSection>
      )}

      {related.length > 0 && (
        <DossierSection id="related" n={next()} band={entry.access === 'preview'}>
          <h2 className="h2-v3 mb-5">{t('documents.relatedTitle')}</h2>
          <RuledList
            items={related.map((other) => {
              const v = displayVersion(other, language);
              return {
                key: other.slug,
                content: (
                  <p className="py-3.5">
                    <Link to={entryUrl(other, language)} lang={v.language} className="font-display text-[21px] text-foreground underline-offset-[5px] hover:underline">
                      {v.title}
                    </Link>
                    <span lang={v.language} className="block text-[15px] text-body">
                      {v.description}
                    </span>
                  </p>
                ),
              };
            })}
          />
        </DossierSection>
      )}
    </>
  );
};

export default DocumentPage;
