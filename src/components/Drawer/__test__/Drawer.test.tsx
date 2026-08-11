import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Drawer } from "../Drawer";
import type { DrawerProps } from "../Drawer";
import { drawerSides, drawerSizes } from "../drawer.tokens";

/*
 * jsdom implements none of <dialog>'s behaviour, so src/test/dialogShim.ts
 * stands in for the open state and the cancel/close events. Everything the
 * browser owns — the top layer, ::backdrop, the focus trap, inertness of the
 * page behind, focus restoration — is NOT covered by anything below.
 */

const Filters = (props: Partial<DrawerProps>) => (
  <Drawer open onClose={() => {}} title="Filters" {...props}>
    Narrow the results.
  </Drawer>
);

const drawer = () => screen.queryByRole("dialog");

describe("Drawer", () => {
  describe("opening and closing", () => {
    it("is not shown when closed", () => {
      render(<Filters open={false} />);

      expect(drawer()).not.toBeInTheDocument();
    });

    it("shows when open", () => {
      render(<Filters />);

      expect(drawer()).toBeInTheDocument();
    });

    it("opens modally, not inline", () => {
      // The open *attribute* alone gives a non-modal dialog: no top layer, no
      // scrim, no focus trap.
      const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
      render(<Filters />);

      expect(showModal).toHaveBeenCalled();
      showModal.mockRestore();
    });

    it("closes the element when open goes false", () => {
      const { rerender } = render(<Filters />);
      rerender(<Filters open={false} />);

      expect(drawer()).not.toBeInTheDocument();
    });

    it("does not close itself", async () => {
      const user = userEvent.setup();
      render(<Filters onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(drawer()).toBeInTheDocument();
    });
  });

  describe("positioning", () => {
    it.each(drawerSides)("anchors to the %s edge", (side) => {
      render(<Filters side={side} />);

      expect(drawer()).toHaveClass(`sh-drawer--${side}`);
    });

    it("defaults to the right", () => {
      render(<Filters />);

      expect(drawer()).toHaveClass("sh-drawer--right");
    });

    it.each(drawerSizes)("applies the %s size", (size) => {
      render(<Filters size={size} />);

      expect(drawer()).toHaveClass(`sh-drawer--${size}`);
    });

    it("defaults to md", () => {
      render(<Filters />);

      expect(drawer()).toHaveClass("sh-drawer--md");
    });

    it("carries exactly one side and one size", () => {
      render(<Filters side="bottom" size="lg" />);

      const classes = drawer()?.className.split(" ") ?? [];
      expect(classes.filter((name) => drawerSides.some((s) => name === `sh-drawer--${s}`)))
        .toHaveLength(1);
      expect(classes.filter((name) => drawerSizes.some((s) => name === `sh-drawer--${s}`)))
        .toHaveLength(1);
    });

    it("merges a className", () => {
      render(<Filters className="custom" />);

      expect(drawer()).toHaveClass("custom");
    });
  });

  describe("accessibility", () => {
    it("names the drawer from its title", () => {
      render(<Filters />);

      expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    });

    it("renders the title as a heading", () => {
      render(<Filters />);

      expect(screen.getByRole("heading", { level: 2, name: "Filters" })).toBeInTheDocument();
    });

    it("describes the drawer from its description", () => {
      render(<Filters description="Applies to the current view." />);

      expect(drawer()).toHaveAccessibleDescription("Applies to the current view.");
    });

    it("leaves describedby off when there is no description", () => {
      render(<Filters />);

      expect(drawer()).not.toHaveAttribute("aria-describedby");
    });

    it("stays a dialog rather than an alertdialog", () => {
      // No role option by design — an urgent decision shouldn't slide in.
      render(<Filters />);

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Filters />
          <Filters />
        </>,
      );

      const ids = screen.getAllByRole("dialog").map((el) => el.getAttribute("aria-labelledby"));
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe("dismissal", () => {
    const clickScrim = async (user: ReturnType<typeof userEvent.setup>) => {
      const element = drawer() as HTMLElement;
      await user.pointer([
        { target: element, keys: "[MouseLeft>]" },
        { target: element, keys: "[/MouseLeft]" },
      ]);
    };

    it("closes from the × button", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("hides the × on request", () => {
      render(<Filters showClose={false} />);

      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("takes a custom close label", () => {
      render(<Filters closeLabel="Dismiss" />);

      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("closes on Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("can refuse Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} closeOnEscape={false} />);

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("stays open when Escape is refused", async () => {
      // The browser closes on Escape unless `cancel` is prevented.
      const Harness = () => {
        const [open, setOpen] = useState(true);
        return <Filters open={open} onClose={() => setOpen(false)} closeOnEscape={false} />;
      };
      const user = userEvent.setup();
      render(<Harness />);

      await user.keyboard("{Escape}");

      expect(drawer()).toBeInTheDocument();
    });

    it("closes on a scrim click", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} />);

      await clickScrim(user);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("can refuse a scrim click", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} closeOnBackdropClick={false} />);

      await clickScrim(user);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores clicks inside the panel", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} />);

      await user.click(screen.getByText("Narrow the results."));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores a drag that starts inside and ends on the scrim", async () => {
      // Selecting text in a field and releasing outside fires a click on the
      // element; treating that as a scrim click loses the user's work.
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Filters onClose={onClose} />);

      await user.pointer([
        { target: screen.getByText("Narrow the results."), keys: "[MouseLeft>]" },
        { target: drawer() as HTMLElement, keys: "[/MouseLeft]" },
      ]);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("layout", () => {
    it("renders a footer when given one", () => {
      render(<Filters footer={<button type="button">Apply</button>} />);

      expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    });

    it("leaves the footer out when not", () => {
      const { container } = render(<Filters />);

      expect(container.querySelector(".sh-drawer__footer")).not.toBeInTheDocument();
    });

    it("leaves the body out with no children", () => {
      const { container } = render(<Drawer open onClose={() => {}} title="Empty" />);

      expect(container.querySelector(".sh-drawer__body")).not.toBeInTheDocument();
    });
  });

  describe("focus", () => {
    it("focuses the element given by initialFocus", async () => {
      const WithInitialFocus = () => {
        const searchRef = useRef<HTMLInputElement>(null);

        return (
          <Drawer open onClose={() => {}} title="Filters" initialFocus={searchRef}>
            <input ref={searchRef} aria-label="Search" />
          </Drawer>
        );
      };

      render(<WithInitialFocus />);

      await waitFor(() => expect(screen.getByLabelText("Search")).toHaveFocus());
    });
  });

  describe("portal", () => {
    it("renders in place by default", () => {
      const { container } = render(
        <div>
          <Filters />
        </div>,
      );

      expect(container.querySelector(".sh-drawer")).toBeInTheDocument();
    });

    it("renders into the body when asked", () => {
      const { container } = render(
        <div>
          <Filters portal />
        </div>,
      );

      expect(container.querySelector(".sh-drawer")).not.toBeInTheDocument();
      expect(drawer()?.parentElement).toBe(document.body);
    });

    it("renders into a given element", () => {
      const host = document.createElement("div");
      document.body.appendChild(host);

      render(<Filters portal={host} />);

      expect(drawer()?.parentElement).toBe(host);
      host.remove();
    });

    it("still opens modally through a portal", () => {
      const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
      render(<Filters portal />);

      expect(showModal).toHaveBeenCalled();
      showModal.mockRestore();
    });

    it("escapes a surrounding form", async () => {
      // The reason to portal — the top layer already handles z-index and
      // clipping, but form ownership follows the DOM.
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Filters portal footer={<button type="submit">Apply</button>} />
        </form>,
      );

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits that form without a portal", async () => {
      // The contrast, pinned so it stays deliberate.
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Filters footer={<button type="submit">Apply</button>} />
        </form>,
      );

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("page scrolling", () => {
    it("freezes the page while open", () => {
      render(<Filters />);

      expect(document.body).toHaveStyle({ overflow: "hidden" });
    });

    it("releases it on close", () => {
      const { rerender } = render(<Filters />);
      rerender(<Filters open={false} />);

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });

    it("releases it on unmount", () => {
      const { unmount } = render(<Filters />);
      unmount();

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });

    it("can be opted out of", () => {
      render(<Filters lockScroll={false} />);

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });
  });
});
