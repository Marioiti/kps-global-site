import React from 'react';
import { Head } from 'vite-react-ssg';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  OG_LOCALES,
  absoluteUrl,
  localizePath,
} from '@/i18n/locales';
import { canon } from '@/data/canon';
import type { Language } from '@/i18n/translations';
import { serializeJsonLd, type JsonLd } from '@/seo/jsonld';
import { OG_SIZE, pagePreviewPath } from '@/content/preview';

const DEFAULT_OG_IMAGE = absoluteUrl('/og-image.png');

interface SEOProps {
  title: string;
  description: string;
  /** Shorter text for link previews (og:/twitter:). Defaults to `description`. */
  socialDescription?: string;
  /**
   * Base (English) path of the page, e.g. `/privacy/`. Drives canonical,
   * og:url and the hreflang alternates. Omit for pages that must not be indexed.
   */
  path?: string;
  /**
   * Absolute URL of the preview image; `imageSize` when it is not 1200 × 630.
   * Without it an indexed page gets its own image generated at build, others the site-wide one.
   */
  image?: string;
  imageSize?: { width: number; height: number } | null;
  noindex?: boolean;
  /** Languages that have this page's own text (hreflang). Defaults to all. */
  alternateLanguages?: readonly Language[];
  /** Language whose URL is canonical. Defaults to the current one; a page showing
   *  the English text under another interface points at the English URL. */
  canonicalLanguage?: Language;
  ogType?: 'website' | 'article';
  /** ISO date, for articles. */
  publishedTime?: string;
  /** Structured data blocks (Organization, BreadcrumbList…). */
  jsonLd?: JsonLd[];
}

/** Per-page <head> tags; rendered into the static HTML at build time. */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  socialDescription = description,
  path,
  image,
  imageSize,
  noindex = false,
  alternateLanguages = LANGUAGES,
  canonicalLanguage,
  ogType = 'website',
  publishedTime,
  jsonLd = [],
}) => {
  const { language, t } = useLanguage();
  const url = path ? absoluteUrl(localizePath(path, canonicalLanguage ?? language)) : undefined;
  const ogLanguage = canonicalLanguage ?? language;
  const pageImage = !image && path && !noindex;
  const ogImage = image ?? (pageImage ? absoluteUrl(pagePreviewPath(path, ogLanguage)) : DEFAULT_OG_IMAGE);
  const size =
    imageSize !== undefined ? imageSize : pageImage ? OG_SIZE : image ? null : { width: 1200, height: 630 };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content={canon.legal.name} />
      <meta
        name="robots"
        content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}
      />
      {url && <link rel="canonical" href={url} />}
      {path &&
        alternateLanguages.map((lang) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={absoluteUrl(localizePath(path, lang))}
          />
        ))}
      {path && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={absoluteUrl(localizePath(path, DEFAULT_LANGUAGE))}
        />
      )}

      <meta property="og:type" content={ogType} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta property="og:site_name" content={canon.brand} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={socialDescription} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={ogImage} />
      {size && <meta property="og:image:width" content={String(size.width)} />}
      {size && <meta property="og:image:height" content={String(size.height)} />}
      <meta property="og:image:alt" content={t('seo.ogImageAlt')} />
      <meta property="og:locale" content={OG_LOCALES[ogLanguage]} />
      {alternateLanguages.filter((lang) => lang !== ogLanguage).map((lang) => (
        <meta key={lang} property="og:locale:alternate" content={OG_LOCALES[lang]} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={socialDescription} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">
          {serializeJsonLd(data)}
        </script>
      ))}
    </Head>
  );
};

export default SEO;
