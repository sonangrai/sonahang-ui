import type { Meta, StoryObj } from "@storybook/react-vite";

import { Breadcrumb } from "./Breadcrumb";
import { BreadcrumbItem } from "./BreadcrumbItem";

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const TwoLevels: Story = {
  name: "Two levels",
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** A single crumb is the current page, so there's no separator at all. */
export const SingleCrumb: Story = {
  name: "Single crumb",
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem>Home</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const SlashSeparator: Story = {
  name: "Custom separator",
  render: (args) => (
    <Breadcrumb {...args} separator="/">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem>Installation</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** Crumbs without an `href` render as plain text rather than links. */
export const WithPlainCrumb: Story = {
  name: "With a non-linked crumb",
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem>Archive</BreadcrumbItem>
      <BreadcrumbItem href="/archive/2026">2026</BreadcrumbItem>
      <BreadcrumbItem>March</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** Long trails wrap rather than overflowing their container. */
export const LongTrail: Story = {
  name: "Long trail",
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Breadcrumb {...args}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/library">Library</BreadcrumbItem>
        <BreadcrumbItem href="/library/components">Components</BreadcrumbItem>
        <BreadcrumbItem href="/library/components/navigation">Navigation</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

/**
 * Omit `href` and pass your own element to use a router link. The current
 * crumb is never a link, so this only applies to the earlier ones.
 */
export const WithRouterLinks: Story = {
  name: "With router links",
  render: (args) => {
    // Stands in for a framework's <Link>.
    const Link = ({ to, children }: { to: string; children: string }) => (
      <a className="sh-breadcrumb__link" href={to} data-router-link>
        {children}
      </a>
    );

    return (
      <Breadcrumb {...args}>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/components">Components</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
      </Breadcrumb>
    );
  },
};
