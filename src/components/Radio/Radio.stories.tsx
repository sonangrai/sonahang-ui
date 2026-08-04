import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    label: "Option",
    value: "option",
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  name: "Standalone",
  args: {
    name: "standalone",
  },
};

export const Checked: Story = {
  args: {
    name: "standalone-checked",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    name: "standalone-disabled",
    disabled: true,
  },
};

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup label="Plan" defaultValue="pro">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup label="Billing period" orientation="horizontal" defaultValue="monthly">
      <Radio value="monthly" label="Monthly" />
      <Radio value="yearly" label="Yearly" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup label="Plan" defaultValue="free" helperText="You can change this at any time.">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup label="Plan" error="Choose a plan to continue.">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>
  ),
};

export const DisabledOptions: Story = {
  name: "Disabled option and group",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <RadioGroup label="One option disabled" defaultValue="free">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="team" label="Team (unavailable)" disabled />
      </RadioGroup>

      <RadioGroup label="Whole group disabled" defaultValue="free" disabled>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [plan, setPlan] = useState("free");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <RadioGroup label="Plan" value={plan} onChange={setPlan}>
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
          <Radio value="team" label="Team" />
        </RadioGroup>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{plan}</code>
        </span>
      </div>
    );
  },
};
