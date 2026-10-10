import React from 'react';
import SectionNumeral from './SectionNumeral';

interface DossierSectionProps {
  id?: string;
  /** Section number, 1 to 6. */
  n: number;
  numeralNote?: string;
  /** Section background: the band or the page with a rule on top. */
  band?: boolean;
  children: React.ReactNode;
}

/** A numbered section: the numeral in a 220px column on the left, the content on the right. */
const DossierSection: React.FC<DossierSectionProps> = ({ id, n, numeralNote, band = false, children }) => (
  <section id={id} className={`scroll-mt-8 ${band ? "bg-surface" : "border-t border-border"}`}>
    <div className="page-container section-y grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
      <SectionNumeral n={n} note={numeralNote} />
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

export default DossierSection;
