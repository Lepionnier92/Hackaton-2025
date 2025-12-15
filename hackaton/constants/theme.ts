/**
 * TENEX Workforce - Palette de couleurs TENEXA
 * Design selon les spécifications du hackathon
 */

import { Platform } from 'react-native';

// Couleurs principales TENEXA
export const TenexColors = {
  // Couleurs primaires
  primary: '#006241',      // Vert TENEX (confiance, croissance)
  primaryDark: '#1a5336',  // Vert foncé pour le logo
  primaryLight: '#008755', // Vert plus clair pour hover
  secondary: '#2e3932',    // Vert foncé (professionnalisme)
  
  // Accents
  accentBlue: '#d4e9e2',   // Bleu clair (notifications, info, backgrounds)
  accentGreen: '#d1f3ba',  // Vert clair (succès, validation)
  accentMint: '#e8f5f0',   // Vert très clair pour backgrounds
  
  // UI States
  success: '#10b981',      // Vert succès
  warning: '#f59e0b',      // Orange avertissement
  error: '#ef4444',        // Rouge erreur
  info: '#3b82f6',         // Bleu info
  
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Badges de mission
  badges: {
    new: '#006241',        // Nouveau
    topMatch: '#f59e0b',   // Top Match 🔥
    urgent: '#ef4444',     // Urgent ⚡
    premium: '#8b5cf6',    // Premium 💎
    recommended: '#3b82f6', // Recommandé 🌟
  },
  
  // Urgence
  urgency: {
    low: { bg: '#d1fae5', text: '#065f46', label: 'Normal' },
    medium: { bg: '#fef3c7', text: '#92400e', label: 'Moyenne' },
    high: { bg: '#fee2e2', text: '#991b1b', label: 'Urgente' },
  },
  
  // Match score colors
  match: {
    excellent: '#006241',  // > 90%
    good: '#10b981',       // > 75%
    average: '#f59e0b',    // > 50%
    low: '#9ca3af',        // < 50%
  },
};

const tintColorLight = TenexColors.primary;
const tintColorDark = '#4ade80'; // Vert plus clair pour le dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
