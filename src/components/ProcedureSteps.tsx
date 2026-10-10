import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/i18n/translations';
import type { ProcedureStep } from '@/content';

interface ProcedureStepsProps {
  steps: ProcedureStep[];
  /** Language of the step texts (English when the page shows the English version). */
  language: Language;
}

/** The steps of a procedure as ruled rows: who acts, with which document, what the other side receives. */
const ProcedureSteps: React.FC<ProcedureStepsProps> = ({ steps, language }) => {
  const { t } = useLanguage();
  return (
    <ol className="mt-12 border-b border-border" lang={language}>
      {steps.map((step, i) => (
        <li key={i} className={`grid md:grid-cols-[3rem_minmax(0,1fr)] gap-3 md:gap-4 py-6 border-t ${i === 0 ? 'border-foreground' : 'border-border'}`}>
          <span className="font-display text-[28px] leading-none text-accent tabular-nums" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <h3 className="font-display text-[23px] text-foreground mb-3">{step.title}</h3>
            <dl className="grid sm:grid-cols-3 gap-4 text-[15px]">
              {(
                [
                  ['procedure.actor', step.actor],
                  ['procedure.document', step.document],
                  ['procedure.receives', step.receives],
                ] as const
              ).map(([labelKey, value]) => (
                <div key={labelKey}>
                  <dt className="text-sm text-muted-foreground mb-1">{t(labelKey)}</dt>
                  <dd className="text-body">{value}</dd>
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
