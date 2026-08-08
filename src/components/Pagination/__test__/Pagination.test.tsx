import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "../Pagination";

const pageButton = (n: number) => screen.getByRole("button", { name: `Page ${n}` });
const prev = () => screen.getByRole("button", { name: "Previous page" });
const next = () => screen.getByRole("button", { name: "Next page" });

describe("Pagination", () => {
  describe("structure", () => {
    it("is a navigation landmark", () => {
      render(<Pagination count={5} />);

      expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    });

    it("accepts a custom landmark name", () => {
      render(<Pagination count={5} aria-label="Results pages" />);

      expect(screen.getByRole("navigation", { name: "Results pages" })).toBeInTheDocument();
    });

    it("renders a button per visible page", () => {
      render(<Pagination count={5} />);

      for (let page = 1; page <= 5; page += 1) {
        expect(pageButton(page)).toBeInTheDocument();
      }
    });

    it("renders nothing when there are no pages", () => {
      const { container } = render(<Pagination count={0} />);

      expect(container).toBeEmptyDOMElement();
    });

    it("gives every control type=button so none submits a form", () => {
      render(<Pagination count={5} />);

      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveAttribute("type", "button");
      }
    });
  });

  describe("current page", () => {
    it("starts at page one", () => {
      render(<Pagination count={5} />);

      expect(pageButton(1)).toHaveAttribute("aria-current", "page");
    });

    it("honours defaultPage", () => {
      render(<Pagination count={5} defaultPage={3} />);

      expect(pageButton(3)).toHaveAttribute("aria-current", "page");
    });

    it("marks exactly one page as current", () => {
      const { container } = render(<Pagination count={20} defaultPage={10} />);

      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });

    it("labels each page for screen readers", () => {
      // "3" alone doesn't say what it does.
      render(<Pagination count={5} />);

      expect(pageButton(3)).toHaveAccessibleName("Page 3");
    });
  });

  describe("selection", () => {
    it("moves on click", async () => {
      const user = userEvent.setup();
      render(<Pagination count={5} />);

      await user.click(pageButton(3));

      expect(pageButton(3)).toHaveAttribute("aria-current", "page");
    });

    it("reports the new page", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={5} onChange={onChange} />);

      await user.click(pageButton(3));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
    });

    it("does not fire when the current page is clicked again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={5} onChange={onChange} />);

      await user.click(pageButton(1));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("reflects a controlled page", () => {
      render(<Pagination count={5} page={4} />);

      expect(pageButton(4)).toHaveAttribute("aria-current", "page");
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={5} page={1} onChange={onChange} />);

      await user.click(pageButton(3));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
      expect(pageButton(1)).toHaveAttribute("aria-current", "page");
    });

    it("follows a controlled page change", () => {
      const { rerender } = render(<Pagination count={5} page={1} />);
      rerender(<Pagination count={5} page={5} />);

      expect(pageButton(5)).toHaveAttribute("aria-current", "page");
    });
  });

  describe("previous and next", () => {
    it("steps back and forward", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={5} defaultPage={3} onChange={onChange} />);

      await user.click(next());
      expect(onChange).toHaveBeenLastCalledWith(4);

      await user.click(prev());
      expect(onChange).toHaveBeenLastCalledWith(3);
    });

    it("disables previous on the first page", () => {
      render(<Pagination count={5} defaultPage={1} />);

      expect(prev()).toBeDisabled();
      expect(next()).toBeEnabled();
    });

    it("disables next on the last page", () => {
      render(<Pagination count={5} defaultPage={5} />);

      expect(next()).toBeDisabled();
      expect(prev()).toBeEnabled();
    });

    it("disables both when there is only one page", () => {
      render(<Pagination count={1} />);

      expect(prev()).toBeDisabled();
      expect(next()).toBeDisabled();
    });

    it("can be hidden", () => {
      render(<Pagination count={5} hidePrevNext />);

      expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
    });
  });

  describe("first and last", () => {
    it("are absent by default", () => {
      render(<Pagination count={20} defaultPage={10} />);

      expect(screen.queryByRole("button", { name: "First page" })).not.toBeInTheDocument();
    });

    it("jump to either end", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={20} defaultPage={10} showFirstLast onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "Last page" }));
      expect(onChange).toHaveBeenLastCalledWith(20);

      await user.click(screen.getByRole("button", { name: "First page" }));
      expect(onChange).toHaveBeenLastCalledWith(1);
    });

    it("are disabled at the matching end", () => {
      render(<Pagination count={20} defaultPage={1} showFirstLast />);

      expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Last page" })).toBeEnabled();
    });
  });

  describe("gaps", () => {
    it("renders a gap when pages are hidden", () => {
      const { container } = render(<Pagination count={20} defaultPage={10} />);

      expect(container.querySelectorAll(".sh-pagination__ellipsis")).toHaveLength(2);
    });

    it("keeps gaps out of the accessibility tree", () => {
      // There's no page to go to, so announcing them is noise.
      const { container } = render(<Pagination count={20} defaultPage={10} />);

      for (const gap of container.querySelectorAll(".sh-pagination__ellipsis")) {
        expect(gap).toHaveAttribute("aria-hidden", "true");
      }
    });

    it("keeps gaps out of the tab order", () => {
      render(<Pagination count={20} defaultPage={10} />);

      // Only real controls are buttons; a gap must never be one.
      const names = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"));
      expect(names).not.toContain(null);
    });

    it("renders none when every page fits", () => {
      const { container } = render(<Pagination count={5} />);

      expect(container.querySelectorAll(".sh-pagination__ellipsis")).toHaveLength(0);
    });
  });

  describe("disabled", () => {
    it("disables every control", () => {
      render(<Pagination count={20} defaultPage={10} showFirstLast disabled />);

      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
      }
    });

    it("does not fire onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination count={5} disabled onChange={onChange} />);

      await user.click(pageButton(3));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("labels", () => {
    it("accepts custom control labels", () => {
      render(
        <Pagination
          count={5}
          showFirstLast
          labels={{ previous: "Zurück", next: "Weiter", first: "Erste", last: "Letzte" }}
        />,
      );

      expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Erste" })).toBeInTheDocument();
    });

    it("accepts a custom page label", () => {
      render(<Pagination count={5} labels={{ page: (page) => `Seite ${page}` }} />);

      expect(screen.getByRole("button", { name: "Seite 3" })).toBeInTheDocument();
    });

    it("keeps the defaults for labels not overridden", () => {
      render(<Pagination count={5} labels={{ next: "Weiter" }} />);

      expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    });
  });

  describe("styling hooks", () => {
    it("flags the current page", () => {
      const { container } = render(<Pagination count={5} defaultPage={2} />);

      expect(container.querySelector(".sh-pagination__page--current")).toHaveTextContent("2");
    });

    it("merges a custom className", () => {
      const { container } = render(<Pagination count={5} className="custom" />);

      expect(container.querySelector(".sh-pagination")).toHaveClass("custom");
    });
  });
});
