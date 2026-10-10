import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { legalAddressLine } from '@/data/canon';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';

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
        <ul key={bi} className="my-4 space-y-1.5 list-disc pl-5 text-body">
          {lines.map((l, li) => (
            <li key={li} className="leading-relaxed">
              {renderBold(l.trim().slice(2), `${bi}-${li}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={bi} className="my-4 text-body whitespace-pre-line">
        {renderBold(block, `${bi}`)}
      </p>
    );
  });
}

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();
  const body = (key: string) => renderBody(t(key, { address: legalAddressLine() }));

  return (
    <>
      <PageSEO
        title={t('privacy.title')}
        description={t('seo.privacy.description')}
        path="/privacy/"
        crumbs={[{ name: t('privacy.title'), path: '/privacy/' }]}
      />
      <GlyphHero
        glyph="私"
        title={t('privacy.title')}
        lead={<p className="text-[15px] text-muted-foreground">{`${t('privacy.lastUpdatedLabel')}: ${t('privacy.lastUpdatedDate')}`}</p>}
      />
      <div className="border-t border-border">
        <div className="page-container section-y text-body">
          <div className="measure">
            {body('privacy.intro')}

            {SECTION_KEYS.map((s) => (
              <section key={s} className="mt-10">
                <h2 className="font-display text-2xl md:text-[28px] text-foreground mb-2">{t(`privacy.${s}.title`)}</h2>
                {body(`privacy.${s}.body`)}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
