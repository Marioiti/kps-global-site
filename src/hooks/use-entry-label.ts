import { useLanguage } from '@/contexts/LanguageContext';
import type { ContentEntry } from '@/content';

/** Label above a title: the line of an insight, the kind of a news item, the audience of a procedure. */
export const useEntryLabel = () => {
  const { t } = useLanguage();
  return (entry: ContentEntry) => {
    if (entry.line) return t(`line.${entry.line}`);
    if (entry.kind) return t(`news.kind.${entry.kind}`);
    if (entry.audience?.length) return entry.audience.map((a) => t(`procedures.audience.${a}`)).join(' · ');
    return '';
  };
};
