/* Shared light/dark theme helpers for the dashboard and auth screens.
   The device's color scheme is the default; a manual toggle in the
   dashboard saves an override that then wins on every surface. */
export const THEME_KEY = 'betament-dash-theme';

export const systemTheme = () =>
  (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches)
    ? 'light'
    : 'dark';

export const getPreferredTheme = () => localStorage.getItem(THEME_KEY) || systemTheme();

/* Re-run cb when the device scheme changes, but only while the user hasn't
   picked a theme manually. Returns an unsubscribe function. */
export function watchSystemTheme(cb) {
  const mq = window.matchMedia?.('(prefers-color-scheme: light)');
  if (!mq) return () => {};
  const onChange = () => { if (!localStorage.getItem(THEME_KEY)) cb(systemTheme()); };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
