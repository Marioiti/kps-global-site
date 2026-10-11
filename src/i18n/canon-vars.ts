import { canon, formatPrice } from '../data/canon';
import type { Language, TranslationVars } from './translations';

/** Values every interface string can use: brand, legal name, email, and the terms and prices of the checks. */
export const canonVars = (language: Language): TranslationVars => ({
  brand: canon.brand,
  legalName: canon.legal.name,
  email: canon.contacts.email,
  // The only prices on the site, with their terms (see canon.products).
  offerPrice: formatPrice(canon.products.offerCheck.priceFrom, language),
  offerHours: canon.products.offerCheck.turnaroundHours,
  healthPrice: formatPrice(canon.products.dealHealthCheck.priceFrom, language),
  healthDays: canon.products.dealHealthCheck.turnaroundBusinessDays,
  creditDays: canon.products.dealHealthCheck.creditDays,
  kycDays: canon.products.kycCheck.turnaroundBusinessDays,
  kycPrice: canon.products.kycCheck.priceFrom ? formatPrice(canon.products.kycCheck.priceFrom, language) : '',
  cooMinMonths: canon.products.fractionalCoo.minMonths,
  cooDays: canon.products.fractionalCoo.daysPerWeek,
  cooNotice: canon.products.fractionalCoo.noticeDays,
});
