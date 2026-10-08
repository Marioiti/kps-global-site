import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon, legalAddressLine } from '@/data/canon';
import { formatDate } from '@/i18n/format';
import Reveal from '@/hooks/use-reveal';
import SectionHeader from '@/components/SectionHeader';

/** Registration details of the legal entity, all from the canon. */
const LegalEntitySection: React.FC = () => {
  const { t, language } = useLanguage();
  const { legal } = canon;

  const rows = [
    { label: t('legal.company'), value: legal.name },
    { label: t('legal.form'), value: legal.form[language] },
    { label: t('legal.registered'), value: formatDate(legal.registered, language) },
    { label: t('legal.decision'), value: legal.ministryDecision },
    { label: t('legal.nib'), value: legal.nib },
    { label: t('legal.kbli'), value: `${legal.kbli.code} — ${legal.kbli.title}` },
    { label: t('legal.address'), value: legalAddressLine() },
  ];

  return (
    <section id="legal" className="py-32 relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader label={t('legal.label')} title={t('legal.title')} className="mb-12" />
        <Reveal className="max-w-3xl">
          <dl className="border border-border/60 rounded-sm divide-y divide-border/40 bg-background">
            {rows.map((row) => (
              <div key={row.label} className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 px-6 py-4">
                <dt className="text-xs tracking-[0.15em] uppercase text-muted-foreground pt-0.5">{row.label}</dt>
                <dd className="text-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
};

export default LegalEntitySection;
