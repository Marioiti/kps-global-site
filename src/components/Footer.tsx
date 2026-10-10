import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { sectionHasItems } from '@/content';

/** Sections linked here only once they have published items. */
const SECTIONS = [
  { key: 'nav.insights', path: '/insights/' },
  { key: 'nav.news', path: '/news/' },
  { key: 'nav.procedures', path: '/procedures/' },
  { key: 'nav.mandates', path: '/mandates/' },
];

/** One line of company details, the privacy policy and the direct channels. No slogans. */
const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { legal, contacts } = canon;
  const address = `${legal.address.street.split(',')[0]}, ${legal.address.city.replace('Kota ', '')}, ${legal.address.region} ${legal.address.postalCode}`;
  const link = 'underline-offset-4 hover:underline hover:text-foreground';

  return (
    <footer className="border-t border-border">
      <div className="page-container py-9 md:pb-12 flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between text-sm text-muted-foreground">
        <p>
          {legal.name} · NIB {legal.nib} · KBLI {legal.kbli.code} · {address}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t('footer.channels')}>
          <li>
            <a href={`mailto:${contacts.email}`} className={link}>
              {contacts.email}
            </a>
          </li>
          {contacts.whatsapp && (
            <li>
              <a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp
              </a>
            </li>
          )}
          {contacts.telegram && (
            <li>
              <a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer" className={link}>
                Telegram
              </a>
            </li>
          )}
          {contacts.wechat && (
            <li>
              {/* WeChat has no web link: the ID is on the contact page with a copy button. */}
              <Link to={`${localizePath('/contact/', language)}#wechat`} className={link} title={`WeChat: ${contacts.wechat}`}>
                WeChat
              </Link>
            </li>
          )}
          {SECTIONS.filter((section) => sectionHasItems(section.path)).map((section) => (
            <li key={section.path}>
              <Link to={localizePath(section.path, language)} className={link}>
                {t(section.key)}
              </Link>
            </li>
          ))}
          <li>
            <Link to={localizePath('/privacy/', language)} className={link}>
              {t('footer.privacy')}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
