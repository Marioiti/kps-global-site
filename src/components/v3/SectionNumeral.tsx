import React from 'react';

/** Financial numerals, as Chinese contracts write them so nobody can change them later. */
export const NUMERALS = ['壹', '贰', '叁', '肆', '伍', '陆'] as const;

interface SectionNumeralProps {
  /** 1 to 6. */
  n: number;
  /** An optional line under the numeral. */
  note?: string;
}

/** The section number in the left column; decorative, the heading carries the meaning. */
const SectionNumeral: React.FC<SectionNumeralProps> = ({ n, note }) => (
  <div>
    <span className="font-seal font-semibold text-[44px] md:text-[54px] leading-none text-accent block" aria-hidden="true">
      {NUMERALS[n - 1]}
    </span>
    {note && <p className="mt-4 text-sm leading-[1.55] text-muted-foreground">{note}</p>}
  </div>
);

export default SectionNumeral;
