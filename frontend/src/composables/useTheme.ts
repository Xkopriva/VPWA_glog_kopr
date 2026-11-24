import { Dark } from 'quasar';

// storage key for selected theme, kept after page refresh
const THEME_KEY = 'flack_dark_mode';

// saves current theme to local storage
function saveTheme() {
  try { localStorage.setItem(THEME_KEY, Dark.isActive ? '1' : '0'); } catch { /* ignores storage error */ }
}

/**
 * Restores saved theme after page refresh (call once on app start)
 */
export function restoreTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) Dark.set(saved === '1');
  } catch { /* ignores storage error */ }
}

export function useTheme() {
  /**
   * Toggle between light and dark mode
   */
  function toggleDarkMode() {
    Dark.toggle();
    saveTheme();
  }

  /**
   * Force dark mode state (true = dark, false = light)
   */
  function setDarkMode(status: boolean) {
    Dark.set(status);
    saveTheme();
  }

  return {
    isDark: Dark,
    toggleDarkMode,
    setDarkMode
  };
}
