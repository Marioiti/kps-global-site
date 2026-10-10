import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeChoice } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import Seal from '@/components/v3/Seal';
import { focusRing, linkClass, SERVICES, type NavItem } from '@/components/nav-shared';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
  contactPath: string;
  /** The menu button, focused again when the menu closes. */
  returnFocus: React.RefObject<HTMLButtonElement>;
}

/** The full-screen menu on phones and tablets, with the contact button fixed at the bottom. */
const MobileMenu: React.FC<MobileMenuProps> = ({ open, onOpenChange, items, contactPath, returnFocus }) => {
  const { t, language } = useLanguage();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        closeLabel={t('nav.closeMenu')}
        className="w-full sm:max-w-none p-0 flex flex-col gap-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <SheetTitle className="sr-only">{t('nav.menuTitle')}</SheetTitle>
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
          <Link to={localizePath('/', language)} onClick={close} className="inline-flex items-center gap-3 rounded-sm">
            <Seal size={36} />
            <span className="font-display text-[19px] font-medium text-foreground">{canon.brand}</span>
          </Link>
          <p className="mt-8 mb-2 text-sm text-muted-foreground">{t('nav.services')}</p>
          <ul className="border-b border-foreground">
            {SERVICES.map((item) => (
              <li key={item.key} className="border-t border-foreground">
                <Link to={localizePath(item.path, language)} onClick={close} className={`grid grid-cols-[64px_minmax(0,1fr)] gap-3 py-4 ${focusRing}`}>
                  <span aria-hidden="true" className="font-seal font-black text-2xl text-accent leading-none pt-1">{item.glyph}</span>
                  <span>
                    <span className="block font-display text-[21px] text-foreground">{t(`${item.key}.title`)}</span>
                    <span className="block text-sm text-body">{t(`${item.key}.desc`)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 border-b border-border">
            {items.map((item) => (
              <li key={item.key} className="border-t border-border">
                <NavLink to={localizePath(item.path, language)} onClick={close} className={({ isActive }) => `block py-3 font-display text-[21px] ${linkClass(isActive)}`}>
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-4">
            <LanguageSwitcher className="flex items-center gap-4 text-base" onNavigate={close} />
            <ThemeChoice />
          </div>
        </div>
        <div className="border-t border-border bg-background px-6 py-5 space-y-3">
          <Link to={`${contactPath}?intent=proposal`} onClick={close} className="btn-ink w-full py-3.5">
            {t('cta.proposal')}
          </Link>
          <a href={`mailto:${canon.contacts.email}`} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-sm">
            <Mail size={14} aria-hidden="true" />
            {canon.contacts.email}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
