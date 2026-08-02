import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "../Chip";
import { chipVariants } from "../chip.tokens";

describe("Chip", () => {
  describe("rendering", () => {
    it("renders its children", () => {
      render(<Chip>React</Chip>);

      expect(screen.getByText("React")).toBeInTheDocument();
    });

    it("applies the primary variant by default", () => {
      const { container } = render(<Chip>React</Chip>);

      expect(container.querySelector(".sh-chip")).toHaveClass("sh-chip--primary");
    });

    it.each(chipVariants)("applies the %s variant class", (variant) => {
      const { container } = render(<Chip variant={variant}>React</Chip>);

      expect(container.querySelector(".sh-chip")).toHaveClass(`sh-chip--${variant}`);
    });

    it("merges a custom className with its own", () => {
      const { container } = render(<Chip className="custom">React</Chip>);

      expect(container.querySelector(".sh-chip")).toHaveClass("sh-chip", "custom");
    });

    it("forwards arbitrary span attributes", () => {
      render(<Chip data-testid="chip">React</Chip>);

      expect(screen.getByTestId("chip")).toBeInTheDocument();
    });
  });

  describe("action button", () => {
    it("renders no button when no action is given", () => {
      const { container } = render(<Chip>React</Chip>);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      // Drives the padding that makes room for the button.
      expect(container.querySelector(".sh-chip")).not.toHaveClass("sh-chip--with-action");
    });

    it("flags the chip as having an action", () => {
      const { container } = render(<Chip action="add">React</Chip>);

      expect(container.querySelector(".sh-chip")).toHaveClass("sh-chip--with-action");
    });

    it("names the remove button from the action and label", () => {
      render(<Chip action="remove">Vite</Chip>);

      expect(screen.getByRole("button", { name: "Remove Vite" })).toBeInTheDocument();
    });

    it("names the add button from the action and label", () => {
      render(<Chip action="add">Vite</Chip>);

      expect(screen.getByRole("button", { name: "Add Vite" })).toBeInTheDocument();
    });

    it("falls back to the bare verb when the label is not plain text", () => {
      render(
        <Chip action="remove">
          <em>Vite</em>
        </Chip>,
      );

      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    it("prefers an explicit actionLabel", () => {
      render(
        <Chip action="remove" actionLabel="Dismiss this filter">
          Vite
        </Chip>,
      );

      expect(screen.getByRole("button", { name: "Dismiss this filter" })).toBeInTheDocument();
    });

    it("is type=button so it never submits a surrounding form", () => {
      render(<Chip action="remove">Vite</Chip>);

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("calls onAction when activated", async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(
        <Chip action="remove" onAction={onAction}>
          Vite
        </Chip>,
      );

      await user.click(screen.getByRole("button"));

      expect(onAction).toHaveBeenCalledOnce();
    });

    it("is keyboard reachable and activatable", async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(
        <Chip action="remove" onAction={onAction}>
          Vite
        </Chip>,
      );

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalledOnce();
    });
  });

  describe("disabled", () => {
    it("disables the button and mutes the chip", () => {
      const { container } = render(
        <Chip action="remove" disabled>
          Vite
        </Chip>,
      );

      expect(screen.getByRole("button")).toBeDisabled();
      expect(container.querySelector(".sh-chip")).toHaveClass("sh-chip--disabled");
    });

    it("does not call onAction when disabled", async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(
        <Chip action="remove" disabled onAction={onAction}>
          Vite
        </Chip>,
      );

      await user.click(screen.getByRole("button"));

      expect(onAction).not.toHaveBeenCalled();
    });
  });
});
