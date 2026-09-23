import { Dark } from 'quasar';

export function useTheme() {
  /**
   * Toggle between light and dark mode
   */
  function toggleDarkMode() {
    Dark.toggle();
  }

  /**
   * Force dark mode state (true = dark, false = light)
   */
  function setDarkMode(status: boolean) {
    Dark.set(status);
  }

  return {
    isDark: Dark,
    toggleDarkMode,
    setDarkMode
  };
}