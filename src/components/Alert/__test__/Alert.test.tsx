import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Alert } from "../Alert";
import { alertVariants } from "../alert.tokens";

describe("Alert", () => {
  describe("rendering", () => {
    it("renders its title and body", () => {
      render(<Alert title="Changes saved">Your profile has been updated.</Alert>);

      expect(screen.getByText("Changes saved")).toBeInTheDocument();
      expect(screen.getByText("Your profile has been updated.")).toBeInTheDocument();
    });

    it("renders with only a title", () => {
      const { container } = render(<Alert title="Changes saved" />);

      expect(screen.getByText("Changes saved")).toBeInTheDocument();
      expect(container.querySelector(".sh-alert__body")).not.toBeInTheDocument();
    });

    it("renders with only a body", () => {
      const { container } = render(<Alert>Your trial ends soon.</Alert>);

      expect(screen.getByText("Your trial ends soon.")).toBeInTheDocument();
      expect(container.querySelector(".sh-alert__title")).not.toBeInTheDocument();
    });

    it("merges a custom className", () => {
      const { container } = render(<Alert className="custom">Body</Alert>);

      expect(container.querySelector(".sh-alert")).toHaveClass("sh-alert", "custom");
    });

    it("forwards arbitrary div attributes", () => {
      render(<Alert data-testid="banner">Body</Alert>);

      expect(screen.getByTestId("banner")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("defaults to info", () => {
      const { container } = render(<Alert>Body</Alert>);

      expect(container.querySelector(".sh-alert")).toHaveClass("sh-alert--info");
    });

    it.each(alertVariants)("applies the %s variant class", (variant) => {
      const { container } = render(<Alert variant={variant}>Body</Alert>);

      expect(container.querySelector(".sh-alert")).toHaveClass(`sh-alert--${variant}`);
    });
  });

  describe("announcement", () => {
    // `alert` is assertive and interrupts the screen reader, so it's reserved
    // for the variants that warrant interrupting.
    it.each(["warning", "error"] as const)("announces %s assertively", (variant) => {
      render(<Alert variant={variant}>Body</Alert>);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it.each(["success", "info"] as const)("announces %s politely", (variant) => {
      render(<Alert variant={variant}>Body</Alert>);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("lets the role be overridden", () => {
      render(
        <Alert variant="error" role="status">
          Body
        </Alert>,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("can opt out of announcement entirely", () => {
      render(
        <Alert variant="error" role="none">
          Body
        </Alert>,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("icon", () => {
    it("shows a variant icon by default", () => {
      const { container } = render(<Alert variant="success">Body</Alert>);

      expect(container.querySelector(".sh-alert__icon svg")).toBeInTheDocument();
    });

    it("hides the icon from assistive tech", () => {
      // The variant is conveyed by the text and role, not the glyph.
      const { container } = render(<Alert variant="success">Body</Alert>);

      expect(container.querySelector(".sh-alert__icon svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("uses a different glyph per variant", () => {
      const paths = alertVariants.map((variant) => {
        const { container, unmount } = render(<Alert variant={variant}>Body</Alert>);
        const markup = container.querySelector(".sh-alert__icon")?.innerHTML ?? "";
        unmount();
        return markup;
      });

      expect(new Set(paths).size).toBe(alertVariants.length);
    });

    it("accepts a custom icon", () => {
      render(<Alert icon={<span data-testid="custom" />}>Body</Alert>);

      expect(screen.getByTestId("custom")).toBeInTheDocument();
    });

    it("omits the icon entirely when false", () => {
      const { container } = render(<Alert icon={false}>Body</Alert>);

      expect(container.querySelector(".sh-alert__icon")).not.toBeInTheDocument();
    });
  });

  describe("dismissing", () => {
    it("renders no dismiss button by default", () => {
      render(<Alert>Body</Alert>);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a dismiss button when onDismiss is given", () => {
      render(<Alert onDismiss={vi.fn()}>Body</Alert>);

      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("calls onDismiss when activated", async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<Alert onDismiss={onDismiss}>Body</Alert>);

      await user.click(screen.getByRole("button", { name: "Dismiss" }));

      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it("accepts a custom dismiss label", () => {
      render(
        <Alert onDismiss={vi.fn()} dismissLabel="Close notification">
          Body
        </Alert>,
      );

      expect(screen.getByRole("button", { name: "Close notification" })).toBeInTheDocument();
    });

    it("is type=button so it never submits a surrounding form", () => {
      render(<Alert onDismiss={vi.fn()}>Body</Alert>);

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("is keyboard reachable and activatable", async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<Alert onDismiss={onDismiss}>Body</Alert>);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });
});
