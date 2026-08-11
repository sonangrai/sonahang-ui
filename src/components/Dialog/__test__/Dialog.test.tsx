import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Dialog } from "../Dialog";
import type { DialogProps } from "../Dialog";

/*
 * jsdom implements none of <dialog>'s behaviour, so src/test/dialogShim.ts
 * stands in for the open state and the cancel/close events. Everything the
 * browser owns — the top layer, ::backdrop, the focus trap, inertness of the
 * page behind, focus restoration — is NOT covered by anything below.
 */

const Confirm = (props: Partial<DialogProps>) => (
  <Dialog open onClose={() => {}} title="Delete project" {...props}>
    This can&apos;t be undone.
  </Dialog>
);

const dialog = () => screen.queryByRole("dialog");

/** Drives `open` from state, the way a real caller would. */
const Harness = ({ onClose, ...props }: Partial<DialogProps> = {}) => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        onClose?.();
      }}
      title="Delete project"
      {...props}
    >
      Body content
    </Dialog>
  );
};

describe("Dialog", () => {
  describe("opening and closing", () => {
    it("is not shown when closed", () => {
      render(<Confirm open={false} />);

      expect(dialog()).not.toBeInTheDocument();
    });

    it("shows when open", () => {
      render(<Confirm />);

      expect(dialog()).toBeInTheDocument();
    });

    it("opens modally, not inline", () => {
      // The open *attribute* alone gives a non-modal dialog: no top layer, no
      // backdrop, no focus trap. showModal is the whole point.
      const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
      render(<Confirm />);

      expect(showModal).toHaveBeenCalled();
      showModal.mockRestore();
    });

    it("closes the element when open goes false", () => {
      const { rerender } = render(<Confirm />);
      rerender(<Confirm open={false} />);

      expect(dialog()).not.toBeInTheDocument();
    });

    it("opens again after being closed", () => {
      const { rerender } = render(<Confirm open={false} />);
      rerender(<Confirm />);

      expect(dialog()).toBeInTheDocument();
    });

    it("does not close itself", async () => {
      // Nothing closes without the caller lowering `open` — the prop is the
      // only source of truth.
      const user = userEvent.setup();
      render(<Confirm onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(dialog()).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("names the dialog from its title", () => {
      render(<Confirm />);

      expect(screen.getByRole("dialog", { name: "Delete project" })).toBeInTheDocument();
    });

    it("renders the title as a heading", () => {
      render(<Confirm />);

      expect(screen.getByRole("heading", { level: 2, name: "Delete project" })).toBeInTheDocument();
    });

    it("describes the dialog from its description", () => {
      render(<Confirm description="Everything in it will be removed." />);

      expect(dialog()).toHaveAccessibleDescription("Everything in it will be removed.");
    });

    it("leaves describedby off when there is no description", () => {
      render(<Confirm />);

      expect(dialog()).not.toHaveAttribute("aria-describedby");
    });

    it("can be an alertdialog", () => {
      render(<Confirm role="alertdialog" />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Confirm />
          <Confirm />
        </>,
      );

      const ids = screen.getAllByRole("dialog").map((el) => el.getAttribute("aria-labelledby"));
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe("close button", () => {
    it("renders by default", () => {
      render(<Confirm />);

      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("asks to close when clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("can be hidden", () => {
      render(<Confirm showClose={false} />);

      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("takes a custom label", () => {
      render(<Confirm closeLabel="Dismiss" />);

      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("is type=button so it never submits a surrounding form", () => {
      render(<Confirm />);

      expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("type", "button");
    });
  });

  describe("escape", () => {
    it("asks to close", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("can be refused", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} closeOnEscape={false} />);

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("leaves the dialog open when refused", async () => {
      // The browser closes on Escape unless `cancel` is prevented. Without
      // that, closeOnEscape={false} would still shut the element.
      const user = userEvent.setup();
      render(<Harness closeOnEscape={false} />);

      await user.keyboard("{Escape}");

      expect(dialog()).toBeInTheDocument();
    });

    it("does not close the element itself when allowed", async () => {
      // Closing is routed through `open` instead, so React and the DOM can't
      // disagree about whether the dialog is up.
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(dialog()).toBeInTheDocument();
    });
  });

  describe("backdrop", () => {
    /*
     * A click on the backdrop is dispatched to the <dialog> element itself,
     * so these drive the element directly rather than a child.
     */
    const clickBackdrop = async (user: ReturnType<typeof userEvent.setup>) => {
      const element = dialog() as HTMLElement;
      await user.pointer([
        { target: element, keys: "[MouseLeft>]" },
        { target: element, keys: "[/MouseLeft]" },
      ]);
    };

    it("asks to close", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      await clickBackdrop(user);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("can be refused", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} closeOnBackdropClick={false} />);

      await clickBackdrop(user);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores clicks inside the panel", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      await user.click(screen.getByText("This can't be undone."));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores a drag that starts inside and ends on the backdrop", async () => {
      // Selecting text in a field and releasing outside fires a click on the
      // dialog; treating that as a backdrop click loses the user's work.
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Confirm onClose={onClose} />);

      const inside = screen.getByText("This can't be undone.");
      await user.pointer([
        { target: inside, keys: "[MouseLeft>]" },
        { target: dialog() as HTMLElement, keys: "[/MouseLeft]" },
      ]);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("layout", () => {
    it("applies the size class", () => {
      render(<Confirm size="lg" />);

      expect(dialog()).toHaveClass("sh-dialog--lg");
    });

    it("defaults to md", () => {
      render(<Confirm />);

      expect(dialog()).toHaveClass("sh-dialog--md");
    });

    it("renders a footer when given one", () => {
      render(<Confirm footer={<button type="button">Confirm</button>} />);

      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });

    it("leaves the footer out when not", () => {
      const { container } = render(<Confirm />);

      expect(container.querySelector(".sh-dialog__footer")).not.toBeInTheDocument();
    });

    it("leaves the body out with no children", () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Empty" />,
      );

      expect(container.querySelector(".sh-dialog__body")).not.toBeInTheDocument();
    });

    it("merges a className", () => {
      render(<Confirm className="custom" />);

      expect(dialog()).toHaveClass("custom");
    });
  });

  describe("focus", () => {
    it("focuses the element given by initialFocus", async () => {
      const WithInitialFocus = () => {
        const cancelRef = useRef<HTMLButtonElement>(null);

        return (
          <Dialog
            open
            onClose={() => {}}
            title="Delete project"
            initialFocus={cancelRef}
            footer={
              <>
                <button type="button" ref={cancelRef}>
                  Cancel
                </button>
                <button type="button">Delete</button>
              </>
            }
          >
            Body
          </Dialog>
        );
      };

      render(<WithInitialFocus />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
      );
    });
  });

  describe("page scrolling", () => {
    it("freezes the page while open", () => {
      render(<Confirm />);

      expect(document.body).toHaveStyle({ overflow: "hidden" });
    });

    it("releases it on close", () => {
      const { rerender } = render(<Confirm />);
      rerender(<Confirm open={false} />);

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });

    it("releases it on unmount", () => {
      const { unmount } = render(<Confirm />);
      unmount();

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });

    it("stays frozen while a second dialog is still open", () => {
      const { rerender } = render(
        <>
          <Confirm />
          <Confirm />
        </>,
      );

      rerender(
        <>
          <Confirm open={false} />
          <Confirm />
        </>,
      );

      expect(document.body).toHaveStyle({ overflow: "hidden" });
    });

    it("can be opted out of", () => {
      render(<Confirm lockScroll={false} />);

      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });
  });
});
