/**
 * TENEX Workforce - Design System Colors
 * Palette de couleurs officielle de l'application
 */

export const colors = {
  // Couleurs principales (brand TENEX)
  primary: {
    50: '#e6f2ed',
    100: '#c0dfd3',
    200: '#99ccb8',
    300: '#73b99d',
    400: '#4da682',
    500: '#006241', // Couleur principale TENEX
    600: '#005539',
    700: '#004830',
    800: '#003b28',
    900: '#002e1f',
  },

  // Couleurs secondaires
  secondary: {
    50: '#e9eaea',
    100: '#c8cac9',
    200: '#a7aaa9',
    300: '#868a88',
    400: '#656a68',
    500: '#2e3932', // Vert foncé TENEX
    600: '#28322c',
    700: '#222b26',
    800: '#1c2420',
    900: '#161d1a',
  },

  // Couleurs d'accent
  accent: {
    light: '#d4e9e2', // Bleu clair accent
    main: '#006241',
    dark: '#004830',
  },

  // Couleurs sémantiques
  success: {
    light: '#d1f3ba',
    main: '#22c55e',
    dark: '#16a34a',
  },

  warning: {
    light: '#fef3c7',
    main: '#F59E0B',
    dark: '#d97706',
  },

  error: {
    light: '#fee2e2',
    main: '#EF4444',
    dark: '#dc2626',
  },

  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
  },

  // Couleurs neutres
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6B7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#0a0a0a',
    darkSecondary: '#1a1a1a',
    darkTertiary: '#2a2a2a',
  },

  // Texte
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#6B7280',
    disabled: '#9ca3af',
    inverse: '#FFFFFF',
    // Dark mode
    darkPrimary: '#FFFFFF',
    darkSecondary: '#9ca3af',
    darkTertiary: '#6B7280',
  },

  // Bordures
  border: {
    light: '#e5e7eb',
    main: '#d1d5db',
    dark: '#9ca3af',
    darkMode: '#2a2a2a',
  },

  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },

  // Couleurs spécifiques aux missions
  mission: {
    nouveau: '#3b82f6', // Bleu
    topMatch: '#22c55e', // Vert
    urgent: '#EF4444', // Rouge
    enAttente: '#F59E0B', // Orange
    enCours: '#8b5cf6', // Violet
    termine: '#6B7280', // Gris
  },

  // Gradients (pour usage avec LinearGradient)
  gradient: {
    primary: ['#006241', '#004830'],
    secondary: ['#2e3932', '#1c2420'],
    success: ['#22c55e', '#16a34a'],
    accent: ['#a855f7', '#7c3aed'],
  },
} as const;

// Type pour les couleurs
export type ColorPalette = typeof colors;
export type PrimaryColor = keyof typeof colors.primary;
export type SemanticColor = 'success' | 'warning' | 'error' | 'info';

export default colors;
