import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBlock } from "../components/CodeBlock";
import { Text } from "../components/Text";
import { palette, semanticColors } from "./colors";
import type { PaletteName, SemanticColorName } from "./colors";

/*
 * Docs-only presentation for the color tokens. Swatches are painted from the
 * CSS vars rather than the hex values in colors.ts, so every one of them
 * follows Storybook's light/dark switcher instead of freezing on one theme.
 */

const mono = { fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)" } as const;

const card = {
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  overflow: "hidden",
} as const;

/** Steps at or above this read as dark, so labels on them flip to light. */
const DARK_FROM = 500;

function Ramp({ scale }: { scale: PaletteName }) {
  const steps = Object.entries(palette[scale]) as [string, string][];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {steps.map(([step, hex]) => (
        <div key={step} style={{ flex: "1 1 84px", minWidth: 84 }}>
          <div
            style={{
              ...card,
              background: `var(--color-${scale}-${step})`,
              color: Number(step) >= DARK_FROM ? palette[scale][50] : palette[scale][900],
              padding: "28px 8px 8px",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            {step}
          </div>
          <div style={{ ...mono, color: "var(--color-text-subtle)", padding: "4px 2px" }}>{hex}</div>
        </div>
      ))}
    </div>
  );
}

type TokenGroup = { name: string; hint: string; tokens: SemanticColorName[] };

const groups: TokenGroup[] = [
  {
    name: "Surfaces",
    hint: "Page, raised panels, and the quiet fill behind them.",
    tokens: ["bg-canvas", "bg-surface", "bg-subtle"],
  },
  {
    name: "Text",
    hint: "`text-inverse` is for text sitting on a filled accent or neutral block.",
    tokens: ["text", "text-subtle", "text-inverse"],
  },
  {
    name: "Borders",
    hint: "`border-strong` for inputs and anything that has to hold its own edge.",
    tokens: ["border", "border-strong"],
  },
  {
    name: "Accent",
    hint: "`accent-fill-*` is a fixed pairing — it stays put when the theme flips.",
    tokens: [
      "accent",
      "accent-hover",
      "accent-subtle-bg",
      "accent-subtle-text",
      "accent-fill-bg",
      "accent-fill-text",
    ],
  },
  {
    name: "Accent tints",
    hint: "A ladder for surfaces that differ by emphasis, not hue. `accent-on-tint` clears 4.5:1 on all four.",
    tokens: ["accent-tint-1", "accent-tint-2", "accent-tint-3", "accent-tint-4", "accent-on-tint"],
  },
  {
    name: "Danger",
    hint: "Validation errors and destructive actions — the only place a second hue is allowed.",
    tokens: ["danger", "danger-border"],
  },
  {
    name: "Overlay",
    hint: "Dims the page behind a modal surface. Semi-transparent, and heavier in dark mode.",
    tokens: ["scrim"],
  },
];

function TokenRow({ token }: { token: SemanticColorName }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "56px minmax(0, 1fr) 84px 84px",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      {/* Stripes sit under the swatch so a translucent token — the scrim — reads
          as translucent rather than as a flat grey. */}
      <div
        style={{
          ...card,
          height: 40,
          background:
            "repeating-linear-gradient(45deg, var(--color-bg-subtle) 0 6px, var(--color-bg-canvas) 6px 12px)",
        }}
      >
        <div style={{ height: "100%", background: `var(--color-${token})` }} />
      </div>
      <code style={{ ...mono, color: "var(--color-text)" }}>--color-{token}</code>
      <span style={{ ...mono, color: "var(--color-text-subtle)" }}>
        {semanticColors.light[token]}
      </span>
      <span style={{ ...mono, color: "var(--color-text-subtle)" }}>{semanticColors.dark[token]}</span>
    </div>
  );
}

