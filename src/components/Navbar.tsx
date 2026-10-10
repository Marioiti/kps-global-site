import React, { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath, stripLanguagePrefix } from '@/i18n/locales';
import { canon } from '@/data/canon';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Seal from '@/components/v3/Seal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { focusRing, linkClass, SERVICES, type NavItem } from '@/components/nav-shared';

const loadMobileMenu = () => import('@/components/MobileMenu');
const MobileMenu = lazy(loadMobileMenu);

/** Links after "Services"; sections without published items stay out. */
const NAV_ITEMS: NavItem[] = [
  { key: 'nav.commodities', path: '/commodities/' },
  { key: 'nav.documents', path: '/documents/' },
  { key: 'nav.about', path: '/about/' },
];

/**
 * "Services" disclosure: Enter, Space or the arrows open it and move focus through the
 * items, Escape closes it and returns focus to the button, a click outside closes it.
 */
const ServicesMenu: React.FC = () => {
  const { t, language } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const active = stripLanguagePrefix(pathname).startsWith('/services/');

  const focusItem = (index: number) => {
    const list = items.current.filter(Boolean) as HTMLAnchorElement[];
    if (list.length) list[(index + list.length) % list.length].focus();
  };

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    if (pendingFocus.current !== null) {
      focusItem(pendingFocus.current);
      pendingFocus.current = null;
    }
    const onPointer = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const openAt = (index: number) => {
    if (open) focusItem(index);
    else {
      pendingFocus.current = index;
      setOpen(true);
    }
  };

  const onButtonKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAt(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(-1);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const onPanelKey = (event: React.KeyboardEvent) => {
    const list = items.current.filter(Boolean) as HTMLAnchorElement[];
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(-1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? 'true' : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKey}
        className={`inline-flex items-center gap-1 ${linkClass(active)}`}
      >
        {t('nav.services')}
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        onKeyDown={onPanelKey}
        className="absolute left-0 top-full mt-3 w-[26rem] border border-border bg-popover text-popover-foreground rounded-sm p-2"
      >
        <ul aria-label={t('nav.servicesMenu')}>
          {SERVICES.map((item, i) => (
            <li key={item.key}>
              <Link
                ref={(el) => (items.current[i] = el)}
                to={localizePath(item.path, language)}
                className={`block px-4 py-3 rounded-sm hover:bg-muted ${focusRing}`}
              >
                <span className="block text-sm font-semibold text-foreground">{t(`${item.key}.title`)}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{t(`${item.key}.desc`)}</span>
              </Link>
            </li>
          ))}
          <li className="border-t border-border mt-1 pt-1">
            <Link
              ref={(el) => (items.current[SERVICES.length] = el)}
              to={localizePath('/services/', language)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium text-primary hover:bg-muted ${focusRing}`}
            >
              {t('menu.allServices')}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  // Kept mounted after the first opening, so closing can animate.
  const menuUsed = useRef(false);
  if (mobileOpen) menuUsed.current = true;
  const items = NAV_ITEMS;
  const contactPath = localizePath('/contact/', language);


  return (
    <header className="border-b border-border">
      <div className="page-container flex items-center gap-x-8 gap-y-4 py-4 lg:py-[22px]">
        <Link to={localizePath('/', language)} className="flex items-center gap-3 mr-auto rounded-sm">
          <Seal size={36} />
          <span className="font-display text-[19px] sm:text-[21px] font-medium tracking-[0.01em] text-foreground">{canon.brand}</span>
        </Link>

        <nav aria-label={t('nav.main')} className="hidden lg:flex items-center gap-6 text-base">
          <ServicesMenu />
          {items.map((item) => (
            <NavLink key={item.key} to={localizePath(item.path, language)} className={({ isActive }) => linkClass(isActive)}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3.5 shrink-0">
          <LanguageSwitcher className="flex items-center gap-3.5 text-sm" />
          <ThemeToggle />
          <Link to={`${contactPath}?intent=proposal`} className="btn-ink">
            {t('cta.proposal')}
          </Link>
        </div>

        {/* Mobile: the full-screen menu loads on first use, so it stays out of the main script. */}
        <button
          ref={menuButton}
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground"
          aria-label={t('nav.openMenu')}
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          onPointerEnter={loadMobileMenu}
          onFocus={loadMobileMenu}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        {(mobileOpen || menuUsed.current) && (
          <Suspense fallback={null}>
            <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} items={items} contactPath={contactPath} returnFocus={menuButton} />
          </Suspense>
        )}
      </div>
    </header>
  );
};

export default Navbar;
