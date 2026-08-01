import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';
import { textColors, textVariants } from './text.tokens';

const meta = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: { control: 'select', options: textVariants },
    color: { control: 'select', options: textColors },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    align: { control: 'select', options: ['left', 'center', 'right'] },
    as: { control: 'text' },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {
  args: {
    variant: 'body',
  },
};

export const Heading: Story = {
  args: {
    variant: 'heading-1',
    children: 'Heading one',
  },
};

export const AccentColor: Story = {
  args: {
    variant: 'body',
    color: 'accent',
    children: 'Accent-colored text',
  },
};

export const CustomElement: Story = {
  name: 'Polymorphic "as"',
  args: {
    variant: 'heading-3',
    as: 'label',
    children: 'Rendered as a <label>',
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {textVariants.map((variant) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <Text
            variant="caption"
            color="subtle"
            style={{ width: 96, flexShrink: 0, fontFamily: 'ui-monospace, monospace' }}
          >
            {variant}
          </Text>
          <Text variant={variant}>The quick brown fox jumps over the lazy dog</Text>
        </div>
      ))}
    </div>
  ),
};
