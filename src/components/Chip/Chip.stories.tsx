import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Chip } from "./Chip";
import { chipActions, chipVariants } from "./chip.tokens";

const meta = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: { control: "select", options: chipVariants },
    action: { control: "select", options: [...chipActions, undefined] },
    disabled: { control: "boolean" },
  },
  args: {
    children: "React",
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Remove: Story = {
  args: {
    action: "remove",
  },
};

export const Add: Story = {
  args: {
    variant: "outline",
    action: "add",
  },
};

export const NoAction: Story = {
  name: "Without an action",
  args: {
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    action: "remove",
    disabled: true,
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {chipVariants.map((variant) => (
        <Chip key={variant} variant={variant} action="remove">
          {variant}
        </Chip>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  name: "Add and remove",
  parameters: { controls: { disable: true } },
  render: () => {
    const all = ["React", "Vite", "TypeScript", "Storybook"];
    const [selected, setSelected] = useState<string[]>(["React", "Vite"]);
    const available = all.filter((item) => !selected.includes(item));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 26 }}>
          {selected.map((item) => (
            <Chip
              key={item}
              action="remove"
              onAction={() => setSelected((prev) => prev.filter((i) => i !== item))}
            >
              {item}
            </Chip>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 26 }}>
          {available.map((item) => (
            <Chip
              key={item}
              variant="outline"
              action="add"
              onAction={() => setSelected((prev) => [...prev, item])}
            >
              {item}
            </Chip>
          ))}
        </div>
      </div>
    );
  },
};
