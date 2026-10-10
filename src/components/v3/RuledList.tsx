import React from 'react';

interface RuledListProps {
  items: { key: string; content: React.ReactNode }[];
  /** Ink rules for the main list of a section, soft rules otherwise. */
  strong?: boolean;
  className?: string;
}

/** Rows separated by hairlines, top and bottom closed: the list form of design v3. */
const RuledList: React.FC<RuledListProps> = ({ items, strong = false, className = '' }) => (
  <ul className={`border-b ${strong ? 'border-foreground' : 'border-border'} ${className}`}>
    {items.map((item) => (
      <li key={item.key} className={`border-t ${strong ? 'border-foreground' : 'border-border'}`}>
        {item.content}
      </li>
    ))}
  </ul>
);

export default RuledList;
