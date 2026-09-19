# sonahang-ui

A React component library and design system — 31 accessible, themeable components with zero runtime dependencies, documented in Storybook.

- **No runtime dependencies.** React is a peer dependency; nothing else ships.
- **No provider.** Theming is CSS variables on the root element, so there's nothing to wrap your app in and nothing re-renders when the theme changes.
- **Light and dark out of the box.** Dark mode follows the OS, or you pin it with `data-theme`.
- **Typed.** Written in TypeScript, with declarations bundled.

## Install

```bash
npm install sonahang-ui
```

React 19 is a peer dependency:

```bash
npm install react@^19 react-dom@^19
```

## Usage

Import the stylesheet once, at the entry point of your app:

```tsx
import 'sonahang-ui/style.css';
```

Then use the components anywhere:

```tsx
import { Button, Input, Alert } from 'sonahang-ui';

export function SignIn() {
  return (
    <form>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Alert variant="info">We'll email you a one-time code.</Alert>
      <Button type="submit" fullWidth>
        Send code
      </Button>
    </form>
  );
}
```

The stylesheet is a single file covering every component — it is not split per
component, so importing it once is enough regardless of what you use. The JS is
tree-shakeable, so unused components are dropped by your bundler.

> The stylesheet loads Inter from Google Fonts via `@import`. If you'd rather
> self-host the font or use your own, override `--font-family-sans`.

### Overriding styles with `className`

Every component forwards `className` to its root element, and the stylesheet is
wrapped in a single `@layer sonahang-ui` cascade layer. Unlayered CSS always
beats layered CSS regardless of specificity, so unlayered styles of your own —
a plain class, a CSS module — override a component without `!important` or
specificity hacks:

```tsx
<Button className="checkout-cta">Save</Button>
```

The one case that needs care is CSS you write inside a layer of your own,
since layers are ranked by the order they are first declared, not by
specificity. Tailwind v4 is the common example — it puts every utility in
`@layer utilities`. Declare the order explicitly, once, at the top of your
global stylesheet, and it no longer depends on which file imports first:

```css
@layer sonahang-ui, theme, base, components, utilities;
```

## Components

Layout and content: `Text`, `Logo`, `CodeBlock`, `EmptyState`, `Skeleton`

Actions: `Button`, `Dropdown`, `SegmentedControl`

Forms: `Input`, `InputOtp`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `RangeSlider`, `MinMaxSlider`, `FileDrop`

Feedback: `Alert`, `Spinner`, `ProgressBar`, `Tooltip`, `Dialog`, `Drawer`

Navigation: `Tabs`, `Breadcrumb`, `Pagination`, `Stepper`, `Accordion`

Data display: `Avatar`, `Tag`, `Chip`, `Carousel`

Every component, every prop, and every state is documented with live controls
in [Storybook](https://github.com/sonangrai/sonahang-ui) — that's the real
reference, this file is the summary.

## Theming

Components never reference a raw color. They read semantic CSS variables, so a
theme is a handful of overrides:

```css
:root {
  --color-accent: #0f766e;
  --color-accent-hover: #115e59;
  --color-accent-subtle-bg: #f0fdfa;
}
```

Dark mode applies automatically from `prefers-color-scheme`. To pin it, set
`data-theme` on the root element — that always wins over the OS preference:

```html
<html data-theme="dark">
```

The same values are exported for JS, for charts and canvases where a CSS
variable won't reach:

```ts
import { palette, semanticColors, colorVar } from 'sonahang-ui';

colorVar('bg-surface'); // 'var(--color-bg-surface)' — stays theme-aware
palette.accent[600]; // '#7429e0' — a fixed snapshot
```

## TypeScript

Declarations are bundled, so there's no `@types` package to install. Every
component exports its props type alongside it:

```ts
import type { ButtonProps, ButtonVariant } from 'sonahang-ui';
```

## Development

```bash
pnpm install
pnpm dev          # landing page at :5173
pnpm storybook    # docs at :6006
pnpm dev:all      # both at once
pnpm test         # vitest
pnpm build:lib    # the published package
```

## License

MIT © Sonahang Rai
