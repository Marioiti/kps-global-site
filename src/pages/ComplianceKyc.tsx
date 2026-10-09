import React from 'react';
import PageHeader from '@/components/PageHeader';
import PageSEO from '@/components/PageSEO';
import SectionHeader from '@/components/SectionHeader';
import FeatureGrid from '@/components/FeatureGrid';
import RoleNote from '@/components/RoleNote';
import ContactCta from '@/components/ContactCta';
import DocumentsBlock from '@/components/DocumentsBlock';
import { documentsByGroups } from '@/content';
import { useLanguage } from '@/contexts/LanguageContext';

const ITEMS = ['kyc', 'sanctions', 'bankPack', 'structure'];

const ComplianceKyc: React.FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <PageSEO
        title={t('services.complianceKyc.title')}
        description={t('seo.complianceKyc.description')}
        path="/services/compliance-kyc/"
        crumbs={[
          { name: t('nav.services'), path: '/services/' },
          { name: t('services.complianceKyc.title'), path: '/services/compliance-kyc/' },
        ]}
      />
      <PageHeader label={t('compliance.label')} title={t('compliance.title')} lead={t('compliance.lead')} />

      <section id="scope" className="py-32 bg-surface relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label={t('compliance.itemsLabel')} title={t('compliance.itemsTitle')} />
          <FeatureGrid
            items={ITEMS.map((key) => ({ title: t(`compliance.${key}.title`), desc: t(`compliance.${key}.desc`) }))}
          />
          <RoleNote className="mt-8" onSurface />
        </div>
      </section>

      <DocumentsBlock
        id="service-documents"
        documents={documentsByGroups(['counterparty-pack', 'standard-forms']).filter((d) => d.slug !== 'loi-buyer-form' && d.slug !== 'icpo-buyer-form')}
        label={t('documents.related')}
        title={t('documents.group.counterparty-pack')}
      />
      <ContactCta />
    </>
  );
};

export default ComplianceKyc;
