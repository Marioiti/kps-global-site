import React from 'react';

interface StampProps {
  /** stop: 止 in outline, the deal was stopped; join: 合 filled, the parties were joined. */
  kind: 'stop' | 'join';
  /** Accessible name, e.g. "Stopped". */
  label: string;
  /** A small word under the character, as on the sample verdict. */
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Tilt in degrees, from -8 to 5. */
  rotate?: number;
  className?: string;
}

const SIZES = {
  sm: 'w-14 h-14 text-[26px] md:w-16 md:h-16 md:text-[30px]',
  md: 'w-[72px] h-[72px] text-[36px]',
  lg: 'w-24 h-24 text-[46px]',
};

/** A rubber stamp: 止 for a stopped deal, 合 for a joined one. */
const Stamp: React.FC<StampProps> = ({ kind, label, caption, size = 'sm', rotate = 0, className = '' }) => (
  <span
    role="img"
    aria-label={label}
    style={{ transform: `rotate(${rotate}deg)` }}
    className={`inline-flex flex-col shrink-0 items-center justify-center rounded-[3px] font-seal font-black leading-none select-none ${SIZES[size]} ${
      kind === 'stop' ? 'border-2 border-accent text-accent' : 'bg-accent text-accent-foreground'
    } ${caption ? 'border-[3px]' : ''} ${className}`}
  >
    <span aria-hidden="true">{kind === 'stop' ? '止' : '合'}</span>
    {caption && (
      <span aria-hidden="true" className="mt-1 font-sans font-normal text-[10px] tracking-[0.08em]">
        {caption}
      </span>
    )}
  </span>
);

export default Stamp;
