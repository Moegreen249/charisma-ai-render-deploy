'use client';

import { useEffect, useRef } from 'react';
import { useThemeStore, initializeTheme, setupThemeSync, restoreTheme } from '@/lib/theme-customization';

export function ThemeInitializer() {
  const { setCurrentTheme, currentTheme } = useThemeStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    // Restore theme from localStorage if available
    const restoredTheme = restoreTheme();
    if (restoredTheme && restoredTheme.id !== currentTheme.id) {
      setCurrentTheme(restoredTheme);
    } else {
      // Initialize with current theme
      initializeTheme();
    }

    // Setup cross-tab theme synchronization
    setupThemeSync();

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      console.log('Theme changed:', event.detail.theme.name);
    };

    window.addEventListener('theme-changed', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener);
    };
  }, []); // Remove dependencies that cause re-runs

  return null; // This component doesn't render anything
}