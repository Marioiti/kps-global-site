import React from 'react';

interface PageHeaderProps {
  label: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}

/** Top of an inner page: the hero's background and type scale, at page-title size. */
const PageHeader: React.FC<PageHeaderProps> = ({ label, title, lead, children }) => (
  <section className="relative overflow-hidden border-b border-border">
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(110% 90% at 15% 0%, hsl(var(--paper)) 0%, hsl(var(--background)) 55%)',
      }}
    />
    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-20">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-3 mb-8">
          <span className="w-6 h-px bg-accent" />
          <span className="text-xs tracking-[0.25em] uppercase text-primary/70 font-semibold">{label}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-7 max-w-3xl text-balance">
          {title}
        </h1>
        {lead && <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">{lead}</p>}
        {children}
      </div>
    </div>
  </section>
);

export default PageHeader;
