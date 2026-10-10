import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import CtaPair from '@/components/v3/CtaPair';

interface FinalCtaProps {
  title?: string;
  subtitle?: string;
  /** Prefills the topic of the contact form; the page then offers one button to it. */
  topic?: string;
  /** One button instead of the pair, e.g. a proposal for this service. */
  action?: { label: string; to: string };
  /** Leave out the line with the email and the channels. */
  bare?: boolean;
}

/** The closing block of a page: send the offer or ask for a proposal, or write directly. */
const FinalCta: React.FC<FinalCtaProps> = ({ title, subtitle, topic, action, bare = false }) => {
  const { t, language } = useLanguage();
  const { email } = canon.contacts;
  const [before, after] = t('final.text').split('{mail}');

  return (
    <section className="bg-surface">
      <div className="page-container py-16 md:py-[88px] flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16">
        <div className="flex-1 min-w-0">
          <h2 className={`font-display text-[32px] md:text-[42px] leading-[1.12] text-foreground ${bare ? '' : 'mb-[18px]'}`}>{title ?? t('home.final.title')}</h2>
          {!bare && (
          <p className="text-body measure">
            {subtitle ?? (
              <>
                {before}
                <a href={`mailto:${email}`} className="link-v3">
                  {email}
                </a>
                {after}
              </>
            )}
          </p>
          )}
        </div>
        {action ? (
          <Link to={action.to} className="btn-accent md:px-[30px] md:py-[18px] md:text-[17px] self-start lg:self-auto">
            {action.label}
          </Link>
        ) : topic ? (
          <Link to={`${localizePath('/contact/', language)}?topic=${encodeURIComponent(topic)}`} className="btn-accent md:px-[30px] md:py-[18px] md:text-[17px] self-start lg:self-auto">
            {t('cta.proposal')}
          </Link>
        ) : (
          <CtaPair large />
        )}
      </div>
    </section>
  );
};

export default FinalCta;
