import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import Seal from '@/components/v3/Seal';
import CtaPair from '@/components/v3/CtaPair';
import VerdictSheet from '@/components/v3/VerdictSheet';
import DossierSection from '@/components/v3/DossierSection';
import ServiceRows from '@/components/v3/ServiceRows';
import CaseRows from '@/components/v3/CaseRows';
import QuestionsList from '@/components/v3/QuestionsList';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { getCases } from '@/content';
import { faqJsonLd, organizationJsonLd } from '@/seo/jsonld';

/** Sections of the old one-page site and where they live now. */
const LEGACY_ANCHORS: Record<string, string> = {
  '#about': '/about/',
  '#services': '/services/',
  '#approach': '/services/#approach',
  '#sectors': '/about/#sectors',
  '#governance': '/about/#governance',
  '#contact': '/contact/',
};

/** The home page shows the first three cases by their order. */
const QUESTIONS = [1, 2, 3, 4] as const;

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Old links such as kpsglobal.id/#contact go to the page that now holds the section.
  useEffect(() => {
    const target = LEGACY_ANCHORS[hash];
    if (target) navigate(localizePath(target, language), { replace: true });
  }, [hash, language, navigate]);

  const cities = canon.offices.map((office) => office.city[language]).join(t('about.and'));
  const cases = getCases().slice(0, 3);
  const questions = QUESTIONS.map((n) => ({ question: t(`home.q${n}`), answer: t(`home.a${n}`) }));
  const founder = canon.founder;
  const photo = founder?.photo;

  return (
    <>
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        socialDescription={t('seo.home.socialDescription')}
        path="/"
        jsonLd={[organizationJsonLd(language, t('seo.home.description')), faqJsonLd(questions)]}
      />

      {/* Seal, the promise and the two actions. */}
      <section className="page-container pt-8 pb-16 md:pt-12 md:pb-24 flex flex-col lg:flex-row gap-12 lg:gap-[72px] lg:items-center">
        <div className="flex gap-[26px] items-start shrink-0">
          <Seal size={300} label={t('seal.label')} className="hidden md:inline-flex" />
          <Seal size={160} label={t('seal.label')} className="md:hidden" />
          <span aria-hidden="true" className="font-seal font-semibold text-lg md:text-[22px] tracking-[0.45em] text-foreground [writing-mode:vertical-rl]">
            {"合同\u3000合规\u3000合作"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-muted-foreground mb-[22px]">{t('home.kicker', { cities, since: canon.practiceSince })}</p>
          <h1 className="h1-v3 mb-[26px]">{t('home.title')}</h1>
          <p className="text-body mb-[34px] max-w-[31em]">{t('home.lead')}</p>
          <CtaPair />
          <p className="mt-[18px] text-sm text-muted-foreground">{t('home.sealNote')}</p>
        </div>
      </section>

      {/* What you get back: a sample verdict. */}
      <section id="sample" className="bg-surface">
        <div className="page-container section-y grid gap-10 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-16 lg:items-center">
          <div>
            <h2 className="h2-v3 mb-[18px]">{t('verdict.title')}</h2>
            <p className="text-body mb-[22px] max-w-[26em]">{t('verdict.text')}</p>
            <Link to={localizePath('/documents/offer-check/', language)} className="link-v3 text-base">
              {t('verdict.link')}
            </Link>
          </div>
          <VerdictSheet />
        </div>
      </section>

      {/* 壹 What we do. */}
      <DossierSection id="what" n={1} numeralNote={t('numerals.note')}>
        <h2 className="h2-v3 mb-[30px]">{t('home.what.title')}</h2>
        <ServiceRows />
      </DossierSection>

      {/* 贰 Cases, with a stamp each. */}
      {cases.length > 0 && (
        <DossierSection id="cases" n={2} band>
          <h2 className="h2-v3 mb-3">{t('home.stamps.title')}</h2>
          <p className="text-base text-muted-foreground mb-[30px]">{t('home.stamps.note')}</p>
          <CaseRows cases={cases} />
        </DossierSection>
      )}

      {/* 叁 In the director's words. */}
      {founder && (
        <section id="quote">
          <div className="page-container py-16 md:py-[88px] grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
            <span aria-hidden="true" className="font-seal font-semibold text-[44px] md:text-[54px] leading-none text-accent">
              叁
            </span>
            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 items-start">
              {photo && (
                <picture>
                  <source type="image/avif" srcSet={photo.replace(/\.jpg$/, '-600.avif')} />
                  <source type="image/webp" srcSet={photo.replace(/\.jpg$/, '-600.webp')} />
                  <img
                    src={photo.replace(/\.jpg$/, '-600.jpg')}
                    alt={t('founder.photoAlt', { name: founder.name[language] })}
                    width={220}
                    height={280}
                    loading="lazy"
                    decoding="async"
                    className="w-[220px] h-[280px] object-cover border border-border"
                  />
                </picture>
              )}
              <div>
                <figure className="m-0">
                  <blockquote className="font-display text-[22px] md:text-[28px] leading-[1.42] text-foreground mb-[22px]">
                    <p>{t('home.quote')}</p>
                  </blockquote>
                  <figcaption className="text-base text-muted-foreground">
                    {founder.name[language]}, {t('home.quoteRole')}
                  </figcaption>
                </figure>
                <Link to={localizePath('/about/', language)} className="link-v3 inline-block mt-3.5 text-base">
                  {t('home.quoteLink')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 肆 Questions people ask first. */}
      <DossierSection id="questions" n={4}>
        <h2 className="h2-v3 mb-7">{t('home.questions.title')}</h2>
        <QuestionsList items={questions} />
      </DossierSection>

      <FinalCta />
    </>
  );
};

export default Index;
