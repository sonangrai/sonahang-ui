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

export type ToastFunction = {
  /** Shows a toast and returns its id. */
  (title: ReactNode, options?: ToastOptions): string;
  success: VariantShortcut;
  info: VariantShortcut;
  warning: VariantShortcut;
  error: VariantShortcut;
  /** Closes one toast, or every toast when called without an id. */
  dismiss: (id?: string) => void;
};

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
