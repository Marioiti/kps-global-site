import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon, legalAddressLine } from '@/data/canon';
import { sectionHasItems } from '@/content';
import { Mail, Send } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const trustElements = [
    t('footer.trust1'),
    t('footer.trust2'),
    t('footer.trust3'),
  ];

  return (
    <footer className="border-t border-border/50 dark:border-border bg-band text-band-foreground">
      {/* Trust strip */}
      <div className="border-b border-band-foreground/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustElements.map((item) => (
              <span key={item} className="text-xs tracking-[0.3em] uppercase text-band-foreground/70">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo and tagline */}
          <div>
            <img
              src="/brand/kps-lockup-s2-white.svg"
              alt={canon.brand}
              width={141}
              height={40}
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-band-foreground/70 italic font-serif">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Social / contact */}
          <div className="flex items-center gap-6">
            {/* LinkedIn */}
            <a
              href={canon.contacts.linkedinCompany}
              target="_blank"
              rel="noopener noreferrer"
              className="text-band-foreground/60 hover:text-band-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* WhatsApp */}
            {canon.contacts.whatsapp && (
              <a
                href={canon.contacts.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-band-foreground/60 hover:text-band-foreground transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}

            {/* Telegram */}
            {canon.contacts.telegram && (
              <a
                href={canon.contacts.telegram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-band-foreground/60 hover:text-band-foreground transition-colors"
                aria-label="Telegram"
              >
                <Send size={20} />
              </a>
            )}

            {/* Email */}
            <a
              href={`mailto:${canon.contacts.email}`}
              className="text-band-foreground/60 hover:text-band-foreground transition-colors"
              aria-label={canon.contacts.email}
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-band-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="md:max-w-2xl space-y-2">
            <p className="text-xs text-band-foreground/60">
              {t('footer.registered')}
            </p>
            <p className="text-xs text-band-foreground/50 dark:text-band-foreground/60">
              {canon.legal.name} · {t('footer.kbliLabel')} (KBLI {canon.legal.kbli.code}) · NIB {canon.legal.nib}
              <span className="mx-2 text-band-foreground/30">·</span>
              {legalAddressLine()}
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2 shrink-0">
            <p className="text-xs text-band-foreground/60">
              {[
                { path: '/commodities/', label: t('nav.commodities') },
                { path: '/procedures/', label: t('nav.procedures') },
                { path: '/privacy/', label: t('footer.privacy') },
              ]
                .filter((item) => sectionHasItems(item.path))
                .map((item, i) => (
                <React.Fragment key={item.path}>
                  {i > 0 && <span className="mx-2 text-band-foreground/30">·</span>}
                  <Link
                    to={localizePath(item.path, language)}
                    className="hover:text-band-foreground transition-colors underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
              <span className="mx-2 text-band-foreground/30">·</span>
              © {new Date().getFullYear()} {canon.brand}. {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
