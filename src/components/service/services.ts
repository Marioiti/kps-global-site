/** The three service pages: which texts, steps, fees and questions each one shows (texts: svc.<key>.*). */
export type ServiceSlug = 'deal-structuring' | 'compliance-kyc' | 'fractional-coo';

/** A row of the fees table: the work, its time and a price from the canon, or a proposal link. */
export interface FeeRow {
  key: string;
  time: string;
  price?: 'offerCheck' | 'dealHealthCheck' | 'kycCheck';
}

export interface ServiceConfig {
  slug: ServiceSlug;
  /** Text prefix: svc.deal.*, svc.kyc.*, svc.coo.* */
  key: 'deal' | 'kyc' | 'coo';
  /** Menu entry with the service name and one-line caption. */
  menuKey: 'menu.deals' | 'menu.coo' | 'menu.kyc';
  /** The page sign: 合同 contract, 合规 compliance, 合作 cooperation. */
  glyph: string;
  seoKey: string;
  /** Page title for search and previews; localised even where the service name is not. */
  seoTitleKey: string;
  serviceType: string;
  /** Show "Send us the offer" next to the proposal: the services that start with a check. */
  offerAction: boolean;
  when: number;
  steps: string[];
  fees: FeeRow[];
  /** Line under the fees table. */
  feesNote: string;
  finalKey: string;
  faq: number;
}

export const SERVICES: ServiceConfig[] = [
  {
    slug: 'deal-structuring',
    key: 'deal',
    menuKey: 'menu.deals',
    glyph: '合同',
    seoKey: 'seo.dealStructuring.description',
    seoTitleKey: 'menu.deals.title',
    serviceType: 'Commodity deal structuring',
    offerAction: true,
    when: 4,
    steps: ['step1', 'step2', 'step3', 'step4'],
    fees: [
      { key: 'svc.fee.offer', time: 'svc.fee.offerTime', price: 'offerCheck' },
      { key: 'svc.fee.health', time: 'svc.fee.healthTime', price: 'dealHealthCheck' },
      { key: 'svc.fee.structuring', time: 'svc.fee.perDeal' },
    ],
    feesNote: 'svc.fees.note',
    finalKey: 'svc.final.deal',
    faq: 6,
  },
  {
    slug: 'compliance-kyc',
    key: 'kyc',
    menuKey: 'menu.kyc',
    glyph: '合规',
    seoKey: 'seo.complianceKyc.description',
    seoTitleKey: 'menu.kyc.title',
    serviceType: 'Compliance, KYC and sanctions screening',
    offerAction: true,
    when: 5,
    steps: ['step1', 'step2', 'step3', 'step4'],
    fees: [
      { key: 'svc.fee.kyc', time: 'svc.fee.kycTime', price: 'kycCheck' },
      { key: 'svc.fee.kycWider', time: 'svc.fee.perScope' },
    ],
    feesNote: 'svc.fees.note',
    finalKey: 'svc.final.deal',
    faq: 5,
  },
  {
    slug: 'fractional-coo',
    key: 'coo',
    menuKey: 'menu.coo',
    glyph: '合作',
    seoKey: 'seo.fractionalCoo.description',
    seoTitleKey: 'hero.lineB.title',
    serviceType: 'Fractional COO and project management',
    offerAction: false,
    when: 4,
    steps: ['step1', 'step2', 'step3', 'step4'],
    fees: [{ key: 'svc.fee.coo', time: 'svc.fee.cooTime' }],
    feesNote: 'svc.fees.invoice',
    finalKey: 'svc.final.project',
    faq: 6,
  },
];

export const serviceBySlug = (slug: ServiceSlug): ServiceConfig => SERVICES.find((s) => s.slug === slug)!;

export const serviceFaq = (config: ServiceConfig, t: (key: string) => string) =>
  Array.from({ length: config.faq }, (_, i) => ({
    question: t(`svc.${config.key}.q${i + 1}`),
    answer: t(`svc.${config.key}.a${i + 1}`),
  }));
