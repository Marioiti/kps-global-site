import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveals its children with a soft fade/rise when they scroll into view.
 *
 * The prerendered HTML shows the content as is: nothing is hidden until the page
 * has hydrated. After that only blocks below the visible area are hidden, and they
 * appear slightly before they reach it. Without IntersectionObserver or with
 * `prefers-reduced-motion` the content simply stays visible.
 */
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay in ms, useful for staggering siblings. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/** static: shown as rendered; hidden: waiting below the fold; shown: faded in. */
type RevealState = 'static' | 'hidden' | 'shown';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0, as = 'div' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>('static');

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    // Already on screen (or about to be): leave it as rendered, no flicker.
    if (el.getBoundingClientRect().top < window.innerHeight * 1.1) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px 10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  const motion =
    state === 'static'
      ? ''
      : `transition-all duration-700 ease-out will-change-[opacity,transform] ${
          state === 'shown' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`;

  return (
    <Tag
      ref={ref}
      style={state === 'shown' && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${motion} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
