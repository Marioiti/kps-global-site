import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';

interface GlyphHeroProps {
  /** The page's characters; decorative. Leave out to start with the title. */
  glyph?: string;
  /** Use the seal instead of characters (about page). */
  mark?: React.ReactNode;
  /** A path back to the list, e.g. Services / Deal structuring. */
  crumb?: { label: string; path: string };
  /** The last part of the path, after the list. */
  current?: string;
  title: string;
  titleLang?: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}

/** Top of a page in design v3: the large character on the left, title, lead and actions on the right. */
const GlyphHero: React.FC<GlyphHeroProps> = ({ glyph, mark, crumb, current, title, titleLang, lead, children }) => {
  const { language } = useLanguage();
  return (
    <section className="page-container pt-10 pb-16 md:pt-14 md:pb-[88px] flex flex-col md:flex-row gap-8 md:gap-[72px] md:items-center">
      {mark ??
        (glyph && (
          <span aria-hidden="true" className="font-seal font-black leading-none text-accent shrink-0 select-none text-[96px] md:text-[150px] lg:text-[168px]">
            {glyph}
          </span>
        ))}
      <div className="flex-1 min-w-0">
        {crumb && (
          <p className="text-[15px] text-muted-foreground mb-[18px]">
            <Link to={localizePath(crumb.path, language)} className="underline underline-offset-4 hover:text-foreground">
              {crumb.label}
            </Link>
            {current && <> / <span>{current}</span></>}
          </p>
        )}
        <h1 lang={titleLang} className="font-display text-[40px] md:text-[52px] lg:text-[58px] leading-[1.06] text-foreground mb-[22px] text-balance">
          {title}
        </h1>
        {lead && <div className="text-body max-w-[30em] space-y-3">{lead}</div>}
        {children && <div className="mt-[30px]">{children}</div>}
      </div>
    </section>
  );
};

export default GlyphHero;
