import type { ElementType } from 'react';

export const textVariants = [
  'display',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'body-lg',
  'body',
  'body-sm',
  'caption',
] as const;

export type TextVariant = (typeof textVariants)[number];

export const textColors = ['default', 'subtle', 'inverse', 'accent'] as const;

export type TextColor = (typeof textColors)[number];

export const textWeights = ['regular', 'medium', 'semibold', 'bold'] as const;

export type TextWeight = (typeof textWeights)[number];

export const defaultElement: Record<TextVariant, ElementType> = {
  display: 'h1',
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  'heading-4': 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
};
