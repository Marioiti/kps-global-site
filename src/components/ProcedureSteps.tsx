import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/i18n/translations';
import type { ProcedureStep } from '@/content';

interface ProcedureStepsProps {
  steps: ProcedureStep[];
  /** Language of the step texts (English when the page shows the English version). */
  language: Language;
}

/** Numbered steps: who acts, with which document, and what the other side receives. */
const ProcedureSteps: React.FC<ProcedureStepsProps> = ({ steps, language }) => {
  const { t } = useLanguage();
  return (
    <ol className="mt-12 space-y-px bg-border/30 rounded-sm overflow-hidden" lang={language}>
      {steps.map((step, i) => (
        <li key={i} className="bg-background p-6 md:p-8 grid md:grid-cols-[3rem_1fr] gap-4">
          <span className="text-3xl font-serif text-accent leading-none">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-4">{step.title}</h3>
            <dl className="grid sm:grid-cols-3 gap-4 text-sm">
              {(
                [
                  ['procedure.actor', step.actor],
                  ['procedure.document', step.document],
                  ['procedure.receives', step.receives],
                ] as const
              ).map(([labelKey, value]) => (
                <div key={labelKey}>
                  <dt className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">
                    {t(labelKey)}
                  </dt>
                  <dd className="text-foreground/80 leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default ProcedureSteps;
