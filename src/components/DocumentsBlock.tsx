import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/i18n/locales';
import type { ContentEntry } from '@/content';
import SectionHeader from '@/components/SectionHeader';
import DocumentCard from '@/components/DocumentCard';
import Reveal from '@/hooks/use-reveal';

interface DocumentsBlockProps {
  documents: ContentEntry[];
  label?: string;
  title?: string;
  surface?: boolean;
  id?: string;
}

/** Up to three document cards and a link to the library. Nothing when no document is published. */
const DocumentsBlock: React.FC<DocumentsBlockProps> = ({ documents, label, title, surface = false, id = 'documents' }) => {
  const { t, language } = useLanguage();
  const list = documents.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section id={id} className={`py-24 relative ${surface ? 'bg-surface' : ''}`}>
      <div className="absolute top-0 left-0 right-0 line-rule" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader
            label={label ?? t('home.documents.label')}
            title={title ?? t('home.documents.title')}
            className=""
          />
          <Link
            to={localizePath('/documents/', language)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary underline-offset-4 hover:underline transition-colors shrink-0"
          >
            {t('home.documents.all')}
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {list.map((entry, i) => (
            <Reveal key={entry.slug} delay={i * 120}>
              <DocumentCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentsBlock;
