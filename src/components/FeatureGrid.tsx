import React from 'react';
import Reveal from '@/hooks/use-reveal';

interface FeatureGridProps {
  items: { title: string; desc: string }[];
  /** Two columns for 4 items, three for 3 or 6. */
  columns?: 2 | 3;
}

/** Numbered cards in the style of the engagement-model grid. */
const FeatureGrid: React.FC<FeatureGridProps> = ({ items, columns = 2 }) => (
  <div
    className={`grid md:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-px bg-border/30 overflow-hidden rounded-sm`}
  >
    {items.map((item, i) => (
      <Reveal
        key={item.title}
        delay={(i % columns) * 100}
        className="bg-background p-8 md:p-10 group hover:bg-secondary/20 transition-colors duration-500 relative"
      >
        <span className="text-5xl font-serif text-accent/70 group-hover:text-accent transition-colors duration-500 absolute top-6 right-8">
          {String(i + 1).padStart(2, '0')}
        </span>
        <div className="relative z-10 mt-12">
          <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
        </div>
      </Reveal>
    ))}
  </div>
);

export default FeatureGrid;
