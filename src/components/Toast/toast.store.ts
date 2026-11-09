import { isValidElement } from "react";
import type { MouseEvent, ReactNode } from "react";

import type { ToastVariant } from "./toast.tokens";

export type ToastAction = {
  label: ReactNode;
  /** Called on click. The toast closes afterwards unless you call `event.preventDefault()`. */
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type ToastOptions = {
  /**
   * Reuse an id to replace a toast in place — e.g. turn "Uploading…" into
   * "Uploaded" — instead of stacking a second one. Its timer restarts.
   */
  id?: string;
  variant?: ToastVariant;
  /** Secondary line under the title. */
  description?: ReactNode;
  /**
   * Milliseconds before it closes on its own. `Infinity` keeps it until
   * dismissed. Defaults to the `Toaster`'s `duration`.
   */
  duration?: number;
  /** A single button, e.g. "Undo". */
  action?: ToastAction;
  /** Replaces the variant's icon, or hides it with `false`. */
  icon?: ReactNode | false;
  /** Whether to show the close button. Defaults to the `Toaster`'s `closeButton`. */
  dismissible?: boolean;
  /** Called once the toast has closed, however that happened. */
  onDismiss?: () => void;
};

export type ToastRecord = Omit<ToastOptions, "id"> & {
  id: string;
  title: ReactNode;
  variant: ToastVariant;
  /** Bumped on every update so the toast's timer knows to restart. */
  version: number;
  /** Playing its exit animation; removed from the store shortly after. */
  closing: boolean;
};

/** Long enough for the exit animation in Toast.css to finish. */
export const EXIT_DURATION_MS = 200;

type Listener = () => void;

let toasts: ToastRecord[] = [];
let counter = 0;
const listeners = new Set<Listener>();
const removalTimers = new Map<string, ReturnType<typeof setTimeout>>();

const EMPTY: ToastRecord[] = [];

function emit() {
  for (const listener of listeners) listener();
}

/*
 * A plain module-level store rather than React context, so `toast()` can be
 * called from anywhere — event handlers, data-fetching code, outside React
 * entirely — without a provider wrapping the app.
 */
export const toastStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => toasts,
  /** Nothing is queued on the server, and this must be a stable reference. */
  getServerSnapshot: () => EMPTY,
};

function show(title: ReactNode, options: ToastOptions = {}, variant?: ToastVariant): string {
  const { id: requestedId, ...rest } = options;
  const id = requestedId ?? `sh-toast-${++counter}`;
  const existing = toasts.find((toast) => toast.id === id);

  if (existing) {
    // An update revives a toast that was mid-exit.
    const pending = removalTimers.get(id);
    if (pending) {
      clearTimeout(pending);
      removalTimers.delete(id);
    }

    toasts = toasts.map((toast) =>
      toast.id === id
        ? {
            ...toast,
            ...rest,
            title,
            variant: variant ?? rest.variant ?? toast.variant,
            version: toast.version + 1,
            closing: false,
          }
        : toast,
    );
  } else {
    toasts = [
      ...toasts,
      {
        ...rest,
        id,
        title,
        variant: variant ?? rest.variant ?? "default",
        version: 0,
        closing: false,
      },
    ];
  }

  emit();
  return id;
}

function dismissOne(id: string) {
  const target = toasts.find((toast) => toast.id === id);
  if (!target || target.closing) return;

  toasts = toasts.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast));
  emit();

  // Removal waits for the exit animation rather than listening for
  // `animationend`, which never fires when motion is reduced.
  removalTimers.set(
    id,
    setTimeout(() => {
      removalTimers.delete(id);
      toasts = toasts.filter((toast) => toast.id !== id);
      emit();
      target.onDismiss?.();
    }, EXIT_DURATION_MS),
  );
}

type VariantShortcut = (title: ReactNode, options?: Omit<ToastOptions, "variant">) => string;

/** A result message: just a title, or a title with any other toast options. */
export type ToastPromiseContent = ReactNode | ({ title: ReactNode } & Omit<ToastOptions, "id" | "variant">);

