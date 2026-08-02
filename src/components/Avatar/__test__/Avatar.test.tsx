import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "../Avatar";
import { AvatarGroup } from "../AvatarGroup";
import { avatarSizes } from "../avatar.tokens";

const SRC = "https://example.test/ada.png";

describe("Avatar", () => {
  describe("image", () => {
    it("renders the image when a src is given", () => {
      render(<Avatar src={SRC} name="Ada Lovelace" />);

      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute("src", SRC);
    });

    it("uses alt over name for the image text", () => {
      render(<Avatar src={SRC} name="Ada Lovelace" alt="Portrait of Ada" />);

      expect(screen.getByRole("img", { name: "Portrait of Ada" })).toBeInTheDocument();
    });
  });

  describe("fallback", () => {
    it("shows initials when there is no image", () => {
      render(<Avatar name="Ada Lovelace" />);

      expect(screen.getByText("AL")).toBeInTheDocument();
    });

    it("falls back to initials when the image fails to load", () => {
      render(<Avatar src={SRC} name="Ada Lovelace" />);

      fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));

      expect(screen.queryByRole("img", { name: "Ada Lovelace" })?.tagName).not.toBe("IMG");
      expect(screen.getByText("AL")).toBeInTheDocument();
    });

    it("keeps the name accessible after the image fails", () => {
      render(<Avatar src={SRC} name="Ada Lovelace" />);

      fireEvent.error(screen.getByRole("img"));

      // The wrapper takes over the label, since the <img> is gone.
      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveClass("sh-avatar");
    });

    it("retries when a new src is supplied after a failure", () => {
      const { rerender } = render(<Avatar src={SRC} name="Ada Lovelace" />);
      fireEvent.error(screen.getByRole("img"));
      expect(screen.getByText("AL")).toBeInTheDocument();

      rerender(<Avatar src="https://example.test/ada-v2.png" name="Ada Lovelace" />);

      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute(
        "src",
        "https://example.test/ada-v2.png",
      );
    });

    it("shows a placeholder icon when there is no image and no name", () => {
      const { container } = render(<Avatar />);

      expect(container.querySelector(".sh-avatar__icon")).toBeInTheDocument();
    });

    it("renders custom children instead of initials", () => {
      render(<Avatar name="Ada Lovelace">🚀</Avatar>);

      expect(screen.getByText("🚀")).toBeInTheDocument();
      expect(screen.queryByText("AL")).not.toBeInTheDocument();
    });
  });

  describe("sizing", () => {
    it("defaults to md", () => {
      const { container } = render(<Avatar name="Ada Lovelace" />);

      expect(container.querySelector(".sh-avatar")).toHaveClass("sh-avatar--md");
    });

    it.each(avatarSizes)("applies the %s size class", (size) => {
      const { container } = render(<Avatar size={size} name="Ada Lovelace" />);

      expect(container.querySelector(".sh-avatar")).toHaveClass(`sh-avatar--${size}`);
    });

    it("merges a custom className", () => {
      const { container } = render(<Avatar className="custom" name="Ada Lovelace" />);

      expect(container.querySelector(".sh-avatar")).toHaveClass("sh-avatar", "custom");
    });
  });
});

describe("AvatarGroup", () => {
  it("renders every avatar when under the max", () => {
    render(
      <AvatarGroup max={5}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>,
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("collapses the remainder into a counter", () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
      </AvatarGroup>,
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
    expect(screen.queryByText("AT")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("gives the counter an accessible label", () => {
    render(
      <AvatarGroup max={1}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
      </AvatarGroup>,
    );

    expect(screen.getByRole("img", { name: "2 more" })).toBeInTheDocument();
  });

  it("shows all avatars when max is omitted", () => {
    render(
      <AvatarGroup>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
      </AvatarGroup>,
    );

    expect(screen.getByText("AT")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("applies its size to children that don't set one", () => {
    const { container } = render(
      <AvatarGroup size="lg">
        <Avatar name="Ada Lovelace" />
      </AvatarGroup>,
    );

    expect(container.querySelector(".sh-avatar")).toHaveClass("sh-avatar--lg");
  });

  it("lets an explicit size on a child win", () => {
    const { container } = render(
      <AvatarGroup size="lg">
        <Avatar name="Ada Lovelace" size="sm" />
      </AvatarGroup>,
    );

    expect(container.querySelector(".sh-avatar")).toHaveClass("sh-avatar--sm");
  });
});
