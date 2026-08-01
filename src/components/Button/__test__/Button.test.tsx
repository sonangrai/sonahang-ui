import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../Button';
import { buttonSizes, buttonVariants } from '../button.tokens';

const PlusIcon = () => (
  <svg data-testid="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

describe('Button', () => {
  describe('rendering', () => {
    it('renders its children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies the primary/md classes by default', () => {
      render(<Button>Default</Button>);

      expect(screen.getByRole('button')).toHaveClass('sh-button--primary', 'sh-button--md');
    });

    it('keeps the native type default unless the consumer sets one', () => {
      const { unmount } = render(<Button>Submit</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('type');
      unmount();

      render(<Button type="button">Plain</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('merges a custom className with its own', () => {
      render(<Button className="custom">Styled</Button>);

      expect(screen.getByRole('button')).toHaveClass('sh-button', 'custom');
    });

    it('forwards arbitrary button attributes', () => {
      render(
        <Button aria-label="Save document" data-analytics="save">
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save document' });
      expect(button).toHaveAttribute('data-analytics', 'save');
    });
  });

  describe('variants and sizes', () => {
    it.each(buttonVariants)('applies the %s variant class', (variant) => {
      render(
        <Button variant={variant} icon={<PlusIcon />} aria-label={variant}>
          {variant}
        </Button>,
      );

      expect(screen.getByRole('button')).toHaveClass(`sh-button--${variant}`);
    });

    it.each(buttonSizes)('applies the %s size class', (size) => {
      render(<Button size={size}>{size}</Button>);

      expect(screen.getByRole('button')).toHaveClass(`sh-button--${size}`);
    });

    it('adds the full-width class only when fullWidth is set', () => {
      const { unmount } = render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('sh-button--full-width');
      unmount();

      render(<Button fullWidth>Wide</Button>);
      expect(screen.getByRole('button')).toHaveClass('sh-button--full-width');
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Click me
        </Button>,
      );

      await user.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('icons', () => {
    it('renders a left icon before the label', () => {
      const { container } = render(<Button icon={<PlusIcon />}>Add item</Button>);
      const content = container.querySelector('.sh-button__content')!;

      expect(content.firstElementChild).toHaveClass('sh-button__icon');
      expect(content).toHaveTextContent('Add item');
    });

    it('renders a right icon after the label', () => {
      const { container } = render(
        <Button icon={<PlusIcon />} iconPosition="right">
          Add item
        </Button>,
      );
      const content = container.querySelector('.sh-button__content')!;

      expect(content.lastElementChild).toHaveClass('sh-button__icon');
    });

    it('wraps the icon so it inherits the sizing box', () => {
      // Regression guard: an unwrapped <svg> falls back to its intrinsic
      // size and overflows the button.
      const { container } = render(
        <Button variant="icon" icon={<PlusIcon />} aria-label="Add item" />,
      );
      const icon = container.querySelector('.sh-button__icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toContainElement(screen.getByTestId('plus-icon'));
    });

    it('renders no icon wrapper when no icon is passed', () => {
      const { container } = render(<Button>No icon</Button>);

      expect(container.querySelector('.sh-button__icon')).not.toBeInTheDocument();
    });
  });

  describe('loading', () => {
    it('shows a spinner and keeps the label visible', () => {
      const { container } = render(<Button loading>Saving…</Button>);

      expect(container.querySelector('.sh-button__spinner')).toBeInTheDocument();
      // The whole point of the loading state: a message can be passed and read.
      expect(screen.getByRole('button')).toHaveTextContent('Saving…');
    });

    it('renders the spinner before the label', () => {
      const { container } = render(<Button loading>Saving…</Button>);
      const content = container.querySelector('.sh-button__content')!;

      expect(content.firstElementChild).toHaveClass('sh-button__spinner');
    });

    it('hides the spinner from assistive tech', () => {
      const { container } = render(<Button loading>Saving…</Button>);

      expect(container.querySelector('.sh-button__spinner')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('disables the button and marks it busy', () => {
      render(<Button loading>Saving…</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when idle', () => {
      render(<Button>Save</Button>);

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });

    it('does not call onClick while loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Saving…
        </Button>,
      );

      await user.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('swaps a left icon for the spinner', () => {
      const { container } = render(
        <Button loading icon={<PlusIcon />}>
          Saving…
        </Button>,
      );

      expect(container.querySelector('.sh-button__spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument();
    });

    it('keeps a right icon alongside the spinner', () => {
      const { container } = render(
        <Button loading icon={<PlusIcon />} iconPosition="right">
          Saving…
        </Button>,
      );

      expect(container.querySelector('.sh-button__spinner')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('replaces the icon with the spinner in the icon variant', () => {
      const { container } = render(
        <Button variant="icon" loading icon={<PlusIcon />} aria-label="Add item" />,
      );

      expect(container.querySelector('.sh-button__spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument();
    });
  });
});
