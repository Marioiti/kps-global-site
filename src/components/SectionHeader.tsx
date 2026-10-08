import React from 'react';

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  /** Margin under the block; sections differ (mb-16 / mb-20). */
  className?: string;
}

/** The hairline eyebrow + title + subtitle used at the top of every section. */
const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, subtitle, className = 'mb-16' }) => (
  <div className={className}>
    <div className="flex items-center gap-3 mb-5">
      <span className="w-6 h-px bg-accent" aria-hidden="true" />
      <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">{label}</span>
    </div>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">{title}</h2>
    {subtitle && <p className="text-muted-foreground text-lg max-w-2xl">{subtitle}</p>}
  </div>
);

export default SectionHeader;
