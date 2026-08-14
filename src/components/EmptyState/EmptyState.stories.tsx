import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./EmptyState";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 4.5 4.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    headingLevel: { control: "select", options: [2, 3, 4, 5, 6] },
    icon: { control: false },
    action: { control: false },
    secondaryAction: { control: false },
  },
  args: {
    title: "No projects yet",
    description: "Projects keep your work organised. Create one to get started.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title, description and the default mark. */
export const Default: Story = {};

/** The call to action is a `<button>` when it's given an `onClick`. */
export const WithAction: Story = {
  name: "With an action",
  args: {
    action: { label: "New project", icon: <PlusIcon />, onClick: () => {} },
  },
};

/**
 * Give the action an `href` and it renders an `<a>` instead — wearing the
 * button's own classes, so it looks identical while keeping middle-click,
 * right-click and "open in new tab".
 */
export const WithALink: Story = {
  name: "With a link",
  args: {
    title: "Nothing to import",
    description: "Connect a source and its records will show up here.",
    action: { label: "Browse integrations", href: "/integrations" },
  },
};

/** A quieter second option sits beside the first. Either can be a link. */
export const WithTwoActions: Story = {
  name: "With two actions",
  args: {
    action: { label: "New project", icon: <PlusIcon />, onClick: () => {} },
    secondaryAction: { label: "Read the docs", href: "/docs" },
  },
};

/** A different mark for a different kind of nothing. */
export const NoResults: Story = {
  name: "No search results",
  args: {
    icon: <SearchIcon />,
    title: 'No results for "orbital"',
    description: "Check the spelling, or try a broader term.",
    secondaryAction: { label: "Clear search", onClick: () => {} },
  },
};

/** `icon={false}` drops the mark for a plainer, text-only placeholder. */
export const WithoutAnIcon: Story = {
  name: "Without an icon",
  args: {
    icon: false,
    title: "Nothing here yet",
    description: undefined,
  },
};

/** `size="sm"` for an empty state inside a card, panel or table. */
export const Small: Story = {
  args: {
    size: "sm",
    title: "No members",
    description: "Invite someone to collaborate.",
    action: { label: "Invite", onClick: () => {} },
  },
};

/** Anything extra goes below the actions. */
export const WithExtraContent: Story = {
  name: "With extra content",
  args: {
    action: { label: "New project", onClick: () => {} },
    children: (
      <>
        Stuck? <a href="/support">Talk to support</a>.
      </>
    ),
  },
};

/**
 * The title is a real heading, at whatever rank the surrounding page needs, so
 * the placeholder still appears in the document outline.
 */
export const InAPage: Story = {
  name: "In a page",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
      <h2 style={{ marginTop: 0 }}>Workspace</h2>
      <EmptyState {...args} headingLevel={3} action={{ label: "New project", onClick: () => {} }} />
    </div>
  ),
};
