import { canon } from '@/data/canon';
import type { Language } from '@/i18n/translations';
import { SITE_URL, absoluteUrl, localizePath } from '@/i18n/locales';

/** Structured data built from the canon only. */

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(language: Language, description: string): JsonLd {
  const { legal, contacts, founder } = canon;
  const a = legal.address;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: canon.brand,
    legalName: legal.name,
    description,
    url: absoluteUrl(localizePath('/', language)),
    logo: absoluteUrl('/favicon-512.png'),
    image: absoluteUrl('/og-image.png'),
    email: contacts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.street}, ${a.district}`,
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.countryCode,
    },
    identifier: { '@type': 'PropertyValue', propertyID: 'NIB', value: legal.nib },
    areaServed: [...canon.corridor.suppliers, ...canon.corridor.buyers].map((region) => region.en),
    knowsAbout: [
      'Commodity deal structuring',
      'Fractional COO',
      'KYC/AML and sanctions screening',
      ...canon.commodities.map((c) => c.name.en),
    ],
    sameAs: [contacts.linkedinCompany],
    ...(founder && {
      founder: {
        '@type': 'Person',
        name: founder.name.en,
        jobTitle: founder.role.en,
        sameAs: [founder.linkedin],
      },
    }),
  };
}

export interface Crumb {
  name: string;
  /** Base (English) path; localized here. */
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[], language: Language): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(localizePath(crumb.path, language)),
    })),
  };
}

export interface ArticleJsonLdInput {
  type: 'Article' | 'NewsArticle';
  headline: string;
  description: string;
  datePublished: string;
  url: string;
  image: string;
  inLanguage: Language;
}

export function articleJsonLd(input: ArticleJsonLdInput): JsonLd {
  const { founder } = canon;
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    inLanguage: input.inLanguage,
    url: input.url,
    mainEntityOfPage: input.url,
    image: [input.image],
    ...(founder && {
      author: { '@type': 'Person', name: founder.name.en, url: founder.linkedin },
    }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: canon.brand,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon-512.png') },
    },
  };
}

/** Safe to inline in a <script> element. */
export const serializeJsonLd = (data: JsonLd): string => JSON.stringify(data).replace(/</g, '\\u003c');
