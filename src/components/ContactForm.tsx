import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import Stamp from '@/components/v3/Stamp';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import { canon } from '@/data/canon';
import { getCollection } from '@/content';

/** "What do you need?" — value sent to the form provider and the label key. */
const NEEDS = [
  { value: 'offer-check', key: 'contact.need.offerCheck' },
  { value: 'deal-health-check', key: 'contact.need.dealHealthCheck' },
  { value: 'deal-structuring', key: 'contact.need.dealStructuring' },
  { value: 'compliance-kyc', key: 'contact.need.complianceKyc' },
  { value: 'fractional-coo', key: 'contact.need.fractionalCoo' },
  { value: 'other', key: 'contact.need.other' },
] as const;
type Need = (typeof NEEDS)[number]['value'];

const ROLES = [
  { value: 'buyer', key: 'contact.roleBuyer' },
  { value: 'seller', key: 'contact.roleSeller' },
  { value: 'investor', key: 'contact.roleInvestor' },
  { value: 'project-owner', key: 'contact.roleOwner' },
  { value: 'other', key: 'contact.roleOther' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { short: 200, message: 3000 };

type Field = 'name' | 'email' | 'need' | 'message' | 'consent';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface ContactFormProps {
  /** What the request is about, e.g. a mandate number; the address can add to it. */
  regarding?: string;
  /** Preselected "What do you need?". */
  need?: Need;
}

const focusRing = 'focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground';
const inputClass = `w-full px-3.5 py-[13px] bg-background border border-input text-foreground text-[17px] placeholder:text-muted-foreground transition-colors ${focusRing}`;
const invalidClass = 'border-destructive';
const labelClass = 'block text-[15px] font-medium text-foreground mb-1.5';

/**
 * The request form. Without scripts it is a plain POST to the form provider (the address in
 * VITE_FORMSPREE_ENDPOINT); with scripts it validates in the browser and sends the same fields
 * as JSON. `?service=`, `?docs=`, `?mandate=`, `?commodity=`, `?intent=proposal` and `?topic=` prefill it. Without an endpoint the
 * form shows the email address instead of the submit button.
 */
const ContactForm: React.FC<ContactFormProps> = ({ regarding = '', need: initialNeed }) => {
  const { t, language } = useLanguage();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
  const ids = useId();
  const documents = useMemo(() => getCollection('documents'), []);

  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    need: (initialNeed ?? '') as Need | '',
    message: '',
    company: '',
    role: '',
    consent: false,
    gotcha: '',
  });
  const [context, setContext] = useState(regarding);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setHydrated(true), []);

  // The address prefills the form after hydration (the prerendered page has no query string).
  const service = searchParams.get('service');
  const docs = searchParams.get('docs');
  const mandate = searchParams.get('mandate');
  const topic = searchParams.get('topic');
  const commodity = canon.commodities.find((c) => c.id === searchParams.get('commodity'));
  const proposal = searchParams.get('intent') === 'proposal';
  useEffect(() => {
    const parts: string[] = regarding ? [regarding] : [];
    let need: Need | '' = initialNeed ?? '';
    if (service && NEEDS.some((n) => n.value === service)) need = service as Need;
    if (docs) {
      const slugs = docs.split(',').map((s) => s.trim()).filter(Boolean);
      if (!service) need = slugs.includes('offer-check') ? 'offer-check' : slugs.includes('deal-health-check') ? 'deal-health-check' : 'other';
      const titles = slugs
        .filter((slug) => slug !== 'offer-check' && slug !== 'deal-health-check')
        .map((slug) => documents.find((d) => d.slug === slug)?.versions.en?.title)
        .filter(Boolean);
      if (titles.length) parts.push(t('contact.regardingDocuments', { titles: titles.join(', ') }));
    }
    if (mandate && /^KPS-M-\d{4}-\d{3}$/i.test(mandate)) {
      if (!service) need = 'deal-structuring';
      parts.push(t('contact.regardingMandate', { id: mandate.toUpperCase() }));
    }
    if (commodity) parts.push(t('contact.regardingCommodity', { name: commodity.name[language] }));
    if (proposal) parts.push(t('contact.regardingProposal'));
    if (topic) parts.push(topic.slice(0, MAX.short));
    setContext(parts.join(' · '));
    if (need) setValues((v) => ({ ...v, need }));
  }, [service, docs, mandate, commodity, proposal, topic, regarding, initialNeed, documents, t, language]);

  const set = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target instanceof HTMLInputElement && event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field as Field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = t('contact.err.name');
    if (!EMAIL.test(values.email.trim())) next.email = t('contact.err.email');
    if (!values.need) next.need = t('contact.err.need');
    if (values.message.trim().length < 10) next.message = t('contact.err.message');
    if (!values.consent) next.consent = t('contact.err.consent');
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (['name', 'email', 'need', 'message', 'consent'] as Field[]).find((f) => found[f]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // A filled honeypot means a bot: pretend it worked, send nothing.
    if (values.gotcha) {
      setStatus('success');
      return;
    }
    if (!endpoint) return;

    setStatus('submitting');
    const needLabel = NEEDS.find((n) => n.value === values.need);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Website request — ${values.name}${values.company ? ` (${values.company})` : ''} — ${needLabel ? needLabel.value : ''}`,
          _replyto: values.email,
          name: values.name,
          email: values.email,
          need: values.need,
          message: values.message,
          company: values.company,
          role: values.role,
          regarding: context,
          language,
          page: pathname,
          consent: true,
          consentAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Submit failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <Stamp kind="join" label={t('stamp.join')} size="md" rotate={-4} />
        <h2 className="font-display text-[32px] text-foreground">{t('contact.success')}</h2>
        <p className="text-body">{t('contact.successPrepare')}</p>
        <button
          type="button"
          className="btn-outline px-5 py-3 text-[15px]"
          onClick={() => {
            setValues((v) => ({ ...v, message: '', consent: false }));
            setStatus('idle');
          }}
        >
          {t('contact.another')}
        </button>
      </div>
    );
  }

  const field = (name: Field) => ({
    id: `${ids}-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': [errors[name] ? `${ids}-${name}-error` : '', name === 'message' ? `${ids}-message-hint` : ''].filter(Boolean).join(' ') || undefined,
  });
  const errorText = (name: Field) =>
    errors[name] ? (
      <p id={`${ids}-${name}-error`} className="mt-1.5 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form
      ref={formRef}
      action={endpoint || undefined}
      method="POST"
      noValidate={hydrated}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      aria-describedby={hasErrors ? `${ids}-summary` : undefined}
    >
      {hasErrors && (
        <p id={`${ids}-summary`} role="alert" className="text-sm font-medium text-destructive">
          {t('contact.err.summary')}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor={`${ids}-name`} className={labelClass}>
            {t('contact.name')}
                      </label>
          <input
            {...field('name')}
            type="text"
            required
            maxLength={MAX.short}
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            className={`${inputClass} ${errors.name ? invalidClass : ''}`}
          />
          {errorText('name')}
        </div>
        <div>
          <label htmlFor={`${ids}-email`} className={labelClass}>
            {t('contact.email')}
                      </label>
          <input
            {...field('email')}
            type="email"
            required
            maxLength={MAX.short}
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            className={`${inputClass} ${errors.email ? invalidClass : ''}`}
          />
          {errorText('email')}
        </div>
      </div>

      <div>
        <label htmlFor={`${ids}-need`} className={labelClass}>
          {t('contact.need')}
                  </label>
        <select
          {...field('need')}
          required
          value={values.need}
          onChange={set('need')}
          className={`${inputClass} ${errors.need ? invalidClass : ''}`}
        >
          <option value="" disabled>
            {t('contact.needPlaceholder')}
          </option>
          {NEEDS.map((n) => (
            <option key={n.value} value={n.value}>
              {t(n.key)}
            </option>
          ))}
        </select>
        {errorText('need')}
      </div>

      {context && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t('contact.regarding')}:</span> {context}
        </p>
      )}
      <input type="hidden" name="regarding" value={context} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="page" value={pathname} />

      <div>
        <label htmlFor={`${ids}-message`} className={labelClass}>
          {t('contact.message')}
                  </label>
        <textarea
          {...field('message')}
          required
          minLength={10}
          maxLength={MAX.message}
          rows={5}
          value={values.message}
          onChange={set('message')}
          className={`${inputClass} resize-y ${errors.message ? invalidClass : ''}`}
        />
        <p id={`${ids}-message-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {t('contact.messageHint')}
        </p>
        {errorText('message')}
      </div>

      <details className="text-[15px]">
        <summary className="cursor-pointer py-1.5 text-foreground underline-offset-4 hover:underline">{t('contact.details')}</summary>
        <div className="flex flex-col gap-3.5 pt-3">
          <div>
            <label htmlFor={`${ids}-company`} className={labelClass}>
              {t('contact.company')}
            </label>
            <input
              id={`${ids}-company`}
              name="company"
              type="text"
              maxLength={MAX.short}
              autoComplete="organization"
              value={values.company}
              onChange={set('company')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${ids}-role`} className={labelClass}>
              {t('contact.role')}
            </label>
            <select id={`${ids}-role`} name="role" value={values.role} onChange={set('role')} className={inputClass}>
              <option value="">{t('contact.rolePlaceholder')}</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.key)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>

      {/* Honeypot: hidden from people; the form provider drops messages that fill it. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${ids}-gotcha`}>Leave empty</label>
        <input id={`${ids}-gotcha`} name="_gotcha" type="text" tabIndex={-1} autoComplete="off" value={values.gotcha} onChange={set('gotcha')} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            {...field('consent')}
            type="checkbox"
            value="yes"
            required
            checked={values.consent}
            onChange={set('consent')}
            className="mt-[3px] w-5 h-5 shrink-0 accent-[hsl(var(--accent))] cursor-pointer"
          />
          <label htmlFor={`${ids}-consent`} className="text-[15px] text-body leading-relaxed cursor-pointer">
            {t('contact.privacyPrefix')}
            <Link to={localizePath('/privacy/', language)} className="link-v3 text-foreground">
              {t('contact.privacyLink')}
            </Link>
            {t('contact.privacySuffix')}
          </label>
        </div>
        {errorText('consent')}
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {t('contact.error')}{' '}
          <a href={`mailto:${canon.contacts.email}`} className="font-medium underline underline-offset-2">
            {canon.contacts.email}
          </a>
        </p>
      )}

      {endpoint ? (
        <button
          type="submit"
          disabled={status === 'submitting'}
          aria-disabled={status === 'submitting'}
          className="btn-accent self-start gap-2 px-[30px] py-[17px] text-[17px] disabled:opacity-70 disabled:cursor-wait"
        >
          {status === 'submitting' && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
          {status === 'submitting' ? t('contact.submitting') : t('contact.submit')}
        </button>
      ) : (
        <div className="border-t border-border pt-5 text-body">
          <p className="mb-3">{t('contact.noForm')}</p>
          <a href={`mailto:${canon.contacts.email}`} className="inline-flex items-center gap-2 font-medium text-foreground link-v3">
            <Mail size={16} aria-hidden="true" />
            {t('contact.emailUs')}
          </a>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
