/**
 * TENEX Workforce - Design System Border Radius
 * Coins arrondis cohérents pour l'application
 */

// Échelle de border radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999, // Pour les cercles parfaits
} as const;

// Alias sémantiques
export const borderRadiusSemantic = {
  // Boutons
  buttonSM: borderRadius.md,    // 8px
  button: borderRadius.lg,      // 12px
  buttonLG: borderRadius.xl,    // 16px
  buttonPill: borderRadius.full, // Pill shape

  // Cards
  cardSM: borderRadius.md,      // 8px
  card: borderRadius.lg,        // 12px
  cardLG: borderRadius.xl,      // 16px
  cardXL: borderRadius['2xl'],  // 20px

  // Inputs
  input: borderRadius.lg,       // 12px
  inputSM: borderRadius.md,     // 8px

  // Badges/Tags
  badge: borderRadius.md,       // 8px
  tag: borderRadius.full,       // Pill shape

  // Avatars
  avatarSM: borderRadius.md,    // 8px
  avatar: borderRadius.lg,      // 12px
  avatarRound: borderRadius.full, // Cercle

  // Modals/Sheets
  modal: borderRadius['2xl'],   // 20px
  bottomSheet: borderRadius['3xl'], // 24px

  // Tooltips/Popovers
  tooltip: borderRadius.md,     // 8px
  popover: borderRadius.lg,     // 12px

  // Progress bars
  progress: borderRadius.full,  // Pill shape

  // Images
  imageSM: borderRadius.md,     // 8px
  image: borderRadius.lg,       // 12px
  imageLG: borderRadius.xl,     // 16px

  // Chips
  chip: borderRadius.full,      // Pill shape
} as const;

// Helper pour créer des coins arrondis spécifiques
export const createBorderRadius = (
  topLeft: keyof typeof borderRadius,
  topRight: keyof typeof borderRadius,
  bottomRight: keyof typeof borderRadius,
  bottomLeft: keyof typeof borderRadius
) => ({
  borderTopLeftRadius: borderRadius[topLeft],
  borderTopRightRadius: borderRadius[topRight],
  borderBottomRightRadius: borderRadius[bottomRight],
  borderBottomLeftRadius: borderRadius[bottomLeft],
});

// Coins arrondis uniquement en haut
export const borderRadiusTop = (size: keyof typeof borderRadius) => ({
  borderTopLeftRadius: borderRadius[size],
  borderTopRightRadius: borderRadius[size],
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
});

// Coins arrondis uniquement en bas
export const borderRadiusBottom = (size: keyof typeof borderRadius) => ({
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: borderRadius[size],
  borderBottomRightRadius: borderRadius[size],
});

export type BorderRadiusValue = keyof typeof borderRadius;

export default borderRadius;
