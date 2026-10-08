import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { sectionHasItems } from '@/content';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'nav.services', path: '/services/' },
  { key: 'nav.commodities', path: '/commodities/' },
  { key: 'nav.mandates', path: '/mandates/' },
  { key: 'nav.documents', path: '/documents/' },
  { key: 'nav.insights', path: '/insights/' },
  { key: 'nav.news', path: '/news/' },
  { key: 'nav.about', path: '/about/' },
  { key: 'nav.contact', path: '/contact/' },
];

const linkClass = (isActive: boolean) =>
  `text-sm tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${
    isActive ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-primary'
  }`;

const Navbar: React.FC = () => {
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = (onNavigate?: () => void) =>
    NAV_ITEMS.filter((item) => sectionHasItems(item.path)).map((item) => (
      <NavLink
        key={item.key}
        to={localizePath(item.path, language)}
        onClick={onNavigate}
        className={({ isActive }) => linkClass(isActive)}
      >
        {t(item.key)}
      </NavLink>
    ));

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 border-border/60 shadow-sm'
          : 'bg-background/60 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-6 transition-all duration-300 ${
            scrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
          }`}
        >
          {/* Logo */}
          <Link to={localizePath('/', language)} className="flex items-center group shrink-0">
            {/* Mark alone on narrow screens, the full lockup from sm up. */}
            <img
              src="/brand/kps-mark-s2-navy.svg"
              alt={canon.brand}
              width={40}
              height={40}
              className="h-10 w-10 sm:hidden transition-transform duration-500 group-hover:scale-105"
            />
            <img
              src="/brand/kps-lockup-s2-navy.svg"
              alt={canon.brand}
              width={170}
              height={48}
              className="hidden sm:block h-12 w-auto transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-5">{links()}</div>

          {/* Language switcher */}
          <LanguageSwitcher className="hidden xl:flex items-center gap-1 border border-border rounded-sm shrink-0" />

          {/* Mobile menu: slide-out panel */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="xl:hidden p-2 text-foreground" aria-label={t('nav.openMenu')}>
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-0 pt-16">
              <SheetTitle className="sr-only">{t('nav.menuTitle')}</SheetTitle>
              <div className="flex flex-col gap-5">{links(() => setMobileOpen(false))}</div>
              <LanguageSwitcher
                className="flex items-center gap-1 border border-border rounded-sm w-fit mt-10"
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
