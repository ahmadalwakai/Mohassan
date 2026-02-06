/**
 * Mohassan Design Tokens
 * Neon-inspired dark theme with RTL Arabic support
 */

export const colors = {
  // Background colors
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    elevated: '#252525',
  },
  
  // Brand colors
  brand: {
    glow: '#00FF00',
    glowMuted: '#00CC00',
    header: '#007BFF',
    headerHover: '#0056b3',
    footer: '#343A40',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    muted: '#6C757D',
    inverse: '#121212',
  },
  
  // Status colors
  status: {
    success: '#00FF00',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
  },
  
  // Border colors
  border: {
    default: '#2D2D2D',
    hover: '#00FF00',
    focus: '#007BFF',
  },
} as const;

export const fonts = {
  heading: '"Noto Sans Arabic", "Noto Sans", system-ui, sans-serif',
  body: '"Noto Sans Arabic", "Noto Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(0, 255, 0, 0.3)',
  glowStrong: '0 0 30px rgba(0, 255, 0, 0.5)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

export const zIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;
