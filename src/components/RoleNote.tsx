import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';

/** Our role under a mandate — the canon wording, in the existing note style. */
const RoleNote: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();
  return (
    <Reveal className={`border border-primary/20 bg-primary/[0.03] rounded-sm p-8 md:p-10 ${className}`}>
      <span className="text-xs tracking-[0.2em] uppercase text-primary block mb-3">{t('role.label')}</span>
      <p className="text-foreground/80 leading-relaxed max-w-3xl">{t('role.text')}</p>
    </Reveal>
  );
};

export default RoleNote;
