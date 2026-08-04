import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Switch } from "./Switch";
import { SwitchGroup } from "./SwitchGroup";

const NOTIFICATIONS = [
  { value: "email", label: "Email notifications" },
  { value: "push", label: "Push notifications" },
  { value: "digest", label: "Weekly digest" },
];

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    labelPosition: { control: "inline-radio", options: ["left", "right"] },
  },
  args: {
    label: "Email notifications",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = {
  args: {
    defaultChecked: true,
  },
};

export const LabelLeft: Story = {
  name: "Label on the left",
  args: {
    labelPosition: "left",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledOn: Story = {
  name: "Disabled and on",
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  name: "Without a visible label",
  args: {
    label: undefined,
    "aria-label": "Email notifications",
  },
};

/** A settings list — the layout switches are usually built for. */
export const SettingsList: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [settings, setSettings] = useState({
      email: true,
      push: false,
      digest: true,
    });

    const rows = [
      { key: "email", label: "Email notifications" },
      { key: "push", label: "Push notifications" },
      { key: "digest", label: "Weekly digest" },
    ] as const;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 320 }}>
        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "8px 0",
            }}
          >
            <Switch
              label={row.label}
              labelPosition="left"
              checked={settings[row.key]}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, [row.key]: event.target.checked }))
              }
            />
          </div>
        ))}
      </div>
    );
  },
};

export const Grouped: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SwitchGroup label="Notifications" defaultValue={["email", "digest"]}>
      {NOTIFICATIONS.map((item) => (
        <Switch key={item.value} value={item.value} label={item.label} />
      ))}
    </SwitchGroup>
  ),
};

export const GroupedSettingsList: Story = {
  name: "Group as a settings list",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <SwitchGroup
        label="Notifications"
        labelPosition="left"
        helperText="These apply immediately."
        defaultValue={["email"]}
      >
        {NOTIFICATIONS.map((item) => (
          <Switch key={item.value} value={item.value} label={item.label} />
        ))}
      </SwitchGroup>
    </div>
  ),
};

export const GroupHorizontal: Story = {
  name: "Group, horizontal",
  parameters: { controls: { disable: true } },
  render: () => (
    <SwitchGroup label="Notifications" orientation="horizontal" defaultValue={["push"]}>
      {NOTIFICATIONS.map((item) => (
        <Switch key={item.value} value={item.value} label={item.label} />
      ))}
    </SwitchGroup>
  ),
};

export const GroupWithError: Story = {
  name: "Group with an error",
  parameters: { controls: { disable: true } },
  render: () => (
    <SwitchGroup label="Notifications" error="Turn on at least one channel.">
      {NOTIFICATIONS.map((item) => (
        <Switch key={item.value} value={item.value} label={item.label} />
      ))}
    </SwitchGroup>
  ),
};

export const GroupDisabled: Story = {
  name: "Group disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <SwitchGroup label="Notifications" defaultValue={["email"]} disabled>
      {NOTIFICATIONS.map((item) => (
        <Switch key={item.value} value={item.value} label={item.label} />
      ))}
    </SwitchGroup>
  ),
};

export const GroupControlled: Story = {
  name: "Group, controlled",
  parameters: { controls: { disable: true } },
  render: () => {
    const [on, setOn] = useState<string[]>(["email"]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SwitchGroup label="Notifications" value={on} onChange={setOn}>
          {NOTIFICATIONS.map((item) => (
            <Switch key={item.value} value={item.value} label={item.label} />
          ))}
        </SwitchGroup>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          On: <code>{on.join(", ") || "none"}</code>
        </span>
      </div>
    );
  },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [on, setOn] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Switch
          label="Email notifications"
          checked={on}
          onChange={(event) => setOn(event.target.checked)}
        />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          State: <code>{on ? "on" : "off"}</code>
        </span>
      </div>
    );
  },
};
