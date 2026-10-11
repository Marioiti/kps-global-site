import { execFileSync } from 'node:child_process';

/**
 * The date (YYYY-MM-DD) of the last commit that touched any of `paths`, for sitemap lastmod.
 * Without git history (or for files not committed yet) the build date stands in.
 */
export function makeLastmod(rootDir: string, today = new Date().toISOString().slice(0, 10)) {
  const cache = new Map<string, string>();
  return (paths: string[]): string => {
    const key = paths.join('|');
    const cached = cache.get(key);
    if (cached) return cached;
    let date = '';
    try {
      date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { cwd: rootDir, encoding: 'utf8' }).trim();
    } catch {
      // Not a git checkout: use the build date.
    }
    const result = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;
    cache.set(key, result);
    return result;
  };
}

/** Source files behind each fixed page; their texts live in the interface strings. */
export const PAGE_SOURCES: Record<string, string[]> = {
  '/': ['src/pages/Index.tsx', 'src/i18n/strings', 'content/cases'],
  '/services/': ['src/pages/Services.tsx', 'src/components/service', 'src/i18n/strings'],
  '/services/deal-structuring/': ['src/components/service', 'src/i18n/strings', 'content/cases'],
  '/services/fractional-coo/': ['src/components/service', 'src/i18n/strings'],
  '/services/compliance-kyc/': ['src/components/service', 'src/i18n/strings', 'content/cases'],
  '/commodities/': ['src/pages/Commodities.tsx', 'content/commodities'],
  '/about/': ['src/pages/About.tsx', 'src/i18n/strings', 'content/cases'],
  '/contact/': ['src/pages/Contact.tsx', 'src/components/ContactForm.tsx', 'src/i18n/strings'],
  '/privacy/': ['src/pages/PrivacyPolicy.tsx', 'src/i18n/strings'],
};

/** List pages of the collections. */
export const LIST_SOURCES: Record<string, string[]> = {
  '/insights/': ['src/pages/Insights.tsx', 'content/insights'],
  '/news/': ['src/pages/News.tsx', 'content/news'],
  '/procedures/': ['src/pages/Procedures.tsx', 'content/procedures'],
  '/mandates/': ['src/pages/Mandates.tsx', 'content/mandates'],
  '/documents/': ['src/pages/Documents.tsx', 'content/documents'],
};
