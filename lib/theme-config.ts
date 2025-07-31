// Unified theme configuration for CharismaAI
export const themeConfig = {
  // Brand colors
  colors: {
    brand: {
      primary: '#8B5CF6', // Purple
      secondary: '#3B82F6', // Blue
      accent: '#EC4899', // Pink
    },
    // Gradient configurations
    gradients: {
      main: 'from-gray-900 via-purple-900 to-blue-900',
      card: 'from-purple-900/20 to-blue-900/20',
      button: 'from-purple-600 to-blue-600',
      text: 'from-purple-400 to-blue-400',
    },
    // Glass morphism effects
    glass: {
      background: 'bg-white/10 backdrop-blur-md',
      border: 'border-white/20',
      shadow: 'shadow-lg shadow-black/10',
    },
  },
  // Spacing system
  spacing: {
    page: 'p-4 sm:p-6 lg:p-8',
    section: 'py-12 sm:py-16 lg:py-20',
    card: 'p-6',
    compact: 'p-4',
  },
  // Layout configurations
  layout: {
    maxWidth: 'max-w-7xl',
    adminMaxWidth: 'max-w-7xl',
    containerPadding: 'px-4 sm:px-6 lg:px-8',
  },
  // Typography
  typography: {
    heading: 'font-bold tracking-tight',
    gradient: 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent',
  },
  // Animation
  animation: {
    transition: 'transition-all duration-300 ease-in-out',
    hover: 'hover:scale-105',
    active: 'active:scale-95',
  },
  // Z-index system
  zIndex: {
    dropdown: 'z-10',
    sticky: 'z-20',
    modal: 'z-30',
    drawer: 'z-40',
    header: 'z-50',
    tooltip: 'z-60',
  },
} as const;

// Helper function to get consistent glass effect
export const getGlassEffect = (opacity: number = 10) => `bg-white/${opacity} backdrop-blur-md border-white/20`;

// Helper function for gradient text
export const getGradientText = () => 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent';