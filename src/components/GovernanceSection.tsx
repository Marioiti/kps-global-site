import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/hooks/use-reveal';
import { UserCheck, Ban, Scale, Lock } from 'lucide-react';
import RoleNote from '@/components/RoleNote';

const items = [
  { titleKey: 'governance.kyc.title', descKey: 'governance.kyc.desc', icon: UserCheck },
  { titleKey: 'governance.sanctions.title', descKey: 'governance.sanctions.desc', icon: Ban },
  { titleKey: 'governance.anticorruption.title', descKey: 'governance.anticorruption.desc', icon: Scale },
  { titleKey: 'governance.data.title', descKey: 'governance.data.desc', icon: Lock },
];

const GovernanceSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="governance" className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
            {t('governance.sectionLabel')}
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          {t('governance.title')}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mb-20">
          {t('governance.subtitle')}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 overflow-hidden rounded-sm">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.titleKey}
                delay={(i % 4) * 100}
                className="bg-background p-8 md:p-10 group hover:bg-secondary/20 transition-colors duration-500"
              >
                <Icon
                  size={24}
                  className="text-primary/60 mb-6 group-hover:text-primary transition-colors duration-500"
                  strokeWidth={1.5}
                />
                <h3 className="font-serif text-xl text-foreground mb-3">
                  {t(item.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(item.descKey)}
                </p>
              </Reveal>
            );
          })}
        </div>

        <RoleNote className="mt-8" onSurface />
      </div>
    </section>
  );
};

export default GovernanceSection;
