import { canon, formatPrice, officeLine } from '../data/canon';
import { allTranslations } from '../i18n/all-strings';
import { canonVars } from '../i18n/canon-vars';
import { LANGUAGES, absoluteUrl, localizePath } from '../i18n/locales';
import { interpolate, type Language } from '../i18n/translations';
import { SERVICES, serviceFaq } from '../components/service/services';
import type { CommodityContent, ContentEntry } from '../content/types';

/**
 * llms.txt and llms-full.txt at the site root, for AI assistants: who we are, the pages that
 * matter, and (in the full file) the service texts, prices "from", turnarounds and questions.
 * English first, then Russian and Chinese. Built from the canon, the interface strings and the
 * content; no phone numbers and no hidden pages.
 */

export interface LlmsInput {
  commodities: Record<string, Record<Language, CommodityContent>>;
  documents: ContentEntry[];
}

const HEADINGS: Record<Language, Record<'services' | 'commodities' | 'documents' | 'about' | 'contact' | 'faq' | 'fees' | 'when' | 'how' | 'spec', string>> = {
  en: { services: 'Services', commodities: 'Commodities', documents: 'Documents', about: 'About', contact: 'Contact', faq: 'Questions', fees: 'Fees', when: 'When clients call us', how: 'How it runs', spec: 'Typical specification' },
  ru: { services: 'Услуги', commodities: 'Товары', documents: 'Документы', about: 'О компании', contact: 'Контакты', faq: 'Вопросы', fees: 'Стоимость', when: 'Когда к нам обращаются', how: 'Как идёт работа', spec: 'Типовая спецификация' },
  zh: { services: '服务', commodities: '商品', documents: '文件', about: '关于我们', contact: '联系方式', faq: '常见问题', fees: '费用', when: '客户何时找我们', how: '工作如何推进', spec: '典型规格' },
};

const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', ru: 'Русский', zh: '中文' };

const translator = (language: Language) => (key: string, vars: Record<string, string> = {}) =>
  interpolate(allTranslations[language][key] ?? key, { ...canonVars(language), ...vars });

const url = (path: string, language: Language) => absoluteUrl(localizePath(path, language));
const plain = (text: string) => text.replace(/\u00a0/g, ' ');

/** The opening paragraph, in English, naming the company in full. */
const summary = () => {
  const offices = canon.offices.map((office) => officeLine(office, 'en')).join(' and ');
  return (
    `${canon.brand} (${canon.legal.name}, ${canon.legal.address.region}, ${canon.legal.address.country}) is an independent advisory firm ` +
    'for cross-border commodity deals: offer checks, deal structuring, compliance and KYC, and Fractional COO work. ' +
    `Offices: ${offices}. Practice since ${canon.practiceSince}. ` +
    `Not to be confused with KPS (Kerjasama Pemerintah dan Swasta), Indonesia's public-private partnership scheme.`
  );
};

const pageLinks = (language: Language, input: LlmsInput): string[] => {
  const t = translator(language);
  const h = HEADINGS[language];
  const lines: string[] = [];
  lines.push(`## ${h.services}`, '');
  lines.push(`- [${t('nav.services')}](${url('/services/', language)}): ${t('services.hub.lead')}`);
  for (const service of SERVICES) {
    lines.push(`- [${t(`${service.menuKey}.title`)}](${url(`/services/${service.slug}/`, language)}): ${t(`${service.menuKey}.desc`)}`);
  }
  lines.push('', `## ${h.commodities}`, '');
  lines.push(`- [${t('nav.commodities')}](${url('/commodities/', language)}): ${t('commodities.hero.lead')}`);
  for (const commodity of canon.commodities) {
    const page = input.commodities[commodity.id]?.[language];
    lines.push(`- [${commodity.name[language]}](${url(`/commodities/${commodity.id}/`, language)}): ${page?.grade ?? page?.summary ?? ''}`);
  }
  lines.push('', `## ${h.documents}`, '');
  lines.push(`- [${t('nav.documents')}](${url('/documents/', language)}): ${t('documents.lead')}`);
  for (const entry of input.documents) {
    const version = entry.versions[language] ?? entry.versions.en!;
    lines.push(`- [${version.title}](${absoluteUrl(`/documents/${entry.slug}/`)}): ${version.description}`);
  }
  lines.push('', `## ${h.about}`, '');
  const offices = canon.offices.map((office) => officeLine(office, language)).join(t('about.and'));
  lines.push(`- [${t('nav.about')}](${url('/about/', language)}): ${t('about.hero.lead', { offices, since: canon.practiceSince })}`);
  lines.push('', `## ${h.contact}`, '');
  lines.push(`- [${t('contact.page.title')}](${url('/contact/', language)}): ${t('contact.page.lead')}`);
  return lines.map(plain);
};

