import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumb } from "../Breadcrumb";
import { BreadcrumbItem } from "../BreadcrumbItem";

const Trail = () => (
  <Breadcrumb>
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/components">Components</BreadcrumbItem>
    <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
  </Breadcrumb>
);

const separators = (container: HTMLElement) =>
  container.querySelectorAll(".sh-breadcrumb__separator");

describe("Breadcrumb", () => {
  describe("structure", () => {
    it("is a navigation landmark", () => {
      render(<Trail />);

      expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    });

    it("accepts a custom landmark name", () => {
      render(
        <Breadcrumb aria-label="You are here">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByRole("navigation", { name: "You are here" })).toBeInTheDocument();
    });

    it("uses an ordered list, since the order is meaningful", () => {
      const { container } = render(<Trail />);

      expect(container.querySelector("ol")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("renders one item per child", () => {
      render(<Trail />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Components")).toBeInTheDocument();
      expect(screen.getByText("Breadcrumb")).toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("renders a link for crumbs with an href", () => {
      render(<Trail />);

      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute(
        "href",
        "/components",
      );
    });

    it("renders plain text for crumbs without an href", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Archive</BreadcrumbItem>
          <BreadcrumbItem href="/now">Now</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.queryByRole("link", { name: "Archive" })).not.toBeInTheDocument();
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });

    it("forwards anchor attributes", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/" target="_blank" rel="noreferrer">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>,
      );

      const link = screen.getByRole("link", { name: "Home" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("renders a caller-supplied element as-is", () => {
      // How a router's <Link> is used: no href, own element as children.
      render(
        <Breadcrumb>
          <BreadcrumbItem>
            <a href="/" data-router-link>
              Home
            </a>
          </BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-router-link");
    });
  });

  describe("the current page", () => {
    it("marks the last crumb as current", () => {
      render(<Trail />);

      expect(screen.getByText("Breadcrumb")).toHaveAttribute("aria-current", "page");
    });

    it("marks only the last crumb", () => {
      const { container } = render(<Trail />);

      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });

    it("never links the current crumb", () => {
      // Linking to the page you're already on is noise.
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/here">Here</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.queryByRole("link", { name: "Here" })).not.toBeInTheDocument();
      expect(screen.getByText("Here")).toHaveAttribute("aria-current", "page");
    });

    it("lets an earlier crumb be marked current explicitly", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Components</BreadcrumbItem>
          <BreadcrumbItem href="/detail">Detail</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByText("Components")).toHaveAttribute("aria-current", "page");
    });

    it("lets the last crumb opt out of being current", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/last" current={false}>
            Last
          </BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByRole("link", { name: "Last" })).toBeInTheDocument();
      expect(screen.queryByText("Last")).not.toHaveAttribute("aria-current");
    });

    it("treats a lone crumb as the current page", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByText("Home")).toHaveAttribute("aria-current", "page");
    });
  });

  describe("separators", () => {
    it("puts one between each pair of crumbs", () => {
      const { container } = render(<Trail />);

      expect(separators(container)).toHaveLength(2);
    });

    it("renders none for a lone crumb", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(separators(container)).toHaveLength(0);
    });

    it("hides them from assistive tech", () => {
      // The list structure already conveys the hierarchy.
      const { container } = render(<Trail />);

      for (const separator of separators(container)) {
        expect(separator).toHaveAttribute("aria-hidden", "true");
      }
    });

    it("defaults to an icon", () => {
      const { container } = render(<Trail />);

      expect(container.querySelector(".sh-breadcrumb__separator svg")).toBeInTheDocument();
    });

    it("accepts a custom separator", () => {
      const { container } = render(
        <Breadcrumb separator="/">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(separators(container)[0]).toHaveTextContent("/");
      expect(container.querySelector(".sh-breadcrumb__separator svg")).not.toBeInTheDocument();
    });

    it("does not follow an explicitly-current middle crumb with nothing", () => {
      // `current` changes styling, not position — separators track position.
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Middle</BreadcrumbItem>
          <BreadcrumbItem href="/end">End</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(separators(container)).toHaveLength(2);
    });
  });

  describe("misuse", () => {
    it("fails loudly outside a Breadcrumb", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<BreadcrumbItem>Orphan</BreadcrumbItem>)).toThrow(
        "<BreadcrumbItem> must be rendered inside <Breadcrumb>.",
      );

      spy.mockRestore();
    });
  });

  describe("styling hooks", () => {
    it("merges a className onto the nav", () => {
      const { container } = render(
        <Breadcrumb className="custom">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(container.querySelector(".sh-breadcrumb")).toHaveClass("custom");
    });

    it("merges a className onto an item", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem className="custom">Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(container.querySelector(".sh-breadcrumb__item")).toHaveClass("custom");
    });

    it("forwards arbitrary nav attributes", () => {
      render(
        <Breadcrumb data-testid="trail">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(screen.getByTestId("trail")).toBeInTheDocument();
    });
  });
});
