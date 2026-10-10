import React from 'react';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { breadcrumbJsonLd, type Crumb, type JsonLd } from '@/seo/jsonld';

interface PageSEOProps {
  /** Page name; the brand is appended. */
  title: string;
  description: string;
  /** Base (English) path of the page. */
  path: string;
  /** Trail after "Home", ending with this page. */
  crumbs: Crumb[];
  /** More structured data for the page (Service, FAQPage…). */
  jsonLd?: JsonLd[];
}

/** SEO for an inner page: "<title> — brand" and a BreadcrumbList. */
const PageSEO: React.FC<PageSEOProps> = ({ title, description, path, crumbs, jsonLd = [] }) => {
  const { t, language } = useLanguage();
  return (
    <SEO
      title={t('seo.titleSuffix', { title })}
      description={description}
      path={path}
      jsonLd={[breadcrumbJsonLd([{ name: t('nav.home'), path: '/' }, ...crumbs], language), ...jsonLd]}
    />
  );
};

export default PageSEO;
