import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import { buttonSizes, buttonVariants } from './button.tokens';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: { control: 'select', options: buttonVariants },
    size: { control: 'select', options: buttonSizes },
    iconPosition: { control: 'select', options: ['left', 'right'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    icon: <PlusIcon />,
    children: 'Add item',
  },
};

export const IconRight: Story = {
  args: {
    variant: 'outline',
    icon: <PlusIcon />,
    iconPosition: 'right',
    children: 'Add item',
  },
};

export const IconOnly: Story = {
  name: 'Icon-only',
  args: {
    variant: 'icon',
    icon: <PlusIcon />,
    'aria-label': 'Add item',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Saving',
  },
};

export const LoadingIconOnly: Story = {
  name: 'Loading (icon-only)',
  args: {
    variant: 'icon',
    icon: <PlusIcon />,
    loading: true,
    'aria-label': 'Add item',
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {buttonVariants
        .filter((variant) => variant !== 'icon')
        .map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      <Button variant="icon" icon={<PlusIcon />} aria-label="Add item" />
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {buttonSizes.map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};
