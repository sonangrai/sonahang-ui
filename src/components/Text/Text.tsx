import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { defaultElement } from './text.tokens';
import type { TextColor, TextVariant, TextWeight } from './text.tokens';
import './Text.css';

type TextOwnProps<E extends ElementType> = {
  /** Element to render. Defaults to the semantically correct tag for `variant`. */
  as?: E;
  /** Typography scale to apply. */
  variant?: TextVariant;
  /** Semantic color token to use. */
  color?: TextColor;
  /** Overrides the variant's default font weight. */
  weight?: TextWeight;
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
};

export type TextProps<E extends ElementType = 'p'> = TextOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof TextOwnProps<E>>;

/** Typography primitive for the design system — renders any variant as any element. */
export function Text<E extends ElementType = 'p'>({
  as,
  variant = 'body',
  color = 'default',
  weight,
  align,
  className,
  style,
  children,
  ...props
}: TextProps<E>) {
  const Component = as ?? defaultElement[variant];
  const classes = ['sh-text', `sh-text--${variant}`, `sh-text--color-${color}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={classes}
      style={{
        ...(weight ? { fontWeight: `var(--font-weight-${weight})` } : undefined),
        ...(align ? { textAlign: align } : undefined),
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
