import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import StatsBand from '@/components/StatsBand';
import { HistoryLine } from '@/components/History';
import OpenMandates from '@/components/OpenMandates';
import DocumentsBlock from '@/components/DocumentsBlock';
import { documentsBySlugs } from '@/content';
import LatestInsights from '@/components/LatestInsights';
import RoleNote from '@/components/RoleNote';
import ContactCta from '@/components/ContactCta';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { organizationJsonLd } from '@/seo/jsonld';

/** Sections of the old one-page site and where they live now. */
const LEGACY_ANCHORS: Record<string, string> = {
  '#about': '/about/',
  '#services': '/services/',
  '#approach': '/services/#approach',
  '#sectors': '/about/#sectors',
  '#governance': '/about/#governance',
  '#contact': '/contact/',
};

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Old links such as kpsglobal.id/#contact go to the page that now holds the section.
  useEffect(() => {
    const target = LEGACY_ANCHORS[hash];
    if (target) navigate(localizePath(target, language), { replace: true });
  }, [hash, language, navigate]);

  return (
    <>
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        socialDescription={t('seo.home.socialDescription')}
        path="/"
        jsonLd={[organizationJsonLd(language, t('seo.home.description'))]}
      />
      <HeroSection />

      <section id="track-record" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <StatsBand className="mb-10" />
          <HistoryLine />
        </div>
      </section>

      <LatestInsights />
      <OpenMandates />
      <DocumentsBlock documents={documentsBySlugs(['mutual-nda', 'deal-health-check', 'before-payment'])} surface />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RoleNote />
        </div>
      </section>

      <ContactCta />
    </>
  );
};

export default Index;
