import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton";
import { skeletonAnimations, skeletonVariants } from "./skeleton.tokens";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: { control: "select", options: skeletonVariants },
    animation: { control: "select", options: skeletonAnimations },
    lines: { control: { type: "number", min: 1, max: 8 } },
    width: { control: "text" },
    height: { control: "text" },
  },
  args: {
    variant: "text",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340, fontFamily: "var(--font-family-sans)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Paragraph: Story = {
  args: {
    lines: 4,
  },
};

export const Rectangular: Story = {
  args: {
    variant: "rectangular",
  },
};

export const Circular: Story = {
  args: {
    variant: "circular",
    width: 48,
  },
};

export const Animations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {skeletonAnimations.map((animation) => (
        <div key={animation} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>{animation}</span>
          <Skeleton variant="rectangular" height={64} animation={animation} />
        </div>
      ))}
    </div>
  ),
};

/** Sized in `em`, so text placeholders match whatever type they stand in for. */
export const MatchesTypeScale: Story = {
  name: "Matches the type scale",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 32 }}>
        <Skeleton />
      </div>
      <div style={{ fontSize: 16 }}>
        <Skeleton />
      </div>
      <div style={{ fontSize: 12 }}>
        <Skeleton />
      </div>
    </div>
  ),
};

/** A realistic composition: avatar, name, and a body of text. */
export const CardPlaceholder: Story = {
  name: "Card placeholder",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      // The region carries the loading state; the skeletons themselves are hidden.
      aria-busy="true"
      aria-label="Loading article"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        borderRadius: 10,
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton variant="circular" width={40} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width="40%" />
          <Skeleton width="25%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={140} />
      <Skeleton lines={3} />
    </div>
  ),
};
