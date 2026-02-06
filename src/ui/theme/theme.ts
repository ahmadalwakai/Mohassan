/**
 * Mohassan Chakra UI Theme
 * Dark Neon theme with RTL Arabic support
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { colors, fonts, radii, shadows } from './tokens';

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {
        // Background
        'bg.primary': { value: colors.background.primary },
        'bg.secondary': { value: colors.background.secondary },
        'bg.elevated': { value: colors.background.elevated },
        
        // Brand
        'brand.glow': { value: colors.brand.glow },
        'brand.glowMuted': { value: colors.brand.glowMuted },
        'brand.header': { value: colors.brand.header },
        'brand.headerHover': { value: colors.brand.headerHover },
        'brand.footer': { value: colors.brand.footer },
        
        // Text
        'text.primary': { value: colors.text.primary },
        'text.secondary': { value: colors.text.secondary },
        'text.muted': { value: colors.text.muted },
        'text.inverse': { value: colors.text.inverse },
        
        // Status
        'status.success': { value: colors.status.success },
        'status.warning': { value: colors.status.warning },
        'status.error': { value: colors.status.error },
        'status.info': { value: colors.status.info },
        
        // Border
        'border.default': { value: colors.border.default },
        'border.hover': { value: colors.border.hover },
        'border.focus': { value: colors.border.focus },
      },
      fonts: {
        heading: { value: fonts.heading },
        body: { value: fonts.body },
        mono: { value: fonts.mono },
      },
      radii: {
        sm: { value: radii.sm },
        md: { value: radii.md },
        lg: { value: radii.lg },
        xl: { value: radii.xl },
        full: { value: radii.full },
      },
      shadows: {
        sm: { value: shadows.sm },
        md: { value: shadows.md },
        lg: { value: shadows.lg },
        glow: { value: shadows.glow },
        glowStrong: { value: shadows.glowStrong },
      },
    },
    semanticTokens: {
      colors: {
        // Chakra semantic tokens mapping
        'bg': { value: '{colors.bg.primary}' },
        'bg.muted': { value: '{colors.bg.secondary}' },
        'bg.subtle': { value: '{colors.bg.elevated}' },
        'fg': { value: '{colors.text.primary}' },
        'fg.muted': { value: '{colors.text.secondary}' },
        'fg.subtle': { value: '{colors.text.muted}' },
        'border': { value: '{colors.border.default}' },
        'border.emphasized': { value: '{colors.border.hover}' },
      },
    },
    keyframes: {
      glowPulse: {
        '0%, 100%': { boxShadow: shadows.glow },
        '50%': { boxShadow: shadows.glowStrong },
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
    },
  },
  globalCss: {
    'html, body': {
      backgroundColor: colors.background.primary,
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
      backgroundColor: colors.brand.glow,
      color: colors.text.inverse,
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
      backgroundColor: colors.brand.glow,
    },
  },
});

export const system = createSystem(defaultConfig, config);

export default system;
