import React from 'react';
import WechatCopy from '@/components/WechatCopy';
import PageSEO from '@/components/PageSEO';
import ContactForm from '@/components/ContactForm';
import PageGlyph from '@/components/v3/PageGlyph';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';

/**
 * /contact/: request a proposal. The page sign 合作, what happens next and the direct channels
 * on the left, the form on the right (under the heading on phones).
 */
const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { contacts } = canon;
  const link = 'link-v3';

  return (
    <>
      <PageSEO
        title={t('contact.page.title')}
        description={t('seo.contact.description')}
        path="/contact/"
        crumbs={[{ name: t('contact.page.title'), path: '/contact/' }]}
      />
      <section className="page-container pt-10 pb-20 md:pt-14 md:pb-24 grid gap-x-20 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
        <header className="lg:col-start-1 lg:row-start-1">
          <PageGlyph glyph="合作" className="text-[80px] md:text-[120px] mb-6" />
          <h1 className="font-display text-[40px] md:text-[54px] leading-[1.06] text-foreground mb-[18px]">{t('contact.page.title')}</h1>
          <p className="text-body max-w-[26em]">{t('contact.page.lead')}</p>
        </header>

        {/* On phones the form follows the heading; on wide screens it stands on the right. */}
        <div className="bg-card border border-border p-6 md:p-9 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <ContactForm />
        </div>

        <aside className="lg:col-start-1 lg:row-start-2">
          <h2 className="font-display text-2xl text-foreground mb-2.5">{t('contact.next.title')}</h2>
          <ol className="list-decimal pl-[22px] mb-9 text-body">
            {[1, 2, 3].map((n) => (
              <li key={n} className="py-1 pl-1">
                {t(`contact.next.${n}`)}
              </li>
            ))}
          </ol>

          <h2 className="font-display text-2xl text-foreground mb-2.5">{t('contact.channels')}</h2>
          <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-y-2 text-base">
            <dt className="text-muted-foreground">{t('contact.email')}</dt>
            <dd>
              <a href={`mailto:${contacts.email}`} className={link}>
                {contacts.email}
              </a>
            </dd>
            {contacts.whatsapp && (
              <>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd>
                  <a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className={link}>
                    {t('contact.openChat')}
                    <span className="sr-only"> WhatsApp</span>
                  </a>
                </dd>
              </>
            )}
            {contacts.telegram && (
              <>
                <dt className="text-muted-foreground">Telegram</dt>
                <dd>
                  <a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer" className={link}>
                    {t('contact.openChat')}
                    <span className="sr-only"> Telegram</span>
                  </a>
                </dd>
              </>
            )}
            {contacts.wechat && (
              <>
                <dt className="text-muted-foreground">{t('contact.wechat')}</dt>
                <dd>
                  <WechatCopy id={contacts.wechat.id} anchor="wechat" />
                </dd>
              </>
            )}
          </dl>
        </aside>
      </section>
    </>
  );
};

export default Contact;
