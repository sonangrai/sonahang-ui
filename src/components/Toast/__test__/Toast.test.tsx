import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "../../Dialog";
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

describe("Toaster with a modal Dialog", () => {
  /*
   * jsdom has neither the top layer nor popovers. Stubbing the popover API
   * is enough to exercise the logic that matters here: where the stack is
   * rendered, and that it's re-shown after each move.
   */
  let showPopover: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    showPopover = vi.fn(function (this: HTMLElement) {
      this.setAttribute("data-popover-open", "");
    });
    HTMLElement.prototype.showPopover = showPopover as unknown as () => void;
    const realMatches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      if (selector === ":popover-open") return this.hasAttribute("data-popover-open");
      // jsdom has no `:modal`; with the shim, an open dialog is a modal one.
      if (selector === ":modal") return (this as HTMLDialogElement).open;
      return realMatches.call(this, selector);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  });

  const App = ({ open }: { open: boolean }) => (
    <>
      <Dialog open={open} onClose={() => {}} title="Settings">
        Body
      </Dialog>
      <Toaster />
    </>
  );

  const list = () => document.querySelector("ol.sh-toaster") as HTMLOListElement;

  it("is a manual popover, shown on mount", () => {
    render(<App open={false} />);

    expect(list()).toHaveAttribute("popover", "manual");
    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(list().closest("dialog")).toBeNull();
  });

  it("moves into an open modal and back out when it closes", async () => {
    const { rerender } = render(<App open={false} />);

    rerender(<App open />);
    await act(async () => {});
    expect(list().closest("dialog")).toBe(screen.getByRole("dialog"));
    expect(showPopover).toHaveBeenCalledTimes(2);

    rerender(<App open={false} />);
    await act(async () => {});
    expect(list().closest("dialog")).toBeNull();
    expect(showPopover).toHaveBeenCalledTimes(3);
  });

  it("keeps a toast's remaining time across the move", async () => {
    const { rerender } = render(<App open={false} />);
    show("Moving", { duration: 1000 });

    advance(700);
    rerender(<App open />);
    await act(async () => {});

    advance(299);
    expect(items()[0]).not.toHaveClass("sh-toaster__item--closing");
    expect(items()[0]).toHaveClass("sh-toaster__item--shown");
    advance(1);
    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
  });

  it("closes the toast, not the dialog, on Escape", async () => {
    const onClose = vi.fn();
    render(
      <>
        <Dialog open onClose={onClose} title="Settings">
          Body
        </Dialog>
        <Toaster />
      </>,
    );
    await act(async () => {});
    show("Inside");

    // jsdom's stylesheet hides a stubbed popover, so role queries can't see in.
    const notPrevented = fireEvent.keyDown(list().querySelector(".sh-toast__dismiss")!, {
      key: "Escape",
    });

    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
    // Browsers turn Escape into the dialog's `cancel` as a default action,
    // which stopPropagation alone doesn't prevent.
    expect(notPrevented).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays in place when popovers aren't supported", async () => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
    render(<App open />);
    await act(async () => {});

    expect(list().closest("dialog")).toBeNull();
  });
});

describe("toast.promise", () => {
  /** A promise settled by hand, so each state can be checked. */
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  const flush = () => act(async () => {});

  it("shows a loading toast that never times out", () => {
    renderToaster({ duration: 1000 });
    const { promise } = deferred<string>();
    act(() => {
      toast.promise(promise, { loading: "Saving…", success: "Saved" });
    });

    expect(items()[0]).toHaveAttribute("data-variant", "loading");
    expect(document.querySelector(".sh-toast__spinner")).toBeInTheDocument();

    advance(60_000);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });

  it("turns into success in place, then times out normally", async () => {
    renderToaster({ duration: 1000 });
    const { promise, resolve } = deferred<string>();
    act(() => {
      toast.promise(promise, {
        loading: "Saving…",
        success: (name) => ({ title: `Saved ${name}`, description: "All good" }),
      });
    });

    resolve("report.pdf");
    await flush();

    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveAttribute("data-variant", "success");
    expect(screen.getByText("Saved report.pdf")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();

    advance(1000);
    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
  });

  it("turns into an error with the rejection reason", async () => {
    renderToaster();
    const { promise, reject } = deferred<string>();
    act(() => {
      toast
        .promise(promise, {
          loading: "Saving…",
          success: "Saved",
          error: (reason) => `Failed: ${(reason as Error).message}`,
        })
        .catch(() => {});
    });

    reject(new Error("offline"));
    await flush();

    expect(items()[0]).toHaveAttribute("data-variant", "error");
    expect(screen.getByRole("alert")).toHaveTextContent("Failed: offline");
  });

  it("just closes on rejection when there's no error message", async () => {
    renderToaster();
    const { promise, reject } = deferred<string>();
    act(() => {
      toast.promise(promise, { loading: "Saving…", success: "Saved" }).catch(() => {});
    });

    reject(new Error("nope"));
    await flush();

    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
  });

  it("returns the original promise", async () => {
    vi.useRealTimers();
    renderToaster();

    const value = await toast.promise(Promise.resolve(42), { loading: "…", success: "Done" });
    expect(value).toBe(42);
    await expect(
      toast.promise(Promise.reject(new Error("x")), { loading: "…", success: "Done" }),
    ).rejects.toThrow("x");
  });

  it("accepts a function, and treats a synchronous throw as a rejection", async () => {
    renderToaster();
    let returned!: Promise<never>;
    act(() => {
      returned = toast.promise(
        () => {
          throw new Error("sync");
        },
        { loading: "…", success: "Done", error: "Broke" },
      );
    });
    await expect(returned).rejects.toThrow("sync");
    await flush();

    expect(screen.getByText("Broke")).toBeInTheDocument();
  });

  it("doesn't carry the loading state's settings into the result", async () => {
    renderToaster({ duration: 1000 });
    const { promise, resolve } = deferred<void>();
    act(() => {
      toast.promise(
        promise,
        { loading: "Saving…", success: "Saved" },
        { icon: <span data-testid="result-icon" />, action: { label: "View", onClick: () => {} } },
      );
    });

    expect(screen.queryByTestId("result-icon")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();

    resolve();
    await flush();

    expect(screen.getByTestId("result-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
  });

  it("uses a caller-supplied id", () => {
    renderToaster();
    act(() => {
      toast.promise(new Promise(() => {}), { loading: "Saving…", success: "Saved" }, { id: "save" });
    });

    act(() => toast.dismiss("save"));
    expect(items()[0]).toHaveClass("sh-toaster__item--closing");
  });
});

describe("Toast loading variant", () => {
  it("shows a spinner as a status", () => {
    const { container } = render(<Toast variant="loading" title="Saving…" />);

    expect(screen.getByRole("status")).toHaveTextContent("Saving…");
    expect(container.querySelector(".sh-toast__spinner")).toBeInTheDocument();
  });
});