const meta = {
  title: "Foundations/Colors",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Two layers. **Primitives** (`--color-accent-600`) are raw steps with no meaning attached;",
          "**semantic tokens** (`--color-bg-surface`) say what a color is _for_ and re-point themselves",
          "per theme. Components only ever consume the semantic layer — that's what makes dark mode a",
          "one-line change rather than an audit.",
          "",
          "Dark mode follows `prefers-color-scheme`, unless `data-theme=\"light\"|\"dark\"` is set on",
          "`<html>` — that always wins. Flip the toolbar's theme switcher and every swatch below moves",
          "with it.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What to reach for in app code. The two right-hand columns are the values the
 * token resolves to in each theme — the swatch itself is painted from the var,
 * so it shows whichever theme is active.
 */
export const SemanticTokens: Story = {
  name: "Semantic tokens",
  render: () => (
    <div style={{ display: "grid", gap: 28, maxWidth: 720 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px minmax(0, 1fr) 84px 84px",
          gap: 12,
          ...mono,
          color: "var(--color-text-subtle)",
        }}
      >
        <span />
        <span>Token</span>
        <span>Light</span>
        <span>Dark</span>
      </div>

      {groups.map((group) => (
        <section key={group.name}>
          <Text variant="heading-4" as="h3">
            {group.name}
          </Text>
          <Text variant="body-sm" color="subtle" style={{ margin: "4px 0 8px" }}>
            {group.hint}
          </Text>
          {group.tokens.map((token) => (
            <TokenRow key={token} token={token} />
          ))}
        </section>
      ))}
    </div>
  ),
};

/**
 * The brand hue, and the only chromatic scale in the system apart from danger.
 * Placeholder values — swap them in `colors.css` when real brand colors land.
 */
export const Accent: Story = {
  render: () => <Ramp scale="accent" />,
};

/** Text, surfaces and borders. Slightly warm, so it sits under the accent hue. */
export const Neutral: Story = {
  render: () => <Ramp scale="neutral" />,
};

/** Reserved for errors and destructive actions — never for decoration. */
export const Danger: Story = {
  render: () => <Ramp scale="danger" />,
};

/**
 * Colors ship with the same package as the components, so an app that already
 * imports the stylesheet has every token available — no config, no Tailwind
 * preset, no theme provider.
 */
export const InYourApp: Story = {
  name: "Using them in your app",
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
      <div>
        <Text variant="heading-4" as="h3">
          1. Import the stylesheet once
        </Text>
        <Text variant="body-sm" color="subtle" style={{ margin: "4px 0 8px" }}>
          At your app's entry point. It defines every var on <code>:root</code>, including the dark
          overrides.
        </Text>
        <CodeBlock filename="main.tsx" language="tsx">
          {`import 'sonahang-ui/style.css';`}
        </CodeBlock>
      </div>

      <div>
        <Text variant="heading-4" as="h3">
          2. Use the vars in your own CSS
        </Text>
        <Text variant="body-sm" color="subtle" style={{ margin: "4px 0 8px" }}>
          The default way. Theme switching then costs you nothing — the var re-points itself.
        </Text>
        <CodeBlock filename="Card.css" language="css">
          {`.card {
  background: var(--color-bg-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.card__action:hover {
  background: var(--color-accent-hover);
  color: var(--color-text-inverse);
}`}
        </CodeBlock>
      </div>

      <div>
        <Text variant="heading-4" as="h3">
          3. Or from JS, where a var won't reach
        </Text>
        <Text variant="body-sm" color="subtle" style={{ margin: "4px 0 8px" }}>
          Charts, <code>&lt;canvas&gt;</code>, and libraries that want a real color string.{" "}
          <code>colorVar()</code> keeps you theme-aware; <code>palette</code> and{" "}
          <code>semanticColors</code> hand over the hex when something insists on one.
        </Text>
        <CodeBlock filename="chart.ts" language="ts">
          {`import { palette, semanticColors, colorVar } from 'sonahang-ui';

// Theme-aware — resolves at paint time.
element.style.background = colorVar('bg-subtle'); // 'var(--color-bg-subtle)'

// A frozen value, when a var isn't an option.
const series = [palette.accent[600], palette.accent[300], palette.neutral[400]];
const gridLine = semanticColors.dark.border;`}
        </CodeBlock>
      </div>

      <div>
        <Text variant="heading-4" as="h3">
          4. Toggling the theme
        </Text>
        <Text variant="body-sm" color="subtle" style={{ margin: "4px 0 8px" }}>
          Set the attribute on <code>&lt;html&gt;</code>. Leave it off to follow the OS.
        </Text>
        <CodeBlock filename="theme.ts" language="ts">
          {`document.documentElement.dataset.theme = 'dark'; // or 'light'
delete document.documentElement.dataset.theme;   // back to the OS preference`}
        </CodeBlock>
      </div>
    </div>
  ),
};
