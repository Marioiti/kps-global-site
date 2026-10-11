import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/** The WeChat ID as text with a button that copies it; WeChat has no web link to open a chat. */
const WechatCopy: React.FC<{ id: string; anchor?: string }> = ({ id, anchor }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Without clipboard access the ID stays on the page to copy by hand.
    }
  };
  return (
    <span id={anchor} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 scroll-mt-28">
      <span className="select-all">{id}</span>
      <button
        type="button"
        onClick={copy}
        className="min-h-[36px] px-2.5 py-1 text-sm border border-border text-foreground hover:border-foreground transition-colors print:hidden"
      >
        {t('contact.copy')}
        <span className="sr-only"> {t('contact.wechat')} {id}</span>
      </button>
      <span aria-live="polite" className="text-sm text-muted-foreground print:hidden">
        {copied ? t('contact.copied') : ''}
      </span>
    </span>
  );
};

export default WechatCopy;
