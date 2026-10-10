import React from 'react';
import { Link } from 'react-router-dom';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';
import Seal from '@/components/v3/Seal';
import DossierSection from '@/components/v3/DossierSection';
import RuledList from '@/components/v3/RuledList';
import CaseRows from '@/components/v3/CaseRows';
import FinalCta from '@/components/home/FinalCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon, legalAddressLine, officeLine, type HistoryEntry } from '@/data/canon';
import { getCases } from '@/content';
import { formatDate, formatPeriod } from '@/i18n/format';
import { localizePath } from '@/i18n/locales';

const PRINCIPLES = [1, 2, 3, 4] as const;

/**
 * /about/: the seal and what we do for both sides of a deal, then the director, the company
 * history, how we work, every case and the company details.
 */
const About: React.FC = () => {
  const { t, language } = useLanguage();
  const { founder, legal, contacts } = canon;
  const offices = canon.offices.map((office) => officeLine(office, language));
  const officeList = offices.length > 1 ? `${offices.slice(0, -1).join(', ')}${t('about.and')}${offices[offices.length - 1]}` : offices[0];
  const cases = getCases();
  const period = (entry: HistoryEntry) => formatPeriod(entry.from, entry.to, language, t('history.since'));
  const photo = founder?.photo;

  const details: { label: string; value: React.ReactNode }[] = [
    { label: t('legal.company'), value: `${legal.name} (${legal.form[language]})` },
    { label: t('legal.registered'), value: formatDate(legal.registered, language) },
    { label: t('legal.decision'), value: legal.ministryDecision },
    { label: t('legal.nib'), value: legal.nib },
    { label: t('legal.kbli'), value: `${legal.kbli.code}, ${legal.kbli.title}` },
    { label: t('legal.address'), value: legalAddressLine() },
    { label: t('legal.offices'), value: offices.join('; ') },
    {
      label: t('legal.email'),
      value: (
        <a href={`mailto:${contacts.email}`} className="link-v3">
          {contacts.email}
        </a>
      ),
    },
  ];
  let n = 0;
  const next = () => ++n;

  return (
    <>
      <PageSEO
        title={t('nav.about')}
        description={t('seo.about.description')}
        path="/about/"
        crumbs={[{ name: t('nav.about'), path: '/about/' }]}
      />
      <GlyphHero
        mark={
          <>
            <Seal size={220} className="hidden md:inline-flex" />
            <Seal size={160} className="md:hidden" />
          </>
        }
        title={t('about.hero.title')}
        lead={<p>{t('about.hero.lead', { offices: officeList, since: canon.practiceSince })}</p>}
      />

      {founder && (
        <DossierSection id="founder" n={next()}>
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 items-start">
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
            <div className="min-w-0">
              <h2 className="h2-v3 mb-1">{founder.name[language]}</h2>
              <p className="text-base text-muted-foreground mb-6">{founder.role[language]}</p>
              <blockquote className="font-display text-[21px] md:text-[24px] leading-[1.45] text-foreground mb-8 measure">
                <p>{t('home.quote')}</p>
              </blockquote>
              <RuledList
                className="measure"
                items={founder.facts[language].map((fact) => ({ key: fact, content: <p className="py-3 text-body">{fact}</p> }))}
              />
              <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="link-v3 inline-block mt-5 text-base">
                {t('founder.linkedin')}
              </a>
            </div>
          </div>
        </DossierSection>
      )}

      {canon.history.length > 0 && (
        <DossierSection id="history" n={next()} band>
          <div data-history>
          <h2 className="h2-v3 mb-[26px]">{t('history.title')}</h2>
          <ol className="grid gap-6 md:grid-cols-3 md:gap-0">
            {canon.history.map((entry, i) => (
              <li key={entry.from} className={`pt-[18px] md:pr-6 border-t-[3px] ${i === canon.history.length - 1 ? 'border-accent' : 'border-foreground'}`}>
                <p className="text-[15px] text-muted-foreground tabular-nums">{period(entry)}</p>
                <p className="font-display text-[23px] text-foreground">{entry.name}</p>
                {entry.noteKey && <p className="text-[15px] text-body">{t(entry.noteKey)}</p>}
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[15px] text-muted-foreground measure">
            {t('history.note', { registered: formatDate(legal.registered, language), since: canon.practiceSince })}
          </p>
          </div>
        </DossierSection>
      )}

      <DossierSection id="principles" n={next()}>
        <h2 className="h2-v3 mb-[22px]">{t('about.principles.title')}</h2>
        <div className="space-y-4 measure">
          {PRINCIPLES.map((p) => (
            <p key={p} className="text-body">
              <strong className="font-semibold text-foreground">{t(`about.principle${p}.title`)}</strong> {t(`about.principle${p}.desc`)}
            </p>
          ))}
        </div>
      </DossierSection>

      {cases.length > 0 && (
        <DossierSection id="cases" n={next()} band>
          <h2 className="h2-v3 mb-3">{t('about.cases.title')}</h2>
          <p className="text-base text-muted-foreground mb-[30px]">{t('home.stamps.note')}</p>
          <CaseRows cases={cases} />
        </DossierSection>
      )}

      <DossierSection id="legal" n={next()}>
        <h2 className="h2-v3 mb-[22px]">{t('legal.title')}</h2>
        <dl className="max-w-3xl border-b border-border text-base">
          {details.map((row) => (
            <div key={row.label} className="grid sm:grid-cols-[220px_minmax(0,1fr)] gap-1 sm:gap-6 py-3 border-t border-border">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <Link to={localizePath('/privacy/', language)} className="link-v3 inline-block mt-5 text-base">
          {t('footer.privacy')}
        </Link>
      </DossierSection>

      <FinalCta title={t('about.final.title')} bare action={{ label: t('cta.proposal'), to: `${localizePath('/contact/', language)}?intent=proposal` }} />
    </>
  );
};

export default About;
