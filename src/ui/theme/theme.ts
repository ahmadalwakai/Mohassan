/**
 * Mohassan Chakra UI Theme
 * Orange + Purple Cinematic Premium theme with RTL Arabic support
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { colors, fonts, radii, shadows } from './tokens';

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {
        // Background
        'bg.base': { value: colors.background.base },
        'bg.depth': { value: colors.background.depth },
        'bg.primary': { value: colors.background.primary },
        'bg.secondary': { value: colors.background.secondary },
        'bg.elevated': { value: colors.background.elevated },
        
        // Surface (glass)
        'surface.glass': { value: colors.surface.glass },
        'surface.strong': { value: colors.surface.strong },
        'surface.header': { value: colors.surface.header },
        'surface.footer': { value: colors.surface.footer },
        
        // Brand - core
        'brand.primary': { value: colors.brand.primary },
        'brand.accent': { value: colors.brand.accent },
        // Brand - scale (for component states)
        'brand.400': { value: colors.brand[400] },
        'brand.500': { value: colors.brand[500] },
        'brand.600': { value: colors.brand[600] },
        'brand.700': { value: colors.brand[700] },
        // Brand - semantic
        'brand.glow': { value: colors.brand.glow },
        'brand.glowMuted': { value: colors.brand.glowMuted },
        'brand.header': { value: colors.brand.header },
        
        // Text
        'text.primary': { value: colors.text.primary },
        'text.secondary': { value: colors.text.secondary },
        'text.muted': { value: colors.text.muted },
        'text.tertiary': { value: colors.text.tertiary },
        'text.inverse': { value: colors.text.inverse },
        
        // Status
        'status.success': { value: colors.status.success },
        'status.warning': { value: colors.status.warning },
        'status.error': { value: colors.status.error },
        'status.info': { value: colors.status.info },
        
        // Border
        'border.default': { value: colors.border.default },
        'border.hover': { value: colors.border.hover },
        'border.glass': { value: colors.border.glass },
        
        // Gray scale (for inputs, text, borders)
        'gray.300': { value: colors.gray[300] },
        'gray.400': { value: colors.gray[400] },
        'gray.500': { value: colors.gray[500] },
        'gray.600': { value: colors.gray[600] },
        'gray.700': { value: colors.gray[700] },
        'gray.800': { value: colors.gray[800] },
        'gray.900': { value: colors.gray[900] },
        
        // Red scale (for errors, danger)
        'red.300': { value: colors.red[300] },
        'red.400': { value: colors.red[400] },
        'red.500': { value: colors.red[500] },
        'red.600': { value: colors.red[600] },
        'red.700': { value: colors.red[700] },
        'red.800': { value: colors.red[800] },
        'red.900': { value: colors.red[900] },
        
        // White alpha (for overlays, glass effects)
        'whiteAlpha.50': { value: colors.whiteAlpha[50] },
        'whiteAlpha.100': { value: colors.whiteAlpha[100] },
        'whiteAlpha.200': { value: colors.whiteAlpha[200] },
        'whiteAlpha.500': { value: colors.whiteAlpha[500] },
        'whiteAlpha.700': { value: colors.whiteAlpha[700] },
        'whiteAlpha.800': { value: colors.whiteAlpha[800] },
        
        // Black alpha (for overlays)
        'blackAlpha.700': { value: colors.blackAlpha[700] },
        'blackAlpha.800': { value: colors.blackAlpha[800] },
        
        // Green scale (for success states)
        'green.300': { value: colors.green[300] },
        'green.400': { value: colors.green[400] },
        'green.500': { value: colors.green[500] },
        'green.600': { value: colors.green[600] },
        'green.900': { value: colors.green[900] },
        
        // Blue scale (for info states)
        'blue.300': { value: colors.blue[300] },
        'blue.400': { value: colors.blue[400] },
        'blue.500': { value: colors.blue[500] },
        'blue.600': { value: colors.blue[600] },
        'blue.900': { value: colors.blue[900] },
        
        // Additional accent colors (for avatar, badges)
        'purple.600': { value: colors.purple[600] },
        'pink.600': { value: colors.pink[600] },
        'orange.600': { value: colors.orange[600] },
        'teal.600': { value: colors.teal[600] },
      },
      fonts: {
        heading: { value: fonts.heading },
        body: { value: fonts.body },
        mono: { value: fonts.mono },
      },
      radii: {
        lg: { value: radii.lg },
        xl: { value: radii.xl },
        '2xl': { value: radii['2xl'] },
        full: { value: radii.full },
      },
      shadows: {
        focusRing: { value: shadows.focusRing },
        glowOrange: { value: shadows.glowOrange },
        glowPurple: { value: shadows.glowPurple },
        glow: { value: shadows.glowPurple },
        glass: { value: shadows.glass },
      },
    },
    semanticTokens: {
      colors: {
        'bg': { value: '{colors.bg.base}' },
        'bg.muted': { value: '{colors.bg.secondary}' },
        'fg': { value: '{colors.text.primary}' },
        'fg.muted': { value: '{colors.text.muted}' },
        'border': { value: '{colors.border.default}' },
      },
    },
    keyframes: {
      glowPulse: {
        '0%, 100%': { boxShadow: shadows.glowPurple },
        '50%': { boxShadow: `0 0 24px rgba(124,58,237,0.30)` },
      },
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      slideInRight: {
        from: { transform: 'translateX(20px)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },
      slideInLeft: {
        from: { transform: 'translateX(-20px)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },
      subtleFloat: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-4px)' },
      },
    },
  },
  globalCss: {
    'html, body': {
      backgroundColor: colors.background.base,
      color: colors.text.primary,
      fontFamily: fonts.body,
      minHeight: '100vh',
      margin: 0,
      padding: 0,
    },
    '*': {
      boxSizing: 'border-box',
    },
    '::selection': {
      backgroundColor: colors.brand.primary,
      color: colors.text.inverse,
      opacity: '0.4',
    },
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: colors.background.secondary,
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: colors.border.default,
      borderRadius: radii.full,
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: colors.border.hover,
    },
  },
});

export const system = createSystem(defaultConfig, config);

export default system;
