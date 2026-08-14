/**
 * TS mirror of colors.css / colors.semantic.css, for places that need
 * the raw values in JS (Storybook docs, color pickers, tests) rather
 * than a CSS var. Keep in sync with the .css files by hand — there's
 * no build step generating one from the other; `__test__/colors.test.ts`
 * parses the stylesheets and fails if the two drift apart.
 *
 * In app code prefer the CSS vars (or `colorVar()`), so colors follow
 * the active theme. The hex values here are per-theme snapshots and
 * don't flip on their own.
 */

export const accent = {
  50: '#f6f0ff',
  100: '#ece0ff',
  200: '#d9c2ff',
  300: '#c19dff',
  400: '#a672ff',
  500: '#8b47fa',
  600: '#7429e0',
  700: '#5d1fb8',
  800: '#461890',
  900: '#331269',
  950: '#1f0b40',
} as const;

export const neutral = {
  0: '#ffffff',
  50: '#f8f7fa',
  100: '#efedf3',
  200: '#e2dfe8',
  300: '#cac6d3',
  400: '#a29cae',
  500: '#79728a',
  600: '#5a5468',
  700: '#423d4d',
  800: '#2c2836',
  900: '#1a1720',
  950: '#0d0b12',
} as const;

export const danger = {
  50: '#fef3f2',
  100: '#fee4e2',
  200: '#fecdca',
  300: '#fda29b',
  400: '#f97066',
  500: '#f04438',
  600: '#d92d20',
  700: '#b42318',
  800: '#912018',
  900: '#7a271a',
  950: '#55160c',
} as const;

export type AccentStep = keyof typeof accent;
export type NeutralStep = keyof typeof neutral;
export type DangerStep = keyof typeof danger;

/** Every primitive scale, keyed by name — for iterating over the whole palette. */
export const palette = { accent, neutral, danger } as const;

export type PaletteName = keyof typeof palette;

/** Fixed across themes — see colors.semantic.css for why. */
export const accentFill = {
  bg: accent[700],
  text: accent[100],
} as const;

const themeless = {
  'accent-fill-bg': accentFill.bg,
  'accent-fill-text': accentFill.text,
} as const;

export const semanticColors = {
  light: {
    'bg-canvas': neutral[0],
    'bg-surface': neutral[50],
    'bg-subtle': neutral[100],
    text: neutral[900],
    'text-subtle': neutral[600],
    'text-inverse': neutral[0],
    border: neutral[200],
    'border-strong': neutral[300],
    accent: accent[600],
    'accent-hover': accent[700],
    'accent-subtle-bg': accent[50],
    'accent-subtle-text': accent[700],
    ...themeless,
    danger: danger[700],
    'danger-border': danger[500],
    scrim: 'rgb(0 0 0 / 0.45)',
    'accent-tint-1': accent[50],
    'accent-tint-2': accent[100],
    'accent-tint-3': accent[200],
    'accent-tint-4': accent[300],
    'accent-on-tint': accent[900],
  },
  dark: {
    'bg-canvas': neutral[950],
    'bg-surface': neutral[900],
    'bg-subtle': neutral[800],
    text: neutral[50],
    'text-subtle': neutral[400],
    'text-inverse': neutral[950],
    border: neutral[700],
    'border-strong': neutral[600],
    accent: accent[400],
    'accent-hover': accent[300],
    'accent-subtle-bg': accent[900],
    'accent-subtle-text': accent[200],
    ...themeless,
    danger: danger[300],
    'danger-border': danger[400],
    scrim: 'rgb(0 0 0 / 0.65)',
    'accent-tint-1': accent[950],
    'accent-tint-2': accent[900],
    'accent-tint-3': accent[800],
    'accent-tint-4': accent[700],
    'accent-on-tint': accent[100],
  },
} as const;

export type ColorTheme = keyof typeof semanticColors;
export type SemanticColorName = keyof typeof semanticColors.light;

/**
 * The CSS var for a semantic token, ready to drop into an inline style or a
 * styled-component. Unlike the hex values above it stays theme-aware:
 *
 *   <div style={{ background: colorVar('bg-surface') }} />
 */
export function colorVar(name: SemanticColorName): `var(--color-${SemanticColorName})` {
  return `var(--color-${name})`;
}

/**
 * The CSS var for a primitive step, e.g. `paletteVar('accent', 600)`. Reach for
 * `colorVar()` first — primitives carry no meaning and don't respond to theme.
 */
export function paletteVar<S extends PaletteName>(
  scale: S,
  step: keyof (typeof palette)[S],
): string {
  return `var(--color-${scale}-${String(step)})`;
}
