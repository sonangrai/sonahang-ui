import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanel } from "./TabPanel";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activation: { control: "inline-radio", options: ["automatic", "manual"] },
  },
  args: {
    defaultValue: "overview",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = (
  <>
    <TabPanel value="overview">
      A summary of the project, its goals, and where it currently stands.
    </TabPanel>
    <TabPanel value="activity">Recent commits, reviews, and deployments.</TabPanel>
    <TabPanel value="settings">Visibility, collaborators, and integrations.</TabPanel>
  </>
);

const list = (
  <TabList aria-label="Project sections">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
);

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      {list}
      {panels}
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <Tabs {...args}>
      {list}
      {panels}
    </Tabs>
  ),
};

/** Arrow keys move focus; Enter or Space selects. Use when panels are costly. */
export const ManualActivation: Story = {
  name: "Manual activation",
  args: {
    activation: "manual",
  },
  render: (args) => (
    <Tabs {...args}>
      {list}
      {panels}
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  name: "With a disabled tab",
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity" disabled>
          Activity
        </Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      {panels}
    </Tabs>
  ),
};

/** Unselected panels stay mounted, so their state survives a switch. */
export const KeepMounted: Story = {
  name: "Preserving panel state",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="draft">
      <TabList aria-label="Editor">
        <Tab value="draft">Draft</Tab>
        <Tab value="preview">Preview</Tab>
      </TabList>
      <TabPanel value="draft" keepMounted>
        <textarea
          defaultValue="Type here, switch tabs, and come back."
          rows={4}
          style={{ width: "100%", fontFamily: "inherit", fontSize: 14, padding: 8 }}
        />
      </TabPanel>
      <TabPanel value="preview" keepMounted>
        The draft above keeps its contents while this panel is showing.
      </TabPanel>
    </Tabs>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [tab, setTab] = useState("overview");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Tabs value={tab} onChange={setTab}>
          {list}
          {panels}
        </Tabs>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{tab}</code>
        </span>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  name: "Many tabs",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="tab-1">
      <TabList aria-label="Numbered sections">
        {Array.from({ length: 7 }, (_, index) => (
          <Tab key={index} value={`tab-${index + 1}`}>
            Section {index + 1}
          </Tab>
        ))}
      </TabList>
      {Array.from({ length: 7 }, (_, index) => (
        <TabPanel key={index} value={`tab-${index + 1}`}>
          Content for section {index + 1}.
        </TabPanel>
      ))}
    </Tabs>
  ),
};
