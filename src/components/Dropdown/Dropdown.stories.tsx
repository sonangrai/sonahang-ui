import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Dropdown } from "./Dropdown";
import { DropdownItem } from "./DropdownItem";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownSeparator } from "./DropdownSeparator";
import { DropdownTrigger } from "./DropdownTrigger";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const icons = {
  edit: "M11 2.5 13.5 5 5.5 13H3v-2.5z",
  copy: "M5.5 5.5h7v7h-7zM3.5 10.5v-7h7",
  trash: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8",
};

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  subcomponents: { DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["bottom", "top"] },
    align: { control: "inline-radio", options: ["start", "end"] },
  },
  decorators: [
    (Story) => (
      // Room below the trigger so the menu isn't clipped by the canvas.
      <div style={{ minHeight: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dropdown {...args}>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onSelect={() => {}}>Edit</DropdownItem>
        <DropdownItem onSelect={() => {}}>Duplicate</DropdownItem>
        <DropdownItem onSelect={() => {}}>Move</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

export const WithIcons: Story = {
  name: "With icons and a destructive action",
  render: (args) => (
    <Dropdown {...args}>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem icon={<Icon d={icons.edit} />} onSelect={() => {}}>
          Edit
        </DropdownItem>
        <DropdownItem icon={<Icon d={icons.copy} />} onSelect={() => {}}>
          Duplicate
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Icon d={icons.trash} />} destructive onSelect={() => {}}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

export const WithDisabledItem: Story = {
  name: "With a disabled item",
  render: (args) => (
    <Dropdown {...args}>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onSelect={() => {}}>Edit</DropdownItem>
        <DropdownItem disabled>Duplicate (unavailable)</DropdownItem>
        <DropdownItem onSelect={() => {}}>Delete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

/** Aligned to the trigger's right edge — for menus at the end of a toolbar. */
export const AlignEnd: Story = {
  name: "Aligned to the end",
  args: { align: "end" },
  render: (args) => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Dropdown {...args}>
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onSelect={() => {}}>Edit</DropdownItem>
          <DropdownItem onSelect={() => {}}>Duplicate</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
};

export const PlacementTop: Story = {
  name: "Opening upwards",
  args: { placement: "top" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-end", minHeight: 200 }}>
      <Dropdown {...args}>
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onSelect={() => {}}>Edit</DropdownItem>
          <DropdownItem onSelect={() => {}}>Duplicate</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
};

/** `closeOnSelect={false}` keeps the menu open — for items that toggle. */
export const StaysOpen: Story = {
  name: "Item that keeps the menu open",
  parameters: { controls: { disable: true } },
  render: () => {
    const [checked, setChecked] = useState<string[]>(["grid"]);

    const toggle = (value: string) =>
      setChecked((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );

    return (
      <Dropdown>
        <DropdownTrigger>View options</DropdownTrigger>
        <DropdownMenu>
          {["grid", "labels", "details"].map((option) => (
            <DropdownItem key={option} closeOnSelect={false} onSelect={() => toggle(option)}>
              {checked.includes(option) ? "✓ " : "   "}
              {option}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState("none");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Dropdown open={open} onOpenChange={setOpen}>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownMenu>
            {["Edit", "Duplicate", "Move"].map((action) => (
              <DropdownItem key={action} onSelect={() => setLast(action)}>
                {action}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <span
          style={{
            fontFamily: "var(--font-family-sans)",
            fontSize: 14,
            color: "var(--color-text-subtle)",
          }}
        >
          Open: <code>{String(open)}</code> · Last action: <code>{last}</code>
        </span>
      </div>
    );
  },
};
