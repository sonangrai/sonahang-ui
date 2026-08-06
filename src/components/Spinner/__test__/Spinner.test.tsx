import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "../Spinner";
import { spinnerSizes } from "../spinner.tokens";

describe("Spinner", () => {
  describe("semantics", () => {
    it("exposes a status", () => {
      render(<Spinner />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has an accessible name by default", () => {
      // A spinner with no name announces nothing at all.
      render(<Spinner />);

      expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    });

    it("accepts a custom label", () => {
      render(<Spinner label="Checking availability" />);

      expect(screen.getByRole("status", { name: "Checking availability" })).toBeInTheDocument();
    });

    it("keeps the name even when the label is hidden", () => {
      const { container } = render(<Spinner label="Loading results" />);

      // Hidden visually, but still in the accessibility tree.
      expect(container.querySelector(".sh-spinner__label--visually-hidden")).toBeInTheDocument();
      expect(screen.getByRole("status", { name: "Loading results" })).toBeInTheDocument();
    });

    it("hides the ring from assistive tech", () => {
      // The ring is decoration; the label carries the meaning.
      const { container } = render(<Spinner />);

      expect(container.querySelector(".sh-spinner__ring")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("label visibility", () => {
    it("hides the label visually by default", () => {
      const { container } = render(<Spinner label="Loading" />);

      expect(container.querySelector(".sh-spinner__label--visually-hidden")).toBeInTheDocument();
      expect(container.querySelector(".sh-spinner__label")).not.toBeInTheDocument();
    });

    it("shows the label when asked", () => {
      const { container } = render(<Spinner label="Loading" showLabel />);

      expect(container.querySelector(".sh-spinner__label")).toBeInTheDocument();
      expect(
        container.querySelector(".sh-spinner__label--visually-hidden"),
      ).not.toBeInTheDocument();
    });

    it("renders the text either way", () => {
      const hidden = render(<Spinner label="Loading" />);
      expect(hidden.getByText("Loading")).toBeInTheDocument();
      hidden.unmount();

      render(<Spinner label="Loading" showLabel />);
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("flags the labelled layout on the root", () => {
      const { container } = render(<Spinner showLabel />);

      expect(container.querySelector(".sh-spinner")).toHaveClass("sh-spinner--with-label");
    });
  });

  describe("sizing and styling hooks", () => {
    it("defaults to md", () => {
      const { container } = render(<Spinner />);

      expect(container.querySelector(".sh-spinner")).toHaveClass("sh-spinner--md");
    });

    it.each(spinnerSizes)("applies the %s size class", (size) => {
      const { container } = render(<Spinner size={size} />);

      expect(container.querySelector(".sh-spinner")).toHaveClass(`sh-spinner--${size}`);
    });

    it("merges a custom className", () => {
      const { container } = render(<Spinner className="custom" />);

      expect(container.querySelector(".sh-spinner")).toHaveClass("sh-spinner", "custom");
    });

    it("forwards arbitrary span attributes", () => {
      render(<Spinner data-testid="loader" />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });
  });
});
