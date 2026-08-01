import type { Meta, StoryObj } from '@storybook/react-vite';

import { accent, neutral } from '../tokens/colors';

function contrastText(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#08060d' : '#ffffff';
}

function Scale({ name, steps }: { name: string; steps: Record<string, string> }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>{name}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(steps).map(([step, hex]) => (
          <div
            key={step}
            style={{
              width: 96,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #e5e4e7',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
            }}
          >
            <div
              style={{
                height: 56,
                background: hex,
                color: contrastText(hex),
                display: 'flex',
                alignItems: 'flex-end',
                padding: 4,
              }}
            >
              {step}
            </div>
            <div style={{ padding: 4 }}>{hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemanticSwatch({ label, varName }: { label: string; varName: string }) {
  return (
    <div
      style={{
        width: 140,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
      }}
    >
      <div style={{ height: 48, background: `var(${varName})` }} />
      <div style={{ padding: 4 }}>
        <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12 }}>{label}</div>
        <div>{varName}</div>
      </div>
    </div>
  );
}

const semanticTokens: Array<{ label: string; varName: string }> = [
  { label: 'Canvas', varName: '--color-bg-canvas' },
  { label: 'Surface', varName: '--color-bg-surface' },
  { label: 'Subtle bg', varName: '--color-bg-subtle' },
  { label: 'Border', varName: '--color-border' },
  { label: 'Border strong', varName: '--color-border-strong' },
  { label: 'Accent', varName: '--color-accent' },
  { label: 'Accent hover', varName: '--color-accent-hover' },
  { label: 'Accent subtle bg', varName: '--color-accent-subtle-bg' },
  { label: 'Accent fill bg', varName: '--color-accent-fill-bg' },
];

function ColorTokens() {
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Primitives</h2>
      <p style={{ fontSize: 13, color: '#6b6375', marginTop: 0 }}>
        Raw scales. Not used directly in components — see semantic tokens below.
      </p>
      <Scale name="Accent" steps={accent} />
      <Scale name="Neutral" steps={neutral} />

      <h2 style={{ fontSize: 18, marginBottom: 4, marginTop: 32 }}>Semantic tokens</h2>
      <p style={{ fontSize: 13, color: '#6b6375', marginTop: 0 }}>
        What components should consume. Values flip with light/dark mode — toggle your OS
        theme to see it. <code>accent-fill-bg</code>/<code>accent-fill-text</code> stay fixed
        across themes and aren't shown here since they don't change.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {semanticTokens.map((token) => (
          <SemanticSwatch key={token.varName} {...token} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Colors',
  component: ColorTokens,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ColorTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
