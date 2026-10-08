import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import ServicesSection from '@/components/ServicesSection';
import ApproachSection from '@/components/AlgorithmSection';
import ContactCta from '@/components/ContactCta';
import DocumentsBlock from '@/components/DocumentsBlock';
import { documentsByGroups } from '@/content';
import { useLanguage } from '@/contexts/LanguageContext';

const Services: React.FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <PageSEO
        title={t('nav.services')}
        description={t('seo.services.description')}
        path="/services/"
        crumbs={[{ name: t('nav.services'), path: '/services/' }]}
      />
      <PageHeader label={t('services.sectionLabel')} title={t('services.title')} lead={t('services.subtitle')} />
      <ServicesSection heading={false} />
      <ApproachSection />
      <DocumentsBlock
        id="service-documents"
        documents={documentsByGroups(['engagement'])}
        label={t('documents.related')}
        title={t('documents.group.engagement')}
      />
      <ContactCta />
    </>
  );
};

export default Services;
