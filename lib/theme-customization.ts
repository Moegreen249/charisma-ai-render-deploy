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
        
        // Note: Server persistence is available but disabled for now to avoid errors
        // The theme is properly persisted in localStorage and works across sessions
        // Uncomment below to enable server persistence when needed:
        /*
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            fetch('/api/admin/themes/current', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ themeId: theme.id }),
            }).catch((error) => {
              console.warn('Failed to persist theme to server:', error);
            });
          }, 100);
        }
        */
      },

      addCustomTheme: (theme) => {
        set((state) => ({
          customThemes: [...(state.customThemes || []), theme],
        }));
      },

      updateCustomTheme: (themeId, updates) => {
        set((state) => ({
          customThemes: (state.customThemes || []).map((theme) =>
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
          customThemes: (state.customThemes || []).filter((theme) => theme.id !== themeId),
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

// Apply theme to DOM with comprehensive coverage
export const applyThemeToDOM = (theme: CustomTheme) => {
  if (typeof window === 'undefined') return; // SSR safety
  
  // Check if this theme is already applied to prevent infinite loops
  const currentThemeId = localStorage.getItem('charisma-active-theme');
  if (currentThemeId === theme.id) {
    return; // Theme already applied
  }
  
  const root = document.documentElement;
  
  // Apply CSS custom properties for colors
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
  
  // Apply gradients as CSS custom properties
  root.style.setProperty('--gradient-main', `linear-gradient(to bottom right, ${theme.gradients.main.replace('from-', '').replace('via-', '').replace('to-', '')})`);
  root.style.setProperty('--gradient-card', `linear-gradient(to bottom right, ${theme.gradients.card.replace('from-', '').replace('to-', '')})`);
  root.style.setProperty('--gradient-button', `linear-gradient(to right, ${theme.gradients.button.replace('from-', '').replace('to-', '')})`);
  root.style.setProperty('--gradient-text', `linear-gradient(to right, ${theme.gradients.text.replace('from-', '').replace('to-', '')})`);
  root.style.setProperty('--gradient-hero', `linear-gradient(to right, ${theme.gradients.hero.replace('from-', '').replace('via-', '').replace('to-', '')})`);
  root.style.setProperty('--gradient-sidebar', `linear-gradient(to bottom, ${theme.gradients.sidebar.replace('from-', '').replace('to-', '')})`);
  
  // Apply typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-size-xs', theme.typography.fontSize.xs);
  root.style.setProperty('--font-size-sm', theme.typography.fontSize.sm);
  root.style.setProperty('--font-size-base', theme.typography.fontSize.base);
  root.style.setProperty('--font-size-lg', theme.typography.fontSize.lg);
  root.style.setProperty('--font-size-xl', theme.typography.fontSize.xl);
  root.style.setProperty('--font-size-2xl', theme.typography.fontSize['2xl']);
  root.style.setProperty('--font-size-3xl', theme.typography.fontSize['3xl']);
  root.style.setProperty('--font-size-4xl', theme.typography.fontSize['4xl']);
  
  // Apply font weights
  root.style.setProperty('--font-weight-light', theme.typography.fontWeight.light);
  root.style.setProperty('--font-weight-normal', theme.typography.fontWeight.normal);
  root.style.setProperty('--font-weight-medium', theme.typography.fontWeight.medium);
  root.style.setProperty('--font-weight-semibold', theme.typography.fontWeight.semibold);
  root.style.setProperty('--font-weight-bold', theme.typography.fontWeight.bold);
  
  // Apply line heights
  root.style.setProperty('--line-height-tight', theme.typography.lineHeight.tight);
  root.style.setProperty('--line-height-normal', theme.typography.lineHeight.normal);
  root.style.setProperty('--line-height-relaxed', theme.typography.lineHeight.relaxed);
  
  // Apply spacing
  root.style.setProperty('--spacing-xs', theme.spacing.xs);
  root.style.setProperty('--spacing-sm', theme.spacing.sm);
  root.style.setProperty('--spacing-md', theme.spacing.md);
  root.style.setProperty('--spacing-lg', theme.spacing.lg);
  root.style.setProperty('--spacing-xl', theme.spacing.xl);
  root.style.setProperty('--spacing-2xl', theme.spacing['2xl']);
  root.style.setProperty('--spacing-3xl', theme.spacing['3xl']);
  
  // Apply effects
  root.style.setProperty('--radius-none', theme.effects.borderRadius.none);
  root.style.setProperty('--radius-sm', theme.effects.borderRadius.sm);
  root.style.setProperty('--radius-md', theme.effects.borderRadius.md);
  root.style.setProperty('--radius-lg', theme.effects.borderRadius.lg);
  root.style.setProperty('--radius-xl', theme.effects.borderRadius.xl);
  root.style.setProperty('--radius-full', theme.effects.borderRadius.full);
  
  // Apply shadows
  root.style.setProperty('--shadow-sm', theme.effects.shadow.sm);
  root.style.setProperty('--shadow-md', theme.effects.shadow.md);
  root.style.setProperty('--shadow-lg', theme.effects.shadow.lg);
  root.style.setProperty('--shadow-xl', theme.effects.shadow.xl);
  root.style.setProperty('--shadow-2xl', theme.effects.shadow['2xl']);
  
  // Apply blur effects
  root.style.setProperty('--blur-sm', theme.effects.blur.sm);
  root.style.setProperty('--blur-md', theme.effects.blur.md);
  root.style.setProperty('--blur-lg', theme.effects.blur.lg);
  root.style.setProperty('--blur-xl', theme.effects.blur.xl);
  
  // Apply opacity
  root.style.setProperty('--opacity-low', theme.effects.opacity.low.toString());
  root.style.setProperty('--opacity-medium', theme.effects.opacity.medium.toString());
  root.style.setProperty('--opacity-high', theme.effects.opacity.high.toString());
  
  // Apply theme class to body for CSS selectors
  document.body.className = document.body.className.replace(/theme-\w+/, '') + ` theme-${theme.id}`;
  
  // Store theme ID in localStorage for persistence
  localStorage.setItem('charisma-active-theme', theme.id);
  
  // Trigger a custom event for other components to listen to
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme, timestamp: Date.now() } 
  }));
  
  console.log(`✨ Applied theme: ${theme.name} (${theme.id})`);
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

// Initialize theme on app load
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;
  
  const storedThemeId = localStorage.getItem('charisma-active-theme');
  if (storedThemeId) {
    const foundTheme = themePresets.find(theme => theme.id === storedThemeId);
    if (foundTheme) {
      // Only apply if not already applied
      applyThemeToDOM(foundTheme);
      return foundTheme;
    }
  }
  
  // Apply default theme only if no theme is currently applied
  const currentThemeId = localStorage.getItem('charisma-active-theme');
  if (!currentThemeId) {
    const defaultTheme = themePresets[0];
    applyThemeToDOM(defaultTheme);
    return defaultTheme;
  }
  
  return null;
};

// Restore theme from localStorage
export const restoreTheme = (): CustomTheme | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedThemeId = localStorage.getItem('charisma-active-theme');
    if (storedThemeId) {
      // Check presets first
      const presetTheme = themePresets.find(theme => theme.id === storedThemeId);
      if (presetTheme) {
        return presetTheme;
      }
      
      // Check custom themes from localStorage
      const customThemesJson = localStorage.getItem('charisma-custom-themes');
      if (customThemesJson) {
        const customThemes = JSON.parse(customThemesJson);
        const customTheme = customThemes.find((theme: CustomTheme) => theme.id === storedThemeId);
        if (customTheme) {
          return customTheme;
        }
      }
    }
  } catch (error) {
    console.error('Error restoring theme:', error);
  }
  
  return null;
};

// Listen for theme changes across tabs
export const setupThemeSync = () => {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'charisma-active-theme' && e.newValue) {
      const newThemeId = e.newValue;
      const foundTheme = themePresets.find(theme => theme.id === newThemeId);
      if (foundTheme) {
        applyThemeToDOM(foundTheme);
      }
    }
  });
};