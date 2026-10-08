import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { displayVersion, getCollection } from '@/content';
import DaisyMotif from './DaisyMotif';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Mail, MessageCircle, Linkedin, Send, AtSign } from 'lucide-react';

const ROLES = [
  { value: 'buyer', key: 'contact.roleBuyer' },
  { value: 'seller', key: 'contact.roleSeller' },
  { value: 'investor', key: 'contact.roleInvestor' },
  { value: 'intermediary', key: 'contact.roleIntermediary' },
  { value: 'other', key: 'contact.roleOther' },
];

const TOPIC_MAX = 200;
const OTHER_COMMODITY = 'other';

interface ContactSectionProps {
  /** Off when the page header already carries the title (the /contact/ page). */
  heading?: boolean;
  /** Prefilled topic, e.g. a mandate number. `?topic=` in the address takes precedence. */
  topic?: string;
  /** Preselected commodity. */
  commodity?: string;
}

/**
 * The request form: contact details, role, commodity and the documents wanted.
 * `?docs=a,b` preselects documents, `?topic=` fills the topic. Without a form endpoint
 * the form shows the email address instead of the submit button.
 */
const ContactSection: React.FC<ContactSectionProps> = ({ heading = true, topic = '', commodity = '' }) => {
  const { t, language } = useLanguage();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    email: '',
    role: '',
    commodity,
    documents: [] as string[],
    topic,
    message: '',
    // Honeypot — must stay empty for real users.
    company_website: '',
  });

  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
  const documents = useMemo(() => getCollection('documents'), []);

  // Pages link here with ?topic=… and ?docs=… to prefill the form.
  // Read after hydration: the prerendered HTML has no query string.
  const topicParam = searchParams.get('topic');
  const docsParam = searchParams.get('docs');
  useEffect(() => {
    if (topicParam) {
      setFormData((data) => (data.topic && data.topic !== topic ? data : { ...data, topic: topicParam.slice(0, TOPIC_MAX) }));
    }
  }, [topicParam, topic]);
  useEffect(() => {
    if (!docsParam) return;
    const wanted = docsParam.split(',').filter((slug) => documents.some((d) => d.slug === slug));
    setFormData((data) => ({ ...data, documents: [...new Set([...data.documents, ...wanted])] }));
  }, [docsParam, documents]);

  const toggleDocument = (slug: string) =>
    setFormData((data) => ({
      ...data,
      documents: data.documents.includes(slug) ? data.documents.filter((s) => s !== slug) : [...data.documents, slug],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent) return;

    // Silently drop bot submissions that fill the honeypot.
    if (formData.company_website) {
      setSubmitted(true);
      return;
    }
    if (!endpoint) return;

    const documentTitles = formData.documents.map(
      (slug) => documents.find((d) => d.slug === slug)?.versions.en?.title ?? slug,
    );

    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Website request — ${formData.name}${formData.company ? ` (${formData.company})` : ''}${
            formData.topic ? ` — ${formData.topic}` : ''
          }`,
          _replyto: formData.email,
          name: formData.name,
          company: formData.company,
          country: formData.country,
          email: formData.email,
          role: formData.role,
          commodity: formData.commodity,
          documents: documentTitles.join('; '),
          topic: formData.topic,
          message: formData.message,
          language,
          page: pathname,
          privacyConsent: true,
          consentAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Submit failed');
      setSubmitted(true);
      toast.success(t('contact.success'));
    } catch {
      toast.error(t('contact.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const { contacts } = canon;
  const channels = [
    { key: 'email', icon: Mail, label: contacts.email, href: `mailto:${contacts.email}`, external: false },
    contacts.whatsapp && {
      key: 'whatsapp',
      icon: MessageCircle,
      label: `${t('contact.whatsappLabel')} ${contacts.whatsapp.display}`,
      href: contacts.whatsapp.url,
      external: true,
    },
    contacts.telegram && {
      key: 'telegram',
      icon: Send,
      label: `${t('contact.telegramLabel')} ${contacts.telegram.handle}`,
      href: contacts.telegram.url,
      external: true,
    },
    contacts.wechat && {
      key: 'wechat',
      icon: AtSign,
      label: `${t('contact.wechatLabel')}: ${contacts.wechat}`,
      href: null,
      external: false,
    },
    { key: 'linkedin-company', icon: Linkedin, label: t('contact.linkedinCompany'), href: contacts.linkedinCompany, external: true },
    { key: 'linkedin-founder', icon: Linkedin, label: t('contact.linkedinFounder'), href: contacts.linkedinFounder, external: true },
  ].filter((channel): channel is Exclude<typeof channel, null | false> => Boolean(channel));

  const inputClasses =
    'w-full px-4 py-3 bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-colors';
  const selectClasses =
    'w-full px-4 py-3 bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-colors appearance-none';
  const labelClasses = 'block text-xs tracking-widest uppercase text-muted-foreground mb-2';

  if (submitted) {
    return (
      <section id="contact" className="py-32 relative">
        <Toaster />
        <div className="max-w-2xl mx-auto px-6 text-center">
          <DaisyMotif size={48} className="text-primary mx-auto mb-8" />
          <h2 className="font-serif text-3xl text-foreground mb-4">{t('contact.success')}</h2>
        </div>
      </section>
    );
  }

  const field = (key: 'name' | 'company' | 'country' | 'email', type = 'text', required = false) => (
    <div>
      <label htmlFor={`contact-${key}`} className={labelClasses}>
        {t(`contact.${key}`)}
      </label>
      <input
        id={`contact-${key}`}
        type={type}
        required={required}
        maxLength={200}
        autoComplete={key === 'email' ? 'email' : key === 'name' ? 'name' : key === 'company' ? 'organization' : 'country-name'}
        placeholder={t(`contact.${key}Placeholder`)}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className={inputClasses}
      />
    </div>
  );

  return (
    <section id="contact" className="py-32 relative">
      <Toaster />
      <div className="absolute top-0 left-0 right-0 line-rule" />

      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        {heading && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">
                {t('contact.sectionLabel')}
              </span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              {t('contact.title')}
            </h2>
            <p className="text-muted-foreground mb-12">{t('contact.subtitle')}</p>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {field('name', 'text', true)}
          {field('company')}
          <div className="grid sm:grid-cols-2 gap-6">
            {field('country')}
            {field('email', 'email', true)}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact-role" className={labelClasses}>
                {t('contact.role')}
              </label>
              <select
                id="contact-role"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={selectClasses}
              >
                <option value="" disabled>{t('contact.rolePlaceholder')}</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{t(role.key)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-commodity" className={labelClasses}>
                {t('contact.commodity')}
              </label>
              <select
                id="contact-commodity"
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                className={selectClasses}
              >
                <option value="">{t('contact.commodityPlaceholder')}</option>
                {canon.commodities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name[language]}</option>
                ))}
                <option value={OTHER_COMMODITY}>{t('contact.commodityOther')}</option>
              </select>
            </div>
          </div>

          {documents.length > 0 && (
            <fieldset>
              <legend className={labelClasses}>{t('contact.documents')}</legend>
              <p className="text-xs text-muted-foreground mb-3">{t('contact.documentsHint')}</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 max-h-64 overflow-y-auto border border-border bg-secondary/30 p-4">
                {documents.map((doc) => {
                  const id = `contact-doc-${doc.slug}`;
                  const version = displayVersion(doc, language);
                  return (
                    <label key={doc.slug} htmlFor={id} className="flex items-start gap-2 text-sm text-foreground/80 cursor-pointer">
                      <input
                        id={id}
                        type="checkbox"
                        checked={formData.documents.includes(doc.slug)}
                        onChange={() => toggleDocument(doc.slug)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <span lang={version.language}>{version.title}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor="contact-topic" className={labelClasses}>
              {t('contact.topic')}
            </label>
            <input
              id="contact-topic"
              type="text"
              maxLength={TOPIC_MAX}
              placeholder={t('contact.topicPlaceholder')}
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className={labelClasses}>
              {t('contact.message')}
            </label>
            <textarea
              id="contact-message"
              required
              maxLength={2000}
              rows={5}
              placeholder={t('contact.messagePlaceholder')}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`${inputClasses} resize-y`}
            />
          </div>

          {/* Honeypot (hidden from users) */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={formData.company_website}
            onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
            className="hidden"
          />

          {/* Personal-data processing consent */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-1 w-4 h-4 border border-border bg-secondary/50 accent-primary cursor-pointer"
              required
            />
            <label htmlFor="privacyConsent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              {t('contact.privacyPrefix')}
              <Link
                to={localizePath('/privacy/', language)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-2 font-medium"
              >
                {t('contact.privacyLink')}
              </Link>
              {t('contact.privacySuffix')}
            </label>
          </div>

          {endpoint ? (
            <button
              type="submit"
              disabled={!privacyConsent || submitting}
              className="w-full py-4 bg-primary text-primary-foreground text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed glow-primary mt-2"
            >
              {submitting ? t('contact.submitting') : t('contact.submit')}
            </button>
          ) : (
            <div className="border border-border bg-secondary/40 p-5 text-sm text-foreground/80">
              <p className="mb-3">{t('contact.noForm')}</p>
              <a
                href={`mailto:${contacts.email}`}
                className="inline-flex items-center gap-2 font-semibold text-primary hover:underline underline-offset-4"
              >
                <Mail size={16} />
                {t('contact.emailUs')}
              </a>
            </div>
          )}
        </form>

        {/* Direct channels */}
        <div className="mt-14 pt-10 border-t border-border/60">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-6">
            {t('contact.directLabel')}
          </span>
          <div className="grid sm:grid-cols-2 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const body = (
                <>
                  <Icon size={16} className="text-primary shrink-0" />
                  {channel.label}
                </>
              );
              const classes = 'inline-flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors';
              return channel.href ? (
                <a
                  key={channel.key}
                  href={channel.href}
                  {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={classes}
                >
                  {body}
                </a>
              ) : (
                <span key={channel.key} className="inline-flex items-center gap-3 text-sm text-foreground/80">
                  {body}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
