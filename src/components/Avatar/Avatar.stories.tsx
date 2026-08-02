import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";
import { avatarSizes } from "./avatar.tokens";

// Inline data URI so the stories don't depend on a network image.
const PORTRAIT =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
       <rect width="80" height="80" fill="#5d1fb8"/>
       <circle cx="40" cy="30" r="14" fill="#d9c2ff"/>
       <circle cx="40" cy="72" r="24" fill="#d9c2ff"/>
     </svg>`,
  );

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: { control: "select", options: avatarSizes },
  },
  args: {
    name: "Ada Lovelace",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: PORTRAIT,
  },
};

export const Initials: Story = {
  name: "Initials (no image)",
  args: {},
};

export const BrokenImage: Story = {
  name: "Broken image → initials",
  args: {
    src: "https://example.invalid/missing.png",
  },
};

export const NoName: Story = {
  name: "No name → placeholder icon",
  args: {
    name: undefined,
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {avatarSizes.map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace" src={PORTRAIT} />
      ))}
    </div>
  ),
};

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup>
      <Avatar name="Ada Lovelace" src={PORTRAIT} />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
    </AvatarGroup>
  ),
};

export const GroupWithOverflow: Story = {
  name: "Group with max",
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup max={3} size="lg">
      <Avatar name="Ada Lovelace" src={PORTRAIT} />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Barbara Liskov" />
    </AvatarGroup>
  ),
};
