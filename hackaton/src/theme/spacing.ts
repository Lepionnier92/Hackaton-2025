/**
 * TENEX Workforce - Design System Spacing
 * Système d'espacement cohérent basé sur une échelle de 4px
 */

// Échelle de base (multiples de 4)
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

// Alias sémantiques pour les espacements
export const spacingSemantic = {
  // Espacements de composants
  componentXS: spacing[1],    // 4px
  componentSM: spacing[2],    // 8px
  componentMD: spacing[3],    // 12px
  componentLG: spacing[4],    // 16px
  componentXL: spacing[6],    // 24px
  component2XL: spacing[8],   // 32px

  // Padding de conteneur
  containerSM: spacing[3],    // 12px
  containerMD: spacing[4],    // 16px
  containerLG: spacing[6],    // 24px
  containerXL: spacing[8],    // 32px

  // Marges entre sections
  sectionSM: spacing[4],      // 16px
  sectionMD: spacing[6],      // 24px
  sectionLG: spacing[8],      // 32px
  sectionXL: spacing[12],     // 48px

  // Padding horizontal écran
  screenPaddingX: spacing[4], // 16px
  screenPaddingY: spacing[4], // 16px

  // Gap dans les grilles
  gridGapSM: spacing[2],      // 8px
  gridGapMD: spacing[3],      // 12px
  gridGapLG: spacing[4],      // 16px

  // Input/Form spacing
  inputPaddingX: spacing[4],  // 16px
  inputPaddingY: spacing[3],  // 12px
  formGap: spacing[4],        // 16px
  labelGap: spacing[2],       // 8px

  // Card spacing
  cardPadding: spacing[4],    // 16px
  cardGap: spacing[3],        // 12px

  // Button spacing
  buttonPaddingX: spacing[4], // 16px
  buttonPaddingY: spacing[3], // 12px
  buttonGap: spacing[2],      // 8px

  // List spacing
  listItemGap: spacing[3],    // 12px
  listItemPaddingY: spacing[3], // 12px

  // Header/Tab bar
  headerHeight: spacing[14],  // 56px
  tabBarHeight: spacing[16],  // 64px
  statusBarHeight: spacing[11], // 44px (iOS)
} as const;

// Helper pour créer des marges/paddings
export const createSpacing = (...values: (keyof typeof spacing)[]) => {
  return values.map(v => spacing[v]).join(' ');
};

export type SpacingValue = keyof typeof spacing;
export type SpacingSemanticValue = keyof typeof spacingSemantic;

export default spacing;
