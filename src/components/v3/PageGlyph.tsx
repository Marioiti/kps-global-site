import React from 'react';

/** The large vermilion character of a page, left of or above its title. Decorative. */
const PageGlyph: React.FC<{ glyph: string; className?: string }> = ({ glyph, className = '' }) => (
  <span aria-hidden="true" className={`font-seal font-black leading-none text-accent block select-none ${className}`}>
    {glyph}
  </span>
);

export default PageGlyph;
