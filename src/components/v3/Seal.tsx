import React from 'react';

const SIZES = {
  36: 'w-9 h-9 text-[23px] rounded-[3px]',
  160: 'w-40 h-40 text-[118px] rounded-[5px]',
  220: 'w-[220px] h-[220px] text-[162px] rounded-[5px]',
  300: 'w-[300px] h-[300px] text-[220px] rounded-[6px]',
} as const;

interface SealProps {
  size: keyof typeof SIZES;
  /** Text for screen readers; without it the seal is decorative. */
  label?: string;
  className?: string;
}

/** The KPS seal: 合 on a vermilion square. 36 in the header, 160 to 300 as a page mark. */
const Seal: React.FC<SealProps> = ({ size, label, className = '' }) => (
  <span
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    className={`font-seal font-black leading-none inline-flex shrink-0 items-center justify-center bg-accent text-accent-foreground select-none ${SIZES[size]} ${className}`}
  >
    合
  </span>
);

export default Seal;
