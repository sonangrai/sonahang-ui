import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBlock } from "./CodeBlock";

const SAMPLE = `import { Button } from 'sonahang-ui';

export function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="save-bar">
      <Button variant="secondary">Cancel</Button>
      <Button onClick={onSave}>Save changes</Button>
    </div>
  );
}`;

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    showLineNumbers: { control: "boolean" },
    wrap: { control: "boolean" },
    copyable: { control: "boolean" },
    maxHeight: { control: "text" },
  },
  args: {
    filename: "SaveBar.tsx",
    language: "tsx",
    children: SAMPLE,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With no filename, the header falls back to the language. */
export const LanguageOnly: Story = {
  name: "Language only",
  args: { filename: undefined },
};

/** With neither, the header is just the copy button. */
export const NoLabel: Story = {
  name: "No label",
  args: { filename: undefined, language: undefined },
};

export const WithLineNumbers: Story = {
  name: "With line numbers",
  args: { showLineNumbers: true },
};

/**
 * Long lines scroll sideways by default. The copy button always copies the
 * whole thing, not just what's visible.
 */
export const LongLines: Story = {
  name: "Long lines",
  args: {
    filename: "query.ts",
    language: "ts",
    children: `const rows = await db.select().from(projects).where(and(eq(projects.workspaceId, workspaceId), isNull(projects.archivedAt), gte(projects.updatedAt, since))).orderBy(desc(projects.updatedAt)).limit(50);`,
  },
};

/** `wrap` soft-wraps instead. Numbering marks the first row of a wrapped line. */
export const Wrapped: Story = {
  args: {
    ...LongLines.args,
    wrap: true,
    showLineNumbers: true,
  },
};

/** Past `maxHeight` the code scrolls rather than running down the page. */
export const Scrolling: Story = {
  args: {
    filename: "tokens.css",
    language: "css",
    showLineNumbers: true,
    maxHeight: 220,
    children: Array.from(
      { length: 30 },
      (_, index) => `  --color-step-${index + 1}: hsl(220 14% ${98 - index * 3}%);`,
    ).join("\n"),
  },
};

/** Without the copy button — for code that isn't meant to be lifted. */
export const NotCopyable: Story = {
  name: "Not copyable",
  args: { copyable: false, filename: "output.log", language: undefined },
};

/**
 * Indentation shared by every line is stripped, so a template literal can sit
 * at whatever depth the surrounding JSX happens to be at. Relative indentation
 * inside the block is untouched.
 */
export const IndentedSource: Story = {
  name: "Indented source",
  args: {
    filename: "dedent.tsx",
    language: "tsx",
    children: `
          function Example() {
            return (
              <CodeBlock filename="hello.ts">
                {\`const hi = 'there';\`}
              </CodeBlock>
            );
          }
        `,
  },
};

/**
 * **Nothing here highlights anything.** A highlighter is a large dependency
 * with its own opinions about themes and grammars, and this library ships
 * none — `language` only puts the conventional `language-*` class on the
 * `<code>` so whichever one the consumer already has can find the block.
 *
 * This story fakes what that looks like by colouring the class from CSS.
 */
export const WithAHighlighter: Story = {
  name: "With a highlighter",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <>
      <style>{`
        .language-tsx { color: var(--color-text); }
        .language-tsx::first-line { color: var(--color-accent); }
      `}</style>
      <CodeBlock {...args} />
      <p style={{ fontSize: 13, color: "var(--color-text-subtle)", marginTop: 12 }}>
        The first line is tinted by a stylesheet targeting <code>.language-tsx</code> —
        the same hook Prism, Shiki and highlight.js use.
      </p>
    </>
  ),
};
