import React, { useEffect, useState } from 'react';
import { Globe, Linkedin, Mail, Send } from 'lucide-react';
import { codes } from 'virtual:card-qr';
import SEO from '@/components/SEO';
import Seal from '@/components/v3/Seal';
import WechatCopy from '@/components/WechatCopy';
import WechatIcon from '@/components/icons/WechatIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { canon } from '@/data/canon';

type Code = (typeof codes)[keyof typeof codes];

/** A QR code drawn from its build-time path: ink modules on white paper, with a quiet zone, in both themes. */
const Qr: React.FC<{ code: Code; label: string; className?: string }> = ({ code, label, className = '' }) => (
  <svg
    viewBox={`-4 -4 ${code.size + 8} ${code.size + 8}`}
    role="img"
    aria-label={label}
    shapeRendering="crispEdges"
    className={`block w-full h-auto ${className}`}
  >
    <rect x={-4} y={-4} width={code.size + 8} height={code.size + 8} fill="#FFFFFF" />
    <path d={code.d} fill="#121A2B" />
  </svg>
);

const rowClass = 'flex min-h-[52px] items-center gap-3 py-2.5 border-t border-border print:min-h-0 print:py-1 print:gap-2';

/** One A6 sheet (105 × 148 mm), always in the light colours, whatever theme is on screen. */
const PRINT_CSS =
  '@page { size: 105mm 148mm; margin: 7mm; } ' +
  '@media print { :root, html.dark { color-scheme: light; --background: 0 0% 100%; --foreground: 221 41% 12%; ' +
  '--body: 221 22.1% 22.2%; --muted-foreground: 221 10.9% 39.6%; --border: 40 19.1% 81.6%; ' +
  '--accent: 3 71.3% 41%; --accent-foreground: 0 0% 100%; } }';

/**
 * /card/: Andrei's contact card. English only, not indexed and linked from nowhere on the site.
 * Rows for every channel, a vCard, QR codes made at build time, and a one-page A6 print.
 */
