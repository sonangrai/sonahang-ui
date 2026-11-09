import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toast } from "../Toast";
import { Toaster } from "../Toaster";
import type { ToasterProps } from "../Toaster";
import { EXIT_DURATION_MS, resetToastStore, toast } from "../toast.store";

const renderToaster = (props: Partial<ToasterProps> = {}) =>
  render(<Toaster portal={false} {...props} />);

/** Runs timers and lets React flush the resulting store updates. */
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

const show = (...args: Parameters<typeof toast>) => {
  let id = "";
  act(() => {
    id = toast(...args);
  });
  return id;
};

const items = () => document.querySelectorAll(".sh-toaster__item");

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => resetToastStore());
  vi.useRealTimers();
});

describe("Toaster", () => {
  it("renders a named landmark with a live list", () => {
    renderToaster();

    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.querySelector("ol")).toHaveAttribute("aria-live", "polite");
  });

  it("shows a toast with its title and description", () => {
    renderToaster();
    show("Saved", { description: "All changes stored" });

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("All changes stored")).toBeInTheDocument();
  });

  it("shows toasts raised before it mounted", () => {
    act(() => {
      toast("Early");
    });
    renderToaster();

    expect(screen.getByText("Early")).toBeInTheDocument();
  });

  it("applies variants from the shortcuts", () => {
    renderToaster();
    show("A");
    act(() => {
      toast.success("B");
      toast.error("C");
    });

    expect([...items()].map((li) => li.getAttribute("data-variant"))).toEqual([
      "default",
      "success",
      "error",
    ]);
  });

  it("makes urgent toasts interrupt and leaves the rest to the live list", () => {
    renderToaster();
    act(() => {
      toast.error("Failed");
      toast.success("Done");
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  describe("timing", () => {
    it("closes after the default duration", () => {
      renderToaster({ duration: 3000 });
      show("Bye");

      advance(2999);
      expect(items()).toHaveLength(1);

      advance(1);
      expect(items()[0]).toHaveClass("sh-toaster__item--closing");

      advance(EXIT_DURATION_MS);
      expect(items()).toHaveLength(0);
    });

    it("honours a per-toast duration, including Infinity", () => {
      renderToaster({ duration: 1000 });
      show("Short", { duration: 200 });
      show("Forever", { duration: Infinity });

      advance(60_000);

      expect(screen.queryByText("Short")).not.toBeInTheDocument();
      expect(screen.getByText("Forever")).toBeInTheDocument();
    });

    it("pauses while hovered and resumes with the time left", () => {
      renderToaster({ duration: 1000 });
      show("Hover me");

      advance(600);
      fireEvent.pointerEnter(document.querySelector("ol")!);
      advance(5000);
      expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");

      fireEvent.pointerLeave(document.querySelector("ol")!);
      advance(399);
      expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");
      advance(1);
      expect(items()[0]).toHaveClass("sh-toaster__item--closing");
    });

    it("pauses while focus is inside", () => {
      renderToaster({ duration: 1000 });
      show("Focus me");

      act(() => screen.getByRole("button", { name: "Dismiss" }).focus());
      advance(5000);

      expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");
    });
  });

  describe("updating and dismissing", () => {
    it("updates a toast in place when the id is reused, restarting its timer", () => {
      renderToaster({ duration: 1000 });
      const id = show("Uploading…");

      advance(800);
      show("Uploaded", { id, variant: "success" });

      expect(items()).toHaveLength(1);
      expect(screen.getByText("Uploaded")).toBeInTheDocument();
      expect(items()[0]).toHaveAttribute("data-variant", "success");

      advance(800);
      expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");
    });

    it("closes from the dismiss button and then calls onDismiss", () => {
      const onDismiss = vi.fn();
      renderToaster();
      show("Closable", { onDismiss });

      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(onDismiss).not.toHaveBeenCalled();

      advance(EXIT_DURATION_MS);
      expect(items()).toHaveLength(0);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("hides the close button when asked", () => {
      renderToaster({ closeButton: false });
      show("No close");
      show("Has close", { dismissible: true });

      expect(screen.getAllByRole("button", { name: "Dismiss" })).toHaveLength(1);
    });

    it("dismisses everything with toast.dismiss()", () => {
      renderToaster();
      show("One");
      show("Two");

      act(() => toast.dismiss());
      advance(EXIT_DURATION_MS);

      expect(items()).toHaveLength(0);
    });

    it("closes the focused toast on Escape", () => {
      renderToaster();
      show("Escape me");

      fireEvent.keyDown(screen.getByRole("button", { name: "Dismiss" }), { key: "Escape" });

      expect(items()[0]).toHaveClass("sh-toaster__item--closing");
    });

    it("runs an action and then closes", () => {
      const onClick = vi.fn();
      renderToaster();
      show("Archived", { action: { label: "Undo", onClick } });

      fireEvent.click(screen.getByRole("button", { name: "Undo" }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(items()[0]).toHaveClass("sh-toaster__item--closing");
    });

    it("stays open when the action prevents default", () => {
      renderToaster();
      show("Archived", {
        action: { label: "Undo", onClick: (event) => event.preventDefault() },
      });

      fireEvent.click(screen.getByRole("button", { name: "Undo" }));

      expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");
    });
  });

  it("closes the oldest when more than max are open", () => {
    renderToaster({ max: 2 });
    show("First");
    show("Second");
    show("Third");

    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
    advance(EXIT_DURATION_MS);

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("returns unique ids", () => {
    renderToaster();
    expect(show("A")).not.toBe(show("B"));
  });
});

describe("Toast", () => {
  it("defaults its role from the variant", () => {
    render(
      <>
        <Toast title="Fine" variant="success" />
        <Toast title="Bad" variant="error" />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Fine");
    expect(screen.getByRole("alert")).toHaveTextContent("Bad");
  });

  it("shows an icon for status variants but not the default one", () => {
    const { container } = render(
      <>
        <Toast title="Plain" />
        <Toast title="Done" variant="success" />
      </>,
    );

    expect(container.querySelectorAll(".sh-toast__icon")).toHaveLength(1);
  });

  it("accepts a custom icon or none", () => {
    const { container } = render(
      <>
        <Toast title="Custom" icon={<span data-testid="custom" />} />
        <Toast title="None" variant="error" icon={false} />
      </>,
    );

    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelectorAll(".sh-toast__icon")).toHaveLength(1);
  });

  it("only renders a dismiss button when onDismiss is given", () => {
    const onDismiss = vi.fn();
    render(<Toast title="X" onDismiss={onDismiss} dismissLabel="Close" />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
