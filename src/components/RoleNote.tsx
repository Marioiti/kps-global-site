import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';

interface RoleNoteProps {
  className?: string;
  /** On a section that already has the surface background: the note takes the page background. */
  onSurface?: boolean;
}

/** Our role under a mandate — the canon wording, as a note with a vermilion rule on the left. */
const RoleNote: React.FC<RoleNoteProps> = ({ className = '', onSurface = false }) => {
  const { t } = useLanguage();
  return (
    <Reveal
      className={`grid gap-3 md:grid-cols-[220px_1fr] md:gap-8 border-l-[3px] border-accent rounded-sm p-6 md:p-8 ${
        onSurface ? 'bg-background' : 'bg-surface'
      } ${className}`}
    >
      <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium md:pt-1">{t('role.label')}</span>
      <p className="text-foreground/85 leading-relaxed max-w-none">{t('role.text')}</p>
    </Reveal>
  );
};

export default RoleNote;
