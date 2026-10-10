import React from 'react';
import { Link } from 'react-router-dom';
import PageSEO from '@/components/PageSEO';
import GlyphHero from '@/components/v3/GlyphHero';
import FinalCta from '@/components/home/FinalCta';
import { COMMODITY_GLYPHS } from '@/components/v3/glyphs';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { commodityCard } from '@/content';

/** /commodities/: the five commodities as rows: sign, name, grade or standard, typical basis. */
const Commodities: React.FC = () => {
  const { t, language } = useLanguage();
  const title = t('nav.commodities');

  return (
    <>
      <PageSEO
        title={title}
        description={t('seo.commodities.description')}
        path="/commodities/"
        crumbs={[{ name: title, path: '/commodities/' }]}
      />
      <GlyphHero
        title={t('commodities.hero.title')}
        lead={
          <>
            <p>{t('commodities.hero.lead')}</p>
            <p className="text-[15px] text-muted-foreground">{t('deal.originNote')}</p>
          </>
        }
      />

      <section id="commodities" className="border-t border-border">
        <div className="page-container section-y">
          {/* Offers dashboard: reserved place above the list; nothing is rendered here yet. */}
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={title}>
            <table className="w-full min-w-[640px] text-left border-b border-border">
              <thead>
                <tr className="text-sm text-muted-foreground">
                  <td className="py-3 w-[96px]" />
                  <th scope="col" className="py-3 pr-6 font-normal">{t('commodities.col.name')}</th>
                  <th scope="col" className="py-3 pr-6 font-normal">{t('commodities.col.standard')}</th>
                  <th scope="col" className="py-3 font-normal">{t('commodities.card.basis')}</th>
                </tr>
              </thead>
              <tbody>
                {canon.commodities.map((commodity, i) => {
                  const card = commodityCard(commodity.id, language);
                  return (
                    <tr key={commodity.id} className={`border-t align-middle ${i === 0 ? 'border-foreground' : 'border-border'}`}>
                      <td aria-hidden="true" className="py-5 font-seal font-black text-[40px] leading-none text-accent">
                        {COMMODITY_GLYPHS[commodity.id]}
                      </td>
                      <th scope="row" className="py-5 pr-6 font-normal">
                        <Link to={localizePath(`/commodities/${commodity.id}/`, language)} className="font-display text-[23px] text-foreground underline-offset-[5px] hover:underline">
                          {commodity.name[language]}
                        </Link>
                      </th>
                      <td className="py-5 pr-6 text-body">{card?.grade}</td>
                      <td className="py-5 text-body">{card?.basisShort}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
};

export default Commodities;
