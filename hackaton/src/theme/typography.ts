/**
 * TENEX Workforce - Design System Typography
 * Système typographique avec la police Inter
 */

import { TextStyle } from 'react-native';

// Configuration des polices
export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  // Fallbacks système
  system: 'System',
  systemBold: 'System',
} as const;

// Tailles de police
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Hauteurs de ligne
export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Espacement des lettres
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

// Styles de texte prédéfinis
export const typography = {
  // Titres
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h4: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    lineHeight: fontSize.xl * lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h5: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    lineHeight: fontSize.lg * lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h6: {
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Corps de texte
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    lineHeight: fontSize.lg * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  body: {
    fontSize: fontSize.base,
    fontWeight: '400',
    lineHeight: fontSize.base * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    lineHeight: fontSize.sm * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontSize: fontSize.md,
    fontWeight: '500',
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  label: {
    fontSize: fontSize.base,
    fontWeight: '500',
    lineHeight: fontSize.base * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  labelSmall: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Captions
  caption: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Boutons
  buttonLarge: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    lineHeight: fontSize.lg * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  button: {
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonSmall: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Liens
  link: {
    fontSize: fontSize.base,
    fontWeight: '500',
    lineHeight: fontSize.base * lineHeight.normal,
    textDecorationLine: 'underline',
  } as TextStyle,

  // Code / Mono
  code: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    lineHeight: fontSize.sm * lineHeight.relaxed,
    fontFamily: 'monospace',
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;

export default typography;
