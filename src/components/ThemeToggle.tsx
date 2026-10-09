import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LONG_PRESS_MS = 600;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Header button: a click switches between light and dark; a long press or a right
 * click returns to the system theme (the default). Both icons are in the markup and
 * CSS shows the right one, so the prerendered page matches before scripts run.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = !mounted ? t('theme.toggle') : isDark ? t('theme.toLight') : t('theme.toDark');

  const startPress = () => {
    longPressed.current = false;
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      setTheme('system');
    }, LONG_PRESS_MS);
  };
  const endPress = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={`${label}. ${t('theme.systemHint')}`}
      data-theme-choice={mounted ? theme : undefined}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onContextMenu={(event) => {
        event.preventDefault();
        endPress();
        setTheme('system');
      }}
      onClick={() => {
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors ${focusRing} ${className}`}
    >
      <Moon size={16} className="dark:hidden" aria-hidden="true" />
      <Sun size={16} className="hidden dark:block" aria-hidden="true" />
    </button>
  );
};

/** Mobile menu: light, dark or the system theme, as three buttons. */
export const ThemeChoice: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme ?? 'system' : 'system';

  const options = [
    { value: 'light', label: t('theme.light'), Icon: Sun },
    { value: 'dark', label: t('theme.dark'), Icon: Moon },
    { value: 'system', label: t('theme.system'), Icon: Monitor },
  ];

  return (
    <div role="group" aria-label={t('theme.label')} className={`grid grid-cols-3 border border-border rounded-sm w-full max-w-xs ${className}`}>
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={current === value}
          onClick={() => setTheme(value)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs leading-tight text-center tracking-wide transition-colors ${focusRing} ${
            current === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon size={14} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