const Card: React.FC = () => {
  const { t } = useLanguage();
  const founder = canon.founder!;
  const { contacts } = canon;
  const role = founder.role.en.split(',')[0];
  const place = [canon.offices[0].region?.en ?? canon.offices[0].city.en, canon.offices[1]?.city.en].filter(Boolean).join(' · ');
  const photo = founder.photo;
  const [shared, setShared] = useState('');

  const share = async () => {
    const data = { title: `${founder.name.en}, ${canon.brand}`, url: codes.card.url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(codes.card.url);
      setShared(t('card.copied'));
    } catch {
      // The person closed the share sheet, or the clipboard is not available.
    }
  };

  const rows: { key: string; icon: React.ReactNode; label: string; content: React.ReactNode }[] = [
    {
      key: 'whatsapp',
      icon: <WhatsappIcon size={20} />,
      label: 'WhatsApp',
      content: (
        <a href={contacts.whatsappBusiness} target="_blank" rel="noopener noreferrer" className="link-v3">
          {t('contact.openChat')}
          <span className="sr-only"> WhatsApp</span>
        </a>
      ),
    },
    ...(contacts.telegram
      ? [
          {
            key: 'telegram',
            icon: <Send size={20} aria-hidden="true" />,
            label: 'Telegram',
            content: (
              <a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer" className="link-v3">
                {contacts.telegram.handle}
              </a>
            ),
          },
        ]
      : []),
    ...(contacts.wechat
      ? [{ key: 'wechat', icon: <WechatIcon size={20} />, label: t('contact.wechat'), content: <WechatCopy id={contacts.wechat.id} /> }]
      : []),
    {
      key: 'email',
      icon: <Mail size={20} aria-hidden="true" />,
      label: t('contact.email'),
      content: (
        <a href={`mailto:${contacts.email}`} className="link-v3">
          {contacts.email}
        </a>
      ),
    },
    {
      key: 'linkedin',
      icon: <Linkedin size={20} aria-hidden="true" />,
      label: 'LinkedIn',
      content: (
        <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="link-v3">
          {founder.linkedin.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      ),
    },
    {
      key: 'linkedin-company',
      icon: <Linkedin size={20} aria-hidden="true" />,
      label: t('card.linkedinCompany'),
      content: (
        <a href={contacts.linkedinCompany} target="_blank" rel="noopener noreferrer" className="link-v3">
          {contacts.linkedinCompany.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      ),
    },
    {
      key: 'website',
      icon: <Globe size={20} aria-hidden="true" />,
      label: t('card.website'),
      content: (
        <a href="https://kpsglobal.id/" className="link-v3">
          kpsglobal.id
        </a>
      ),
    },
  ];

  const qrs = [
    { key: 'whatsapp', code: codes.whatsapp, caption: 'WhatsApp' },
    { key: 'telegram', code: codes.telegram, caption: 'Telegram' },
    { key: 'wechat', code: codes.wechat, caption: t('contact.wechat') },
    { key: 'card', code: codes.card, caption: t('card.thisCard') },
  ] as const;
  type QrKey = (typeof qrs)[number]['key'];
  // Before scripts run every code is shown, one under another; then one large code and a switch.
  const [selected, setSelected] = useState<QrKey | null>(null);
  useEffect(() => setSelected('whatsapp'), []);
  const shown = selected ? qrs.filter((qr) => qr.key === selected) : qrs;

  return (
    <main className="card-print min-h-screen bg-background px-4 py-8 md:py-14 print:min-h-0 print:p-0 print:bg-white print:text-[#121A2B]">
      <SEO title={t('card.title', { name: founder.name.en })} description={t('card.description', { name: founder.name.en })} noindex nofollow />
      {/* Only this page prints on one A6 sheet (105 × 148 mm): data and QR codes, no buttons (print:hidden). */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <article className="mx-auto w-full max-w-[440px] print:max-w-none">
        <header className="flex flex-col items-center text-center">
          <Seal size={64} label={t('seal.label')} className="print:w-8 print:h-8 print:text-[21px]" />
          {photo && (
            <picture className="mt-6 print:hidden">
              <source type="image/avif" srcSet={photo.replace(/\.jpg$/, '-600.avif')} />
              <source type="image/webp" srcSet={photo.replace(/\.jpg$/, '-600.webp')} />
              <img
                src={photo.replace(/\.jpg$/, '-600.jpg')}
                alt={t('founder.photoAlt', { name: founder.name.en })}
                width={128}
                height={128}
                className="w-32 h-32 object-cover border border-border print:w-20 print:h-20"
              />
            </picture>
          )}
          <h1 className="mt-5 font-display text-[32px] leading-tight text-foreground print:mt-1.5 print:text-[18px]">{founder.name.en}</h1>
          <p className="text-body print:text-[10px]">{role}</p>
          <p className="font-display text-lg text-foreground print:text-[11px]">{canon.brand}</p>
          <p className="text-sm text-muted-foreground print:text-[9px]">{place}</p>
        </header>

        <ul className="mt-8 border-b border-border print:mt-2 print:text-[10px] print:leading-tight">
          {rows.map((row) => (
            <li key={row.key} className={rowClass}>
              <span className="text-muted-foreground shrink-0 print:hidden" aria-hidden="true">
                {row.icon}
              </span>
              <span className="w-24 shrink-0 text-sm text-muted-foreground print:w-16 print:text-[9px]">{row.label}</span>
              <span className="min-w-0 break-words text-foreground">{row.content}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
          <a href="/card/andrei-orlov.vcf" download="andrei-orlov.vcf" className="btn-accent">
            {t('card.save')}
          </a>
          <button type="button" onClick={share} className="btn-outline">
            {t('card.share')}
          </button>
        </div>
        <p aria-live="polite" className="mt-2 min-h-[1.5em] text-center text-sm text-muted-foreground print:hidden">
          {shared}
        </p>

        <section aria-label={t('card.qrTitle')} className="mt-6 print:hidden">
          {selected && (
            <div role="group" aria-label={t('card.qrTitle')} className="grid grid-cols-4 border border-border mb-5">
              {qrs.map((qr) => (
                <button
                  key={qr.key}
                  type="button"
                  aria-pressed={selected === qr.key}
                  onClick={() => setSelected(qr.key)}
                  className={`min-h-[44px] px-1 text-sm transition-colors ${
                    selected === qr.key ? 'bg-foreground text-background' : 'text-foreground hover:bg-surface'
                  }`}
                >
                  {qr.caption}
                </button>
              ))}
            </div>
          )}
          <ul className="space-y-6">
            {shown.map((qr) => (
              <li key={qr.key} className="text-center">
                <a href={qr.code.url} target="_blank" rel="noopener noreferrer" className="block mx-auto w-full max-w-[240px] border border-border p-2 bg-white">
                  <Qr code={qr.code} label={t('card.qrLabel', { channel: qr.caption })} />
                </a>
                <p className="mt-2 text-sm text-body">{qr.key === 'card' ? t('card.pageQr') : qr.caption}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* On paper: the three channel codes side by side. */}
        <ul className="hidden print:grid print:grid-cols-3 print:gap-2 print:mt-2">
          {qrs
            .filter((qr) => qr.key !== 'card')
            .map((qr) => (
              <li key={qr.key} className="text-center">
                <div className="mx-auto max-w-[26mm] bg-white">
                  <Qr code={qr.code} label={t('card.qrLabel', { channel: qr.caption })} />
                </div>
                <p className="mt-0.5 text-[9px] text-body">{qr.caption}</p>
              </li>
            ))}
        </ul>
      </article>
    </main>
  );
};

export default Card;
