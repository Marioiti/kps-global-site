import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import AboutSection from '@/components/PhilosophySection';
import FounderSection from '@/components/FounderSection';
import { HistorySection } from '@/components/History';
import GovernanceSection from '@/components/GovernanceSection';
import SectorsSection from '@/components/CapabilitiesSection';
import LegalEntitySection from '@/components/LegalEntitySection';
import ContactCta from '@/components/ContactCta';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <PageSEO
        title={t('nav.about')}
        description={t('seo.about.description')}
        path="/about/"
        crumbs={[{ name: t('nav.about'), path: '/about/' }]}
      />
      <PageHeader label={t('about.sectionLabel')} title={t('about.title')} lead={t('about.lead')} />
      <AboutSection heading={false} />
      <FounderSection />
      <HistorySection />
      <GovernanceSection />
      <SectorsSection />
      <LegalEntitySection />
      <ContactCta />
    </>
  );
};

export default About;
