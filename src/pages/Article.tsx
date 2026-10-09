import React from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import { ArrowLeft, Linkedin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import ContentCard from '@/components/ContentCard';
import ContactCta from '@/components/ContactCta';
import SectionHeader from '@/components/SectionHeader';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntryLabel } from '@/hooks/use-entry-label';
import { useInternalLinks } from '@/hooks/use-internal-links';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { absoluteUrl, localizePath } from '@/i18n/locales';
import ProcedureSteps from '@/components/ProcedureSteps';
import DocumentsBlock from '@/components/DocumentsBlock';
import {
  displayVersion,
  documentsByGroups,
  entryPath,
  findEntry,
  publishedLanguages,
  relatedByCommodity,
  resolveRelated,
  type Collection,
  type ContentBody,
} from '@/content';
import { previewImage } from '@/content/preview';
import { articleJsonLd, breadcrumbJsonLd } from '@/seo/jsonld';

export interface ArticleData {
  body: ContentBody | null;
}

const BACK_LINK: Record<Collection, string> = {
  insights: 'article.backInsights',
  news: 'article.backNews',
  procedures: 'procedures.back',
  documents: 'documents.back',
};

/** /insights/, /news/ and /procedures/ items. The body comes from the route loader (build-time data). */
const Article: React.FC<{ collection: Collection }> = ({ collection }) => {
  const { t, language } = useLanguage();
  const { slug = '' } = useParams();
  const data = useLoaderData() as ArticleData | null;
  const label = useEntryLabel();
  const onBodyClick = useInternalLinks();
  const entry = findEntry(collection, slug);
  const body = data?.body;
  if (!entry || !body) return <NotFound />;

  const version = displayVersion(entry, language);
  const isFallback = version.language !== language;
  const path = entryPath(entry);
  const canonicalUrl = absoluteUrl(localizePath(path, version.language));
  const preview = previewImage(entry, version.language);
  const image = preview ? absoluteUrl(preview.path) : absoluteUrl('/og-image.png');
  const sectionTitle = t(`nav.${collection}`);
  const author = canon.founder;
  const related = collection === 'news' ? resolveRelated(entry) : relatedByCommodity(entry);

  return (
    <>
      <SEO
        title={t('seo.titleSuffix', { title: version.title })}
        description={version.description}
        path={path}
        canonicalLanguage={version.language}
        alternateLanguages={publishedLanguages(entry)}
        image={image}
        imageSize={preview ? preview.size : undefined}
        ogType="article"
        publishedTime={entry.date}
        jsonLd={[
          articleJsonLd({
            type: collection === 'news' ? 'NewsArticle' : 'Article',
            headline: version.title,
            description: version.description,
            datePublished: entry.date,
            url: canonicalUrl,
            image,
            inLanguage: version.language,
          }),
          breadcrumbJsonLd(
            [
              { name: t('nav.home'), path: '/' },
              { name: sectionTitle, path: `/${collection}/` },
              { name: version.title, path },
            ],
            language,
          ),
        ]}
      />

      <PageHeader label={label(entry)} title={version.title}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={entry.date}>{formatDate(entry.date, language)}</time>
          <span aria-hidden="true">·</span>
          <span>{t('article.readingTime', { minutes: version.readingMinutes })}</span>
          {author && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t('article.author')}:{' '}
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary">
                  {author.name[language]}
                </a>
                , {author.role[language]}
              </span>
            </>
          )}
        </div>
      </PageHeader>

      <section className="py-16 md:py-20 relative">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            to={localizePath(`/${collection}/`, language)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            {t(BACK_LINK[collection])}
          </Link>

          {isFallback && (
            <p className="mb-8 text-sm text-muted-foreground border-l-2 border-accent pl-4">{t('article.fallbackNote')}</p>
          )}

          <article
            lang={version.language}
            onClick={onBodyClick}
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: body.html }}
          />

          {body.steps && <ProcedureSteps steps={body.steps} language={version.language} />}

          {collection === 'procedures' && (
            <Link
              to={`${localizePath('/contact/', language)}?topic=${encodeURIComponent(`${t('procedure.request')}: ${version.title}`)}`}
              className="mt-10 group inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground text-sm tracking-wide font-semibold hover:bg-primary/90 transition-all duration-300 rounded-sm"
            >
              {t('procedure.request')}
            </Link>
          )}

          {entry.linkedinUrl && (
            <div className="mt-14 border border-primary/20 bg-primary/[0.03] rounded-sm p-8">
              <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{t('article.discussTitle')}</span>
              <p className="text-foreground/80 leading-relaxed mb-5">{t('article.discussText')}</p>
              <a
                href={entry.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                <Linkedin size={16} />
                {t('article.discussLink')}
              </a>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-24 bg-surface relative">
          <div className="absolute top-0 left-0 right-0 line-rule" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionHeader label={sectionTitle} title={t('article.related')} className="mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((item) => (
                <ContentCard key={`${item.collection}/${item.slug}`} entry={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {collection === 'procedures' && (
        <DocumentsBlock
          id="procedure-documents"
          documents={documentsByGroups(['standard-forms'])}
          label={t('documents.related')}
          title={t('documents.group.standard-forms')}
        />
      )}

      <ContactCta title={t('article.ctaTitle')} subtitle={t('article.ctaSubtitle')} topic={version.title} />
    </>
  );
};

export default Article;
