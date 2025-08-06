'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore, applyThemeToDOM } from '@/lib/theme-customization';
import { themeConfig } from '@/lib/theme-config';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  colors: any;
  gradients: any;
  spacing: any;
  typography: any;
  effects: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({ children, defaultTheme = 'charisma-dark' }: ThemeProviderProps) {
  const { currentTheme, setCurrentTheme } = useThemeStore();
  const [theme, setTheme] = useState(defaultTheme);

  // Apply theme when it changes
  useEffect(() => {
    if (currentTheme) {
      // Apply custom theme from store
      applyThemeToDOM(currentTheme);
      setTheme(currentTheme.name);
    } else {
      // Apply default theme config
      applyDefaultTheme();
    }
  }, [currentTheme]);

  const applyDefaultTheme = () => {
    // Apply default theme variables to CSS custom properties
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--color-primary', themeConfig.colors.brand.primary);
    root.style.setProperty('--color-secondary', themeConfig.colors.brand.secondary);
    root.style.setProperty('--color-accent', themeConfig.colors.brand.accent);
    
    // Gradients
    root.style.setProperty('--gradient-main', `linear-gradient(to bottom right, ${themeConfig.colors.gradients.main.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`);
    root.style.setProperty('--gradient-card', `linear-gradient(to bottom right, ${themeConfig.colors.gradients.card.replace('from-', '').replace(' to-', ', ')})`);
    root.style.setProperty('--gradient-button', `linear-gradient(to right, ${themeConfig.colors.gradients.button.replace('from-', '').replace(' to-', ', ')})`);
    root.style.setProperty('--gradient-text', `linear-gradient(to right, ${themeConfig.colors.gradients.text.replace('from-', '').replace(' to-', ', ')})`);
    
    // Effects
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
    root.style.setProperty('--backdrop-blur', '12px');
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme: (newTheme: string) => {
      setTheme(newTheme);
      // Find theme in presets and apply it
      const themeStore = useThemeStore.getState();
      const foundTheme = (themeStore.customThemes || []).find(t => t.name === newTheme);
      if (foundTheme) {
        setCurrentTheme(foundTheme);
      }
    },
    colors: themeConfig.colors,
    gradients: themeConfig.colors.gradients,
    spacing: themeConfig.spacing,
    typography: themeConfig.typography,
    effects: {
      glass: themeConfig.colors.glass,
      animation: themeConfig.animation,
    },
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Enhanced theme utility classes
export const themeClasses = {
  // Backgrounds
  bg: {
    primary: 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900',
    card: 'bg-white/10 backdrop-blur-md',
    surface: 'bg-white/5 backdrop-blur-sm',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
  },
  // Text
  text: {
    primary: 'text-white',
    secondary: 'text-white/70',
    muted: 'text-white/60',
    gradient: 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent',
  },
  // Borders
  border: {
    primary: 'border-white/20',
    secondary: 'border-white/10',
    accent: 'border-purple-500/50',
  },
  // Interactive states
  interactive: {
    hover: 'hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300',
    scale: 'hover:scale-105 transition-transform duration-300',
    button: 'bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300',
  },
  // Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 sm:py-16 lg:py-20',
    card: 'p-6',
  },
};

// Theme utility function for consistent styling
export function getThemeClass(...classes: string[]) {
  return classes.join(' ');
}