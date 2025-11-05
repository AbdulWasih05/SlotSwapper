// Dark theme color palette inspired by modern UI design
export const colors = {
  // Backgrounds
  background: {
    primary: '#000000',
    secondary: '#0a0a0a',
    tertiary: '#1a1a1a',
    card: '#111111',
    cardHover: '#1a1a1a',
  },

  // Blue accents
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Text
  text: {
    primary: '#ffffff',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    muted: '#6b7280',
  },

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Borders
  border: {
    primary: '#1f2937',
    secondary: '#374151',
  },
};

// Glow effects
export const glowEffects = {
  blueLarge: `
    radial-gradient(
      circle at center,
      rgba(59, 130, 246, 0.15) 0%,
      rgba(59, 130, 246, 0.05) 40%,
      transparent 70%
    )
  `,
  blueSmall: `
    radial-gradient(
      circle at center,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(59, 130, 246, 0.1) 50%,
      transparent 100%
    )
  `,
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  blueGlow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
};

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
};

// Spacing (px values)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};
