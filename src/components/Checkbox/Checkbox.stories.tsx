import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const TOPPINGS = ["Cheese", "Mushroom", "Olive"];

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  args: {
    label: "Accept terms",
    value: "terms",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  name: "Standalone",
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <CheckboxGroup label="Toppings" defaultValue={["Cheese"]}>
      {TOPPINGS.map((topping) => (
        <Checkbox key={topping} value={topping} label={topping} />
      ))}
    </CheckboxGroup>
  ),
};

export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <CheckboxGroup label="Toppings" orientation="horizontal" defaultValue={["Olive"]}>
      {TOPPINGS.map((topping) => (
        <Checkbox key={topping} value={topping} label={topping} />
      ))}
    </CheckboxGroup>
  ),
};

export const WithHelperText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <CheckboxGroup label="Toppings" helperText="Pick as many as you like.">
      {TOPPINGS.map((topping) => (
        <Checkbox key={topping} value={topping} label={topping} />
      ))}
    </CheckboxGroup>
  ),
};

export const WithError: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <CheckboxGroup label="Toppings" error="Choose at least one topping.">
      {TOPPINGS.map((topping) => (
        <Checkbox key={topping} value={topping} label={topping} />
      ))}
    </CheckboxGroup>
  ),
};

export const DisabledOptions: Story = {
  name: "Disabled option and group",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CheckboxGroup label="One option disabled" defaultValue={["Cheese"]}>
        <Checkbox value="Cheese" label="Cheese" />
        <Checkbox value="Mushroom" label="Mushroom" />
        <Checkbox value="Olive" label="Olive (out of stock)" disabled />
      </CheckboxGroup>

      <CheckboxGroup label="Whole group disabled" defaultValue={["Cheese"]} disabled>
        <Checkbox value="Cheese" label="Cheese" />
        <Checkbox value="Mushroom" label="Mushroom" />
      </CheckboxGroup>
    </div>
  ),
};

export const SelectAll: Story = {
  name: "Select all (indeterminate)",
  parameters: { controls: { disable: true } },
  render: () => {
    const [selected, setSelected] = useState<string[]>(["Cheese"]);
    const all = selected.length === TOPPINGS.length;
    const some = selected.length > 0 && !all;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Checkbox
          label="Select all"
          checked={all}
          indeterminate={some}
          onChange={(event) => setSelected(event.target.checked ? [...TOPPINGS] : [])}
        />
        <div style={{ paddingLeft: 24 }}>
          <CheckboxGroup aria-label="Toppings" value={selected} onChange={setSelected}>
            {TOPPINGS.map((topping) => (
              <Checkbox key={topping} value={topping} label={topping} />
            ))}
          </CheckboxGroup>
        </div>
      </div>
    );
  },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CheckboxGroup label="Toppings" value={selected} onChange={setSelected}>
          {TOPPINGS.map((topping) => (
            <Checkbox key={topping} value={topping} label={topping} />
          ))}
        </CheckboxGroup>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{selected.join(", ") || "none"}</code>
        </span>
      </div>
    );
  },
};
