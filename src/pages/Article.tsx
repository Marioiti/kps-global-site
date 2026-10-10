import React from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import GlyphHero from '@/components/v3/GlyphHero';
import EntryRows from '@/components/v3/EntryRows';
import RuledList from '@/components/v3/RuledList';
import SEO from '@/components/SEO';
import FinalCta from '@/components/home/FinalCta';
import NotFound from '@/pages/NotFound';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntryLabel } from '@/hooks/use-entry-label';
import { useInternalLinks } from '@/hooks/use-internal-links';
import { canon } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import { absoluteUrl, localizePath } from '@/i18n/locales';
import ProcedureSteps from '@/components/ProcedureSteps';
import {
  displayVersion,
  documentsByGroups,
  entryPath,
  entryUrl,
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
  const standardForms = collection === 'procedures' ? documentsByGroups(['standard-forms']) : [];

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

      <GlyphHero
        crumb={{ label: sectionTitle, path: `/${collection}/` }}
        current={label(entry)}
        title={version.title}
        titleLang={version.language}
        lead={
          <p className="text-[15px] text-muted-foreground">
            <time dateTime={entry.date}>{formatDate(entry.date, language)}</time>
            {' · '}
            {t('article.readingTime', { minutes: version.readingMinutes })}
            {author && (
              <>
                {' · '}
                {t('article.author')}:{' '}
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="link-v3 text-foreground">
                  {author.name[language]}
                </a>
                , {author.role[language]}
              </>
            )}
          </p>
        }
      />

      <section className="border-t border-border">
        <div className="page-container section-y [&>*]:max-w-3xl">
          {isFallback && <p className="mb-8 text-[15px] text-muted-foreground">{t('article.fallbackNote')}</p>}

          <article
            lang={version.language}
            onClick={onBodyClick}
            className="prose dark:prose-invert max-w-none text-body prose-p:text-body prose-headings:font-display prose-headings:font-medium prose-a:text-foreground prose-a:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: body.html }}
          />

          {body.steps && <ProcedureSteps steps={body.steps} language={version.language} />}

          {collection === 'procedures' && (
            <Link
              to={`${localizePath('/contact/', language)}?topic=${encodeURIComponent(`${t('procedure.request')}: ${version.title}`)}`}
              className="btn-accent mt-10"
            >
              {t('procedure.request')}
            </Link>
          )}

          {entry.linkedinUrl && (
            <div className="mt-14 pt-6 border-t border-border">
              <h2 className="font-display text-2xl text-foreground mb-2">{t('article.discussTitle')}</h2>
              <p className="text-body mb-4">{t('article.discussText')}</p>
              <a href={entry.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link-v3 text-base">
                {t('article.discussLink')}
              </a>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-surface">
          <div className="page-container section-y">
            <h2 className="h2-v3 mb-6">{t('article.related')}</h2>
            <EntryRows entries={related} />
          </div>
        </section>
      )}

      {collection === 'procedures' && standardForms.length > 0 && (
        <section id="procedure-documents" className="border-t border-border">
          <div className="page-container section-y">
            <h2 className="h2-v3 mb-6">{t('documents.group.standard-forms')}</h2>
            <RuledList
              items={standardForms.map((doc) => {
                const v = displayVersion(doc, language);
                return {
                  key: doc.slug,
                  content: (
                    <p className="py-3.5">
                      <Link to={entryUrl(doc, language)} lang={v.language} className="font-display text-[21px] text-foreground underline-offset-[5px] hover:underline">
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
          </div>
        </section>
      )}

      <FinalCta title={t('article.ctaTitle')} subtitle={t('article.ctaSubtitle')} topic={version.title} />
    </>
  );
};

export default Article;
