import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import ContactSection from '@/components/ContactSection';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <PageSEO
        title={t('nav.contact')}
        description={t('seo.contact.description')}
        path="/contact/"
        crumbs={[{ name: t('nav.contact'), path: '/contact/' }]}
      />
      <PageHeader label={t('contact.sectionLabel')} title={t('contact.title')} lead={t('contact.subtitle')} />
      <ContactSection heading={false} />
    </>
  );
};

export default Contact;
