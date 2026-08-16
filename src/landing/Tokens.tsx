import { CodeBlock } from "../components/CodeBlock";
import { Text } from "../components/Text";
import { palette, paletteVar } from "../tokens/colors";
import type { PaletteName } from "../tokens/colors";
import { PACKAGE_NAME } from "./links";

/**
 * Generic over the scale name so `paletteVar` can narrow its `step` to that
 * scale's own keys — neutral starts at 0, the others at 50.
 */
function Scale<S extends PaletteName>({ scale, caption }: { scale: S; caption: string }) {
  const steps = Object.keys(palette[scale]) as (keyof (typeof palette)[S])[];

  return (
    <div className="tokens__scale">
      <Text variant="body-sm" color="subtle">
        {caption}
      </Text>
      <div className="tokens__swatches">
        {steps.map((step) => (
          <span
            key={String(step)}
            className="tokens__swatch"
            style={{ background: paletteVar(scale, step) }}
            title={`--color-${scale}-${String(step)}`}
          >
            <span className="tokens__swatch-step">{String(step)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const themingSnippet = `/* Components only read semantic vars, so a theme is a
   handful of overrides — no provider, no re-render. */
:root {
  --color-accent: #0f766e;
  --color-accent-hover: #115e59;
  --color-accent-subtle-bg: #f0fdfa;
}

/* Dark mode follows the OS on its own; data-theme pins it. */
:root[data-theme="dark"] {
  --color-accent: #5eead4;
}`;

export function Tokens() {
  return (
    <section className="section" id="tokens">
      <div className="section__head">
        <Text variant="heading-2">Tokens, not hard-coded colors</Text>
        <Text variant="body-lg" color="subtle">
          Components only ever reference semantic variables like{" "}
          <code className="inline-code">--color-bg-surface</code>. Swap the primitives
          underneath and the whole system moves with you — in CSS, or from JS via the token
          exports on <code className="inline-code">{PACKAGE_NAME}</code>.
        </Text>
      </div>

      <div className="tokens">
        <div className="tokens__scales">
          <Scale scale="accent" caption="Accent — one hue, eleven steps" />
          <Scale scale="neutral" caption="Neutral — text, surfaces, borders" />
          <Scale scale="danger" caption="Danger — errors and destructive actions" />
        </div>

        <CodeBlock filename="theme.css" language="css">
          {themingSnippet}
        </CodeBlock>
      </div>
    </section>
  );
}
