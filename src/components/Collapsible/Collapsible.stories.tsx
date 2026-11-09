import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Collapsible } from "./Collapsible";
import { CollapsibleItem } from "./CollapsibleItem";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  subcomponents: { CollapsibleItem },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

const svgProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const FolderIcon = () => (
  <svg {...svgProps}>
    <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.5 1.5h4.9A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5Z" />
  </svg>
);

const FileIcon = () => (
  <svg {...svgProps}>
    <path d="M4 2h5l3 3v9H4Z" />
    <path d="M9 2v3h3" />
  </svg>
);

const PlusIcon = () => (
  <svg {...svgProps}>
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);

const MinusIcon = () => (
  <svg {...svgProps}>
    <path d="M3.5 8h9" />
  </svg>
);

const fileTree = (
  <>
    <CollapsibleItem value="src" title="src" icon={<FolderIcon />}>
      <CollapsibleItem value="components" title="components" icon={<FolderIcon />}>
        <CollapsibleItem value="button" title="Button" icon={<FolderIcon />}>
          <CollapsibleItem value="button-tsx" title="Button.tsx" icon={<FileIcon />} />
          <CollapsibleItem value="button-css" title="Button.css" icon={<FileIcon />} />
        </CollapsibleItem>
        <CollapsibleItem value="input" title="Input" icon={<FolderIcon />}>
          <CollapsibleItem value="input-tsx" title="Input.tsx" icon={<FileIcon />} />
        </CollapsibleItem>
      </CollapsibleItem>
      <CollapsibleItem value="index-ts" title="index.ts" icon={<FileIcon />} />
    </CollapsibleItem>
    <CollapsibleItem value="public" title="public" icon={<FolderIcon />}>
      <CollapsibleItem value="favicon" title="favicon.svg" icon={<FileIcon />} />
    </CollapsibleItem>
    <CollapsibleItem value="package-json" title="package.json" icon={<FileIcon />} />
  </>
);

/** Nest items to add levels — depth and indentation follow the nesting. */
export const Default: Story = {
  args: { defaultValue: ["src", "components"] },
  render: (args) => <Collapsible {...args}>{fileTree}</Collapsible>,
};

/** Without icons, using the default chevron only. */
export const WithoutIcons: Story = {
  name: "Without icons",
  args: { defaultValue: ["getting-started"] },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleItem value="getting-started" title="Getting started">
        <CollapsibleItem value="install" title="Installation" />
        <CollapsibleItem value="theming" title="Theming">
          <CollapsibleItem value="tokens" title="Tokens" />
          <CollapsibleItem value="dark-mode" title="Dark mode" />
        </CollapsibleItem>
      </CollapsibleItem>
      <CollapsibleItem value="components" title="Components">
        <CollapsibleItem value="forms" title="Forms">
          <CollapsibleItem value="input" title="Input" />
          <CollapsibleItem value="select" title="Select" />
        </CollapsibleItem>
        <CollapsibleItem value="overlays" title="Overlays">
          <CollapsibleItem value="dialog" title="Dialog" />
        </CollapsibleItem>
      </CollapsibleItem>
    </Collapsible>
  ),
};

/** `expandedIcon` / `collapsedIcon` on the root replace the chevron at every level. */
export const CustomIndicators: Story = {
  name: "Custom open/closed icons",
  args: {
    defaultValue: ["src"],
    expandedIcon: <MinusIcon />,
    collapsedIcon: <PlusIcon />,
  },
  render: Default.render,
};

/** Items can override the indicator for themselves. */
export const PerItemIndicator: Story = {
  name: "Per-item indicator",
  args: { defaultValue: ["src"] },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleItem
        value="src"
        title="Uses +/−"
        expandedIcon={<MinusIcon />}
        collapsedIcon={<PlusIcon />}
      >
        <CollapsibleItem value="child" title="Default chevron here">
          <CollapsibleItem value="leaf" title="Leaf" />
        </CollapsibleItem>
      </CollapsibleItem>
    </Collapsible>
  ),
};

/** Panels take any content, not only further items. */
export const FreeFormContent: Story = {
  name: "Free-form content",
  args: { defaultValue: ["billing", "invoices"] },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleItem value="billing" title="Billing">
        <CollapsibleItem value="invoices" title="Invoices">
          <p>Two invoices need attention before the next billing cycle.</p>
        </CollapsibleItem>
        <CollapsibleItem value="usage" title="Usage">
          <p>You've used 62% of your monthly quota.</p>
        </CollapsibleItem>
      </CollapsibleItem>
    </Collapsible>
  ),
};

export const WithDisabledItem: Story = {
  name: "With a disabled item",
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleItem value="a" title="Available" icon={<FolderIcon />}>
        <CollapsibleItem value="a1" title="Child" icon={<FileIcon />} />
      </CollapsibleItem>
      <CollapsibleItem value="b" title="Locked" icon={<FolderIcon />} disabled>
        <CollapsibleItem value="b1" title="Hidden child" icon={<FileIcon />} />
      </CollapsibleItem>
    </Collapsible>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState<string[]>(["src"]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Collapsible value={open} onChange={setOpen}>
          {fileTree}
        </Collapsible>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Open: <code>{open.join(", ") || "none"}</code>
        </span>
      </div>
    );
  },
};
