/**
 * TENEX Workforce - Design System Shadows
 * Ombres pour les cartes et éléments surélevés
 */

import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

// Type pour les ombres
interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

// Fonction helper pour créer des ombres cross-platform
const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = colors.neutral[900]
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

// Ombres prédéfinies
export const shadows = {
  // Aucune ombre
  none: createShadow(0, 0, 0, 0),

  // Ombre très légère (boutons, inputs au focus)
  xs: createShadow(1, 2, 0.05, 1),

  // Ombre légère (cards au repos)
  sm: createShadow(1, 3, 0.1, 2),

  // Ombre moyenne (cards surélevées, dropdowns)
  md: createShadow(4, 6, 0.1, 4),

  // Ombre prononcée (modals, popovers)
  lg: createShadow(10, 15, 0.1, 8),

  // Ombre très prononcée (dialogs, bottom sheets)
  xl: createShadow(20, 25, 0.15, 12),

  // Ombre maximale (éléments flottants)
  '2xl': createShadow(25, 50, 0.25, 16),

  // Ombre interne (inputs, wells)
  inner: {
    ...createShadow(2, 4, 0.06, 0),
    shadowOffset: { width: 0, height: 2 },
  } as ShadowStyle,
} as const;

// Ombres colorées pour les états
export const coloredShadows = {
  primary: createShadow(4, 12, 0.3, 4, colors.primary[500]),
  success: createShadow(4, 12, 0.3, 4, colors.success.main),
  warning: createShadow(4, 12, 0.3, 4, colors.warning.main),
  error: createShadow(4, 12, 0.3, 4, colors.error.main),
  accent: createShadow(4, 12, 0.3, 4, '#a855f7'),
} as const;

// Ombres pour le mode sombre
export const darkShadows = {
  none: createShadow(0, 0, 0, 0),
  xs: createShadow(1, 2, 0.2, 1, '#000000'),
  sm: createShadow(1, 3, 0.3, 2, '#000000'),
  md: createShadow(4, 6, 0.4, 4, '#000000'),
  lg: createShadow(10, 15, 0.5, 8, '#000000'),
  xl: createShadow(20, 25, 0.6, 12, '#000000'),
  '2xl': createShadow(25, 50, 0.7, 16, '#000000'),
} as const;

// Helper pour appliquer une ombre
export const applyShadow = (
  shadowKey: keyof typeof shadows,
  isDarkMode: boolean = false
): ViewStyle => {
  const shadowSet = isDarkMode ? darkShadows : shadows;
  return shadowSet[shadowKey as keyof typeof shadowSet] || shadows.none;
};

export type ShadowLevel = keyof typeof shadows;

export default shadows;
