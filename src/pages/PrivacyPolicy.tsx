import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { legalAddressLine } from '@/data/canon';
import PageSEO from '@/components/PageSEO';

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const;

/** Inline **bold** → <strong>. */
function renderBold(text: string, keyPrefix: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
    ),
  );
}

/**
 * Renders a translation body string: blank-line-separated paragraphs, with
 * consecutive lines starting "- " grouped into a bullet list, and **bold**.
 */
function renderBody(body: string): React.ReactNode[] {
  const blocks = body.split(/\n\n+/).filter((b) => b.trim());
  return blocks.map((block, bi) => {
    const lines = block.split('\n');
    const isList = lines.every((l) => l.trim().startsWith('- '));

    if (isList) {
      return (
        <ul key={bi} className="my-4 space-y-1.5 list-disc pl-5 text-muted-foreground">
          {lines.map((l, li) => (
            <li key={li} className="leading-relaxed">
              {renderBold(l.trim().slice(2), `${bi}-${li}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={bi} className="my-4 leading-relaxed text-muted-foreground whitespace-pre-line">
        {renderBold(block, `${bi}`)}
      </p>
    );
  });
}

const PrivacyPolicy: React.FC = () => {
  const { t, language } = useLanguage();
  const homePath = localizePath('/', language);
  const body = (key: string) => renderBody(t(key, { address: legalAddressLine() }));

  return (
    <>
      <PageSEO
        title={t('privacy.title')}
        description={t('seo.privacy.description')}
        path="/privacy/"
        crumbs={[{ name: t('privacy.title'), path: '/privacy/' }]}
      />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-36 pb-16 md:pb-24">
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          {t('privacy.backHome')}
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          {t('privacy.title')}
        </h1>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-10">
          {t('privacy.lastUpdatedLabel')}: {t('privacy.lastUpdatedDate')}
        </p>

        <div className="text-[15px]">
          {body('privacy.intro')}

          {SECTION_KEYS.map((s) => (
            <section key={s} className="mt-10">
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-2">
                {t(`privacy.${s}.title`)}
              </h2>
              {body(`privacy.${s}.body`)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
