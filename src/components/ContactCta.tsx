import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';

interface ContactCtaProps {
  title?: string;
  subtitle?: string;
  label?: string;
  /** Prefills the topic field on the contact form. */
  topic?: string;
}

/** Closing call to action that leads to /contact/. */
const ContactCta: React.FC<ContactCtaProps> = ({ title, subtitle, label, topic }) => {
  const { t, language } = useLanguage();
  const to = `${localizePath('/contact/', language)}${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`;

  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            {title ?? t('home.cta.title')}
          </h2>
          <p className="text-muted-foreground text-lg">{subtitle ?? t('home.cta.subtitle')}</p>
        </div>
        <Link
          to={to}
          className="group inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground text-sm tracking-wide font-semibold hover:bg-primary/90 hover:gap-4 transition-all duration-300 rounded-sm shrink-0 self-start md:self-auto"
        >
          {label ?? t('hero.cta')}
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default ContactCta;
