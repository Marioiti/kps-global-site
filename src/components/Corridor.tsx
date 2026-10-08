import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';

/** Suppliers → buyers, from the canon. */
const Corridor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t, language } = useLanguage();
  const sides = [
    { label: t('hero.suppliersLabel'), regions: canon.corridor.suppliers },
    { label: t('hero.buyersLabel'), regions: canon.corridor.buyers },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
      {sides.map((side, i) => (
        <React.Fragment key={side.label}>
          {i > 0 && <ArrowRight size={16} className="text-accent shrink-0" aria-hidden="true" />}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-semibold">
              {side.label}
            </span>
            <span className="text-sm text-foreground/80 font-medium">
              {side.regions.map((r) => r[language]).join(' · ')}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Corridor;
