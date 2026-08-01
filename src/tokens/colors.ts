/**
 * TS mirror of colors.css / colors.semantic.css, for places that need
 * the raw values in JS (Storybook docs, color pickers, tests) rather
 * than a CSS var. Keep in sync with the .css files by hand — there's
 * no build step generating one from the other.
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

export type AccentStep = keyof typeof accent;
export type NeutralStep = keyof typeof neutral;

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
  },
} as const;

/** Fixed across themes — see colors.semantic.css for why. */
export const accentFill = {
  bg: accent[700],
  text: accent[100],
} as const;
