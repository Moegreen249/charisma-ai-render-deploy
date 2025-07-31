// Advanced Theme Customization System for CharismaAI
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeGradients {
  main: string;
  card: string;
  button: string;
  text: string;
  hero: string;
  sidebar: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeEffects {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  opacity: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  gradients: ThemeGradients;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  effects: ThemeEffects;
  createdAt: string;
  updatedAt: string;
}

// Predefined theme presets
export const themePresets: CustomTheme[] = [
  {
    id: 'charisma-default',
    name: 'CharismaAI Default',
    colors: {
      primary: '#8B5CF6',
      secondary: '#3B82F6',
      accent: '#EC4899',
      background: '#0F0F23',
      surface: '#1A1A2E',
      text: '#FFFFFF',
      textSecondary: '#B0B0C3',
      border: '#2A2A3E',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    gradients: {
      main: 'from-gray-900 via-purple-900 to-blue-900',
      card: 'from-purple-900/20 to-blue-900/20',
      button: 'from-purple-600 to-blue-600',
      text: 'from-purple-400 to-blue-400',
      hero: 'from-purple-600 via-blue-600 to-cyan-600',
      sidebar: 'from-gray-900/95 to-purple-900/95',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    effects: {
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      blur: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      opacity: {
        low: 0.1,
        medium: 0.2,
        high: 0.3,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      background: '#0C2340',
      surface: '#1E3A8A',
      text: '#FFFFFF',
      textSecondary: '#94A3B8',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    gradients: {
      main: 'from-blue-900 via-cyan-900 to-teal-900',
      card: 'from-blue-900/20 to-cyan-900/20',
      button: 'from-blue-600 to-cyan-600',
      text: 'from-blue-400 to-cyan-400',
      hero: 'from-blue-600 via-cyan-600 to-teal-600',
      sidebar: 'from-blue-900/95 to-cyan-900/95',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    effects: {
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      blur: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      opacity: {
        low: 0.1,
        medium: 0.2,
        high: 0.3,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    colors: {
      primary: '#F97316',
      secondary: '#EF4444',
      accent: '#EC4899',
      background: '#1F1611',
      surface: '#2D1B14',
      text: '#FFFFFF',
      textSecondary: '#D1D5DB',
      border: '#451A03',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    gradients: {
      main: 'from-orange-900 via-red-900 to-pink-900',
      card: 'from-orange-900/20 to-red-900/20',
      button: 'from-orange-600 to-red-600',
      text: 'from-orange-400 to-red-400',
      hero: 'from-orange-600 via-red-600 to-pink-600',
      sidebar: 'from-orange-900/95 to-red-900/95',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    effects: {
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      blur: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      opacity: {
        low: 0.1,
        medium: 0.2,
        high: 0.3,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Theme store with Zustand
interface ThemeStore {
  currentTheme: CustomTheme;
  customThemes: CustomTheme[];
  isLoading: boolean;
  setCurrentTheme: (theme: CustomTheme) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  resetToDefault: () => void;
  loadThemes: () => Promise<void>;
  saveTheme: (theme: CustomTheme) => Promise<void>;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: themePresets[0],
      customThemes: [],
      isLoading: false,

      setCurrentTheme: (theme) => {
        set({ currentTheme: theme });
        applyThemeToDOM(theme);
      },

      addCustomTheme: (theme) => {
        set((state) => ({
          customThemes: [...state.customThemes, theme],
        }));
      },

      updateCustomTheme: (themeId, updates) => {
        set((state) => ({
          customThemes: state.customThemes.map((theme) =>
            theme.id === themeId
              ? { ...theme, ...updates, updatedAt: new Date().toISOString() }
              : theme
          ),
          currentTheme:
            state.currentTheme.id === themeId
              ? { ...state.currentTheme, ...updates, updatedAt: new Date().toISOString() }
              : state.currentTheme,
        }));
      },

      deleteCustomTheme: (themeId) => {
        set((state) => ({
          customThemes: state.customThemes.filter((theme) => theme.id !== themeId),
          currentTheme:
            state.currentTheme.id === themeId ? themePresets[0] : state.currentTheme,
        }));
      },

      resetToDefault: () => {
        const defaultTheme = themePresets[0];
        set({ currentTheme: defaultTheme });
        applyThemeToDOM(defaultTheme);
      },

      loadThemes: async () => {
        set({ isLoading: true });
        try {
          // Load themes from API or local storage
          const response = await fetch('/api/admin/themes');
          if (response.ok) {
            const data = await response.json();
            set({ customThemes: data.themes || [] });
          }
        } catch (error) {
          console.error('Failed to load themes:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveTheme: async (theme) => {
        try {
          const response = await fetch('/api/admin/themes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme }),
          });
          if (response.ok) {
            get().addCustomTheme(theme);
          }
        } catch (error) {
          console.error('Failed to save theme:', error);
          throw error;
        }
      },
    }),
    {
      name: 'charisma-theme-store',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        customThemes: state.customThemes,
      }),
    }
  )
);

// Apply theme to DOM
export const applyThemeToDOM = (theme: CustomTheme) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-info', theme.colors.info);
  
  // Apply font family
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  
  // Apply border radius
  root.style.setProperty('--radius-sm', theme.effects.borderRadius.sm);
  root.style.setProperty('--radius-md', theme.effects.borderRadius.md);
  root.style.setProperty('--radius-lg', theme.effects.borderRadius.lg);
  root.style.setProperty('--radius-xl', theme.effects.borderRadius.xl);
};

// Theme utilities
export const generateThemeCSS = (theme: CustomTheme): string => {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-border: ${theme.colors.border};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      --font-family: ${theme.typography.fontFamily};
      --radius-sm: ${theme.effects.borderRadius.sm};
      --radius-md: ${theme.effects.borderRadius.md};
      --radius-lg: ${theme.effects.borderRadius.lg};
      --radius-xl: ${theme.effects.borderRadius.xl};
    }
  `;
};

export const exportTheme = (theme: CustomTheme): string => {
  return JSON.stringify(theme, null, 2);
};

export const importTheme = (themeJSON: string): CustomTheme => {
  const theme = JSON.parse(themeJSON);
  return {
    ...theme,
    id: `imported-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
};