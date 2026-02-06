/**
 * Mohassan Design Tokens
 * Orange + Purple Cinematic Premium theme with RTL Arabic support
 */

export const colors = {
  // Background colors
  background: {
    base: '#09090B',
    depth: '#0B1020',
    primary: '#09090B',
    secondary: '#0B1020',
    elevated: '#18181B', // Elevated surface (inputs, cards)
  },
  
  // Surface colors (glass morphism)
  surface: {
    glass: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.06)',
    header: 'rgba(9, 9, 11, 0.35)',
    footer: 'rgba(9, 9, 11, 0.28)',
  },
  
  // Brand colors - Orange + Purple
  brand: {
    primary: '#F97316', // Orange
    accent: '#7C3AED', // Purple
    // Brand scale for component states
    400: '#FB923C', // Lighter orange
    500: '#F97316', // Primary orange
    600: '#EA580C', // Darker orange
    700: '#C2410C', // Darkest orange
    // Semantic brand tokens
    glow: '#F97316', // Glow effect color
    glowMuted: '#EA580C', // Muted glow
    header: '#F97316', // Header accent
  },
  
  // Text colors
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.68)',
    muted: 'rgba(255,255,255,0.68)',
    tertiary: 'rgba(255,255,255,0.54)', // Third-level text
    inverse: '#09090B',
  },
  
  // Border colors
  border: {
    default: 'rgba(255,255,255,0.08)',
    hover: 'rgba(255,255,255,0.12)',
    glass: 'rgba(255,255,255,0.10)',
  },
  
  // Status colors (orange/purple focused)
  status: {
    success: '#F97316',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#7C3AED',
  },
  
  // Gray scale (for inputs, text, borders)
  gray: {
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  
  // Red scale (for errors, danger)
  red: {
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Alpha scales (for overlays, glass effects)
  whiteAlpha: {
    50: 'rgba(255,255,255,0.04)',
    100: 'rgba(255,255,255,0.06)',
    200: 'rgba(255,255,255,0.08)',
    500: 'rgba(255,255,255,0.36)',
    700: 'rgba(255,255,255,0.64)',
    800: 'rgba(255,255,255,0.80)',
  },
  
  blackAlpha: {
    700: 'rgba(0,0,0,0.64)',
    800: 'rgba(0,0,0,0.80)',
  },
  
  // Green scale (for success states)
  green: {
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    900: '#14532D',
  },
  
  // Blue scale (for info states)
  blue: {
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    900: '#1E3A8A',
  },
  
  // Additional accent colors (for avatar, badges)
  purple: {
    600: '#9333EA',
  },
  
  pink: {
    600: '#DB2777',
  },
  
  orange: {
    600: '#EA580C',
  },
  
  teal: {
    600: '#0D9488',
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
  lg: '1rem',   // 16px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  focusRing: '0 0 0 3px rgba(124,58,237,0.30)',
  glowOrange: '0 0 18px rgba(249,115,22,0.22)',
  glowPurple: '0 0 18px rgba(124,58,237,0.22)',
  glass: '0 10px 30px rgba(0,0,0,0.25)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '250ms ease-in-out',
} as const;

export const gradients = {
  heroText: 'linear-gradient(90deg, #F97316, #7C3AED)',
  primaryButton: 'linear-gradient(135deg, #F97316, #7C3AED)',
  aurora: `
    radial-gradient(60% 45% at 15% 10%, rgba(249,115,22,0.18), transparent 60%),
    radial-gradient(55% 40% at 85% 15%, rgba(124,58,237,0.18), transparent 60%),
    linear-gradient(180deg, #0B1020 0%, #09090B 55%, #09090B 100%)
  `,
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
