/**
 * TENEX Workforce - Design System
 * Export centralisé de tous les tokens de design
 */

// Imports
export { colors, type ColorPalette } from './colors';
export { typography, fontSize, fontFamily, lineHeight, letterSpacing, type TypographyVariant } from './typography';
export { spacing, spacingSemantic, type SpacingValue } from './spacing';
export { shadows, darkShadows, coloredShadows, applyShadow, type ShadowLevel } from './shadows';
export { borderRadius, borderRadiusSemantic, borderRadiusTop, borderRadiusBottom, type BorderRadiusValue } from './borderRadius';

// Re-export par défaut
import { colors } from './colors';
import { typography, fontSize, fontFamily } from './typography';
import { spacing, spacingSemantic } from './spacing';
import { shadows, darkShadows } from './shadows';
import { borderRadius, borderRadiusSemantic } from './borderRadius';

// Thème complet
export const theme = {
  colors,
  typography,
  fontSize,
  fontFamily,
  spacing,
  spacingSemantic,
  shadows,
  darkShadows,
  borderRadius,
  borderRadiusSemantic,
} as const;

// Thème sombre
export const darkTheme = {
  ...theme,
  colors: {
    ...colors,
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      dark: '#FFFFFF',
      darkSecondary: '#F9FAFB',
      darkTertiary: '#F3F4F6',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9ca3af',
      tertiary: '#6B7280',
      disabled: '#4b5563',
      inverse: '#111827',
      darkPrimary: '#111827',
      darkSecondary: '#4b5563',
      darkTertiary: '#6B7280',
    },
    border: {
      light: '#2a2a2a',
      main: '#3a3a3a',
      dark: '#4a4a4a',
      darkMode: '#e5e7eb',
    },
  },
  shadows: darkShadows,
} as const;

// Type du thème
export type Theme = typeof theme;
export type DarkTheme = typeof darkTheme;

export default theme;