export function buildLlms(input: LlmsInput): string {
  const lines = [`# ${canon.brand}`, '', `> ${summary()}`, ''];
  lines.push(...pageLinks('en', input), '');
  for (const language of LANGUAGES.filter((l) => l !== 'en')) {
    lines.push(`## ${LANGUAGE_NAMES[language]}`, '');
    lines.push(
      ...pageLinks(language, input)
        .filter((line) => line.startsWith('- '))
        .map((line) => line),
      '',
    );
  }
  lines.push('## Optional', '', `- [Full text](${absoluteUrl('/llms-full.txt')}): services, prices from, turnarounds and questions in English, Russian and Chinese`, '');
  return lines.join('\n');
}

const contactLines = (language: Language) => {
  const t = translator(language);
  const { contacts } = canon;
  return [
    `- ${t('contact.email')}: ${contacts.email}`,
    ...(contacts.whatsapp ? [`- WhatsApp: ${contacts.whatsapp.url}`] : []),
    ...(contacts.telegram ? [`- Telegram: ${contacts.telegram.url}`] : []),
    ...(contacts.wechat ? [`- WeChat: ${contacts.wechat.id}`] : []),
    `- LinkedIn: ${contacts.linkedinCompany}`,
    `- ${t('contact.page.title')}: ${url('/contact/', language)}`,
  ];
};

const fullSection = (language: Language, input: LlmsInput): string[] => {
  const t = translator(language);
  const h = HEADINGS[language];
  const lines: string[] = [`## ${LANGUAGE_NAMES[language]}`, ''];
  const offices = canon.offices.map((office) => officeLine(office, language)).join(t('about.and'));
  lines.push(`${t('about.hero.title')} ${t('about.hero.lead', { offices, since: canon.practiceSince })}`, '');
  for (const n of [1, 2, 3, 4]) lines.push(`- ${t(`about.principle${n}.title`)} ${t(`about.principle${n}.desc`)}`);
  lines.push('');

  for (const service of SERVICES) {
    const k = (key: string) => t(`svc.${service.key}.${key}`);
    lines.push(`### ${t(`${service.menuKey}.title`)}`, '', url(`/services/${service.slug}/`, language), '', k('lead'), '');
    lines.push(`${h.when}:`, ...Array.from({ length: service.when }, (_, i) => `- ${k(`when${i + 1}`)}`), '');
    lines.push(`${h.how}:`, ...service.steps.map((step) => `- ${k(`${step}.title`)}: ${k(`${step}.desc`)}`), '');
    lines.push(`${h.fees}:`);
    for (const row of service.fees) {
      const price = row.price ? canon.products[row.price].priceFrom : null;
      const fee = price ? t('svc.fee.from', { price: formatPrice(price, language) }) : t('cta.proposal');
      lines.push(`- ${t(`${row.key}.name`)}: ${t(`${row.key}.desc`)} ${t(row.time)}; ${fee}.`);
    }
    lines.push('', `${h.faq}:`);
    for (const item of serviceFaq(service, (key) => t(key))) lines.push(`- ${item.question} ${item.answer}`);
    lines.push('');
  }

  lines.push(`### ${h.commodities}`, '');
  for (const commodity of canon.commodities) {
    const page = input.commodities[commodity.id]?.[language];
    if (!page) continue;
    lines.push(`#### ${commodity.name[language]}`, '', url(`/commodities/${commodity.id}/`, language), '');
    lines.push(page.summary, page.breaks, '');
    if (page.grade) lines.push(`${h.spec}: ${page.grade}`);
    for (const row of page.spec ?? []) lines.push(`- ${[row.parameter, row.limit, row.standard].filter(Boolean).join(': ')}`);
    lines.push('');
  }

  lines.push(`### ${h.documents}`, '', t('documents.lead'), '');
  for (const entry of input.documents) {
    const version = entry.versions[language] ?? entry.versions.en!;
    lines.push(`- [${version.title}](${absoluteUrl(`/documents/${entry.slug}/`)}): ${version.description}`);
  }
  lines.push('', `### ${h.contact}`, '', ...contactLines(language), '');
  lines.push(`${canon.legal.name} · NIB ${canon.legal.nib} · KBLI ${canon.legal.kbli.code}`, '');
  return lines.map(plain);
};

export function buildLlmsFull(input: LlmsInput): string {
  const lines = [`# ${canon.brand}`, '', `> ${summary()}`, ''];
  for (const language of LANGUAGES) lines.push(...fullSection(language, input));
  return lines.join('\n');
}
