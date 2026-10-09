/** Browser bar colour per theme; index.html sets the same values before the first paint. */
export const THEME_COLORS = { light: '#16233F', dark: '#0E1626' } as const;

/** Points every theme-color meta at the shown theme, so the bar follows the switch, not only the system. */
export function applyThemeColor(theme: keyof typeof THEME_COLORS): void {
  if (typeof document === 'undefined') return;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
}