export type ToastPromiseMessages<T> = {
  /** Shown while pending. Stays up until the promise settles. */
  loading: ReactNode;
  /** Shown on resolve. A function receives the resolved value. */
  success: ToastPromiseContent | ((value: T) => ToastPromiseContent);
  /**
   * Shown on reject. A function receives the rejection reason. Leave it out
   * and the loading toast just closes.
   */
  error?: ToastPromiseContent | ((reason: unknown) => ToastPromiseContent);
};

export type ToastFunction = {
  /** Shows a toast and returns its id. */
  (title: ReactNode, options?: ToastOptions): string;
  success: VariantShortcut;
  info: VariantShortcut;
  warning: VariantShortcut;
  error: VariantShortcut;
  /**
   * Shows a loading toast that turns into success or error when `promise`
   * settles. Returns the same promise, so it can be awaited or chained —
   * pass `options.id` to address the toast afterwards.
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
    options?: Omit<ToastOptions, "variant">,
  ) => Promise<T>;
  /** Closes one toast, or every toast when called without an id. */
  dismiss: (id?: string) => void;
};

/*
 * Tells `{ title, description }` apart from a ReactNode. Elements are objects
 * too, so they have to be ruled out first.
 */
const isContentWithOptions = (
  content: ToastPromiseContent,
): content is { title: ReactNode } & Omit<ToastOptions, "id" | "variant"> =>
  typeof content === "object" &&
  content !== null &&
  !isValidElement(content) &&
  !Array.isArray(content) &&
  !(Symbol.iterator in content) &&
  "title" in content;

function showPromise<T>(
  input: Promise<T> | (() => Promise<T>),
  messages: ToastPromiseMessages<T>,
  options: Omit<ToastOptions, "variant"> = {},
): Promise<T> {
  // A function that throws synchronously is treated as a rejection, so the
  // toast still settles instead of spinning forever.
  let promise: Promise<T>;
  try {
    promise = typeof input === "function" ? input() : input;
  } catch (reason) {
    promise = Promise.reject(reason);
  }

  const { duration, action, icon, description, onDismiss, dismissible } = options;
  const id = show(
    messages.loading,
    // The icon and action are for the outcome; the loading state has its own
    // spinner and nothing to act on yet.
    { ...options, duration: Infinity, icon: undefined, action: undefined },
    "loading",
  );

  /*
   * Every field is set explicitly: an update merges into the existing toast,
   * so anything left out would carry over from the loading state — most
   * importantly its infinite duration.
   */
  const settle = (variant: "success" | "error", content: ToastPromiseContent) => {
    const { title, ...overrides } = isContentWithOptions(content)
      ? content
      : { title: content };

    show(
      title,
      { duration, action, icon, description, onDismiss, dismissible, ...overrides, id },
      variant,
    );
  };

  promise.then(
    (value) => {
      const { success } = messages;
      settle("success", typeof success === "function" ? success(value) : success);
    },
    (reason) => {
      const { error } = messages;
      if (error === undefined) {
        dismissOne(id);
        return;
      }
      settle("error", typeof error === "function" ? error(reason) : error);
    },
  );

  // The caller gets the original promise, rejection and all. Ours is already
  // handled above, so ignoring the return value never surfaces as an
  // unhandled rejection.
  return promise;
}

/**
 * Shows a toast in whichever `<Toaster />` is mounted.
 *
 * ```ts
 * toast("Draft saved");
 * toast.success("Uploaded", { description: "report.pdf" });
 * const id = toast("Uploading…", { duration: Infinity });
 * toast.success("Uploaded", { id });
 * ```
 */
export const toast: ToastFunction = Object.assign(
  (title: ReactNode, options?: ToastOptions) => show(title, options),
  {
    success: (title: ReactNode, options?: ToastOptions) => show(title, options, "success"),
    info: (title: ReactNode, options?: ToastOptions) => show(title, options, "info"),
    warning: (title: ReactNode, options?: ToastOptions) => show(title, options, "warning"),
    error: (title: ReactNode, options?: ToastOptions) => show(title, options, "error"),
    promise: showPromise,
    dismiss: (id?: string) => {
      if (id !== undefined) {
        dismissOne(id);
        return;
      }
      for (const item of toasts) dismissOne(item.id);
    },
  },
);

/** Clears everything immediately. For tests — not exported from the package. */
export function resetToastStore() {
  for (const timer of removalTimers.values()) clearTimeout(timer);
  removalTimers.clear();
  toasts = [];
  counter = 0;
  emit();
}
