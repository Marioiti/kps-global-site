import { canon } from '@/data/canon';
import type { Language } from '@/i18n/translations';
import { SITE_URL, absoluteUrl, localizePath } from '@/i18n/locales';
import { parsePrice } from '@/seo/price';

/** Structured data built from the canon only. */

export type JsonLd = Record<string, unknown>;

/** One node each for the company and its founder; every page refers to them by these ids. */
export const ORG_ID = `${SITE_URL}/#org`;
export const PERSON_ID = `${SITE_URL}/#andrei-orlov`;

/** The company, the same on every page and in every language. */
export function organizationJsonLd(): JsonLd {
  const { legal, contacts, founder } = canon;
  const a = legal.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: canon.brand,
    legalName: legal.name,
    alternateName: canon.alternateNames,
    description: canon.description,
    url: `${SITE_URL}/`,
    logo: absoluteUrl('/favicon-512.png'),
    image: absoluteUrl('/og-image.png'),
    email: contacts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.street}, ${a.district}`,
      addressLocality: a.city.replace(/^Kota /, ''),
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
    knowsLanguage: ['en', 'ru', 'zh'],
    ...(founder && { founder: { '@id': PERSON_ID } }),
    sameAs: [contacts.linkedinCompany],
  };
}

/** The founder, working for the company. */
export function personJsonLd(): JsonLd | null {
  const { founder } = canon;
  if (!founder) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: founder.name.en,
    jobTitle: founder.role.en.split(',')[0],
    worksFor: { '@id': ORG_ID },
    ...(founder.photo && { image: absoluteUrl(founder.photo) }),
    sameAs: [founder.linkedin],
  };
}

/** The site in one language, on the home page. */
export function websiteJsonLd(language: Language, description: string): JsonLd {
  const url = absoluteUrl(localizePath('/', language));
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url,
    name: canon.brand,
    alternateName: canon.alternateNames,
    description,
    inLanguage: language,
    publisher: { '@id': ORG_ID },
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
  /** Defaults to the publication date. */
  dateModified?: string;
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
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.inLanguage,
    url: input.url,
    mainEntityOfPage: input.url,
    image: [input.image],
    ...(founder && { author: { '@id': PERSON_ID } }),
    publisher: { '@id': ORG_ID },
  };
}

/** A product with a published price: the price is "from", so it is the minimum. */
export interface ServiceOffer {
  name: string;
  /** canon.products[…].priceFrom, e.g. "USD 1,000". */
  priceFrom: string;
}

/** Service: provided by the company, with an Offer for each check that has a price in the canon. */
export function serviceJsonLd(input: {
  name: string;
  serviceType: string;
  description: string;
  path: string;
  language: Language;
  offers?: ServiceOffer[];
}): JsonLd {
  const { name, serviceType, description, path, language, offers = [] } = input;
  const url = absoluteUrl(localizePath(path, language));
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: [...canon.corridor.suppliers, ...canon.corridor.buyers].map((region) => ({ '@type': 'Place', name: region.en })),
    ...(offers.length > 0 && {
      offers: offers.map((offer) => {
        const { currency, amount } = parsePrice(offer.priceFrom);
        return {
          '@type': 'Offer',
          name: offer.name,
          url,
          priceCurrency: currency,
          priceSpecification: { '@type': 'PriceSpecification', minPrice: amount, priceCurrency: currency },
        };
      }),
    }),
  };
}

/** FAQPage from the questions and answers shown on the page, in the same order. */
export function faqJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Safe to inline in a <script> element. */
export const serializeJsonLd = (data: JsonLd): string => JSON.stringify(data).replace(/</g, '\\u003c');
