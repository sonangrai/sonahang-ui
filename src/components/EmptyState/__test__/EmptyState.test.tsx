import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  describe("content", () => {
    it("renders the title as a heading", () => {
      render(<EmptyState title="No projects yet" />);

      expect(screen.getByRole("heading", { level: 3, name: "No projects yet" })).toBeInTheDocument();
    });

    it("honours a custom heading level", () => {
      render(<EmptyState title="No projects yet" headingLevel={2} />);

      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    });

    it("renders the description", () => {
      render(<EmptyState title="No projects" description="Create one to get started." />);

      expect(screen.getByText("Create one to get started.")).toBeInTheDocument();
    });

    it("leaves the description out when there is none", () => {
      const { container } = render(<EmptyState title="No projects" />);

      expect(container.querySelector(".sh-empty-state__description")).not.toBeInTheDocument();
    });

    it("renders extra children below the actions", () => {
      render(
        <EmptyState title="No projects">
          <span>Need help?</span>
        </EmptyState>,
      );

      expect(screen.getByText("Need help?")).toBeInTheDocument();
    });
  });

  describe("icon", () => {
    it("falls back to a built-in mark", () => {
      const { container } = render(<EmptyState title="No projects" />);

      expect(container.querySelector(".sh-empty-state__icon svg")).toBeInTheDocument();
    });

    it("keeps the fallback out of the accessibility tree", () => {
      // It's decoration; the title carries the meaning.
      const { container } = render(<EmptyState title="No projects" />);

      expect(container.querySelector(".sh-empty-state__icon svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("takes a custom icon", () => {
      render(<EmptyState title="No projects" icon={<span data-testid="mine" />} />);

      expect(screen.getByTestId("mine")).toBeInTheDocument();
    });

    it("can be removed entirely", () => {
      const { container } = render(<EmptyState title="No projects" icon={false} />);

      expect(container.querySelector(".sh-empty-state__icon")).not.toBeInTheDocument();
    });

    it("treats null as no icon rather than empty space", () => {
      // `icon={condition ? <Icon /> : null}` is the natural way to write this,
      // and the wrapper carries the gap below the mark — around nothing it
      // leaves a stray band of space above the title.
      const { container } = render(<EmptyState title="No projects" icon={null} />);

      expect(container.querySelector(".sh-empty-state__icon")).not.toBeInTheDocument();
    });
  });

  describe("action as a button", () => {
    it("renders a button when there is no href", () => {
      render(<EmptyState title="No projects" action={{ label: "New project" }} />);

      expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
    });

    it("calls onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<EmptyState title="No projects" action={{ label: "New project", onClick }} />);

      await user.click(screen.getByRole("button", { name: "New project" }));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it("is a primary button by default", () => {
      render(<EmptyState title="No projects" action={{ label: "New project" }} />);

      expect(screen.getByRole("button", { name: "New project" })).toHaveClass(
        "sh-button--primary",
      );
    });

    it("takes a variant override", () => {
      render(
        <EmptyState title="No projects" action={{ label: "New project", variant: "outline" }} />,
      );

      expect(screen.getByRole("button", { name: "New project" })).toHaveClass(
        "sh-button--outline",
      );
    });

    it("renders an action icon", () => {
      render(
        <EmptyState
          title="No projects"
          action={{ label: "New project", icon: <span data-testid="plus" /> }}
        />,
      );

      expect(screen.getByTestId("plus")).toBeInTheDocument();
    });
  });

  describe("action as a link", () => {
    it("renders a link when given an href", () => {
      // Not a button with a click handler that navigates: middle-click,
      // right-click and "open in new tab" all depend on it being an anchor.
      render(<EmptyState title="No docs" action={{ label: "Read the docs", href: "/docs" }} />);

      const link = screen.getByRole("link", { name: "Read the docs" });
      expect(link).toHaveAttribute("href", "/docs");
    });

    it("is not also a button", () => {
      render(<EmptyState title="No docs" action={{ label: "Read the docs", href: "/docs" }} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("wears the button classes rather than a copy of the styling", () => {
      render(<EmptyState title="No docs" action={{ label: "Read the docs", href: "/docs" }} />);

      const link = screen.getByRole("link", { name: "Read the docs" });
      expect(link).toHaveClass("sh-button", "sh-button--primary", "sh-button--md");
    });

    it("adds rel protection when opening a new tab", () => {
      // Without it the opened page gets a handle on this one through
      // window.opener.
      render(
        <EmptyState
          title="No docs"
          action={{ label: "Docs", href: "https://example.com", target: "_blank" }}
        />,
      );

      expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
        "rel",
        "noopener noreferrer",
      );
    });

    it("leaves rel alone for a same-tab link", () => {
      render(<EmptyState title="No docs" action={{ label: "Docs", href: "/docs" }} />);

      expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("rel");
    });

    it("respects an explicit rel", () => {
      render(
        <EmptyState
          title="No docs"
          action={{ label: "Docs", href: "/docs", target: "_blank", rel: "nofollow" }}
        />,
      );

      expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("rel", "nofollow");
    });
  });

  describe("two actions", () => {
    it("renders both", () => {
      render(
        <EmptyState
          title="No projects"
          action={{ label: "New project" }}
          secondaryAction={{ label: "Import", href: "/import" }}
        />,
      );

      expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Import" })).toBeInTheDocument();
    });

    it("makes the second one quieter", () => {
      render(
        <EmptyState
          title="No projects"
          action={{ label: "New project" }}
          secondaryAction={{ label: "Import" }}
        />,
      );

      expect(screen.getByRole("button", { name: "Import" })).toHaveClass("sh-button--secondary");
    });

    it("can be the only action", () => {
      render(<EmptyState title="No projects" secondaryAction={{ label: "Import" }} />);

      expect(screen.getByRole("button", { name: "Import" })).toBeInTheDocument();
    });

    it("leaves the row out when there are none", () => {
      const { container } = render(<EmptyState title="No projects" />);

      expect(container.querySelector(".sh-empty-state__actions")).not.toBeInTheDocument();
    });
  });

  describe("size", () => {
    it("defaults to md", () => {
      const { container } = render(<EmptyState title="No projects" />);

      expect(container.firstElementChild).toHaveClass("sh-empty-state--md");
    });

    it("applies the sm modifier", () => {
      const { container } = render(<EmptyState title="No projects" size="sm" />);

      expect(container.firstElementChild).toHaveClass("sh-empty-state--sm");
    });

    it("shrinks the actions to match", () => {
      render(<EmptyState title="No projects" size="sm" action={{ label: "New" }} />);

      expect(screen.getByRole("button", { name: "New" })).toHaveClass("sh-button--sm");
    });

    it("shrinks a link action too", () => {
      render(<EmptyState title="No projects" size="sm" action={{ label: "New", href: "/new" }} />);

      expect(screen.getByRole("link", { name: "New" })).toHaveClass("sh-button--sm");
    });
  });

  describe("styling hooks", () => {
    it("merges a className", () => {
      const { container } = render(<EmptyState title="No projects" className="custom" />);

      expect(container.firstElementChild).toHaveClass("custom");
    });

    it("forwards other props to the root", () => {
      render(<EmptyState title="No projects" data-testid="empty" />);

      expect(screen.getByTestId("empty")).toBeInTheDocument();
    });
  });
});
