import type { DialogHTMLAttributes, ReactNode, RefObject } from "react";

import { portalInto } from "../../internal/portalInto";
import { useModalSurface } from "../../internal/useModalSurface";
import type { DrawerSide, DrawerSize } from "./drawer.tokens";
import "./Drawer.css";

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
  </svg>
);

export type DrawerProps = {
  /**
   * Whether the drawer is showing.
   *
   * Controlled only, like `Dialog`: a modal surface has no trigger of its own,
   * so an uncontrolled one could never be opened.
   */
  open: boolean;
  /**
   * Called when the drawer asks to close — the close button, the scrim, or
   * Escape. Nothing closes on its own; this has to set `open` to false.
   */
  onClose: () => void;
  /** Accessible name, rendered as the heading. */
  title: ReactNode;
  /** Optional supporting line under the title. */
  description?: ReactNode;
  /** Body content. Scrolls when it outgrows the drawer. */
  children?: ReactNode;
  /** Action row pinned below the body — usually buttons. */
  footer?: ReactNode;
  /** Edge to anchor to and slide in from. Defaults to `right`. */
  side?: DrawerSide;
  /** Extent along the drawer's own axis. Defaults to `md`. */
  size?: DrawerSize;
  /** Whether Escape closes the drawer. Defaults to true. */
  closeOnEscape?: boolean;
  /** Whether clicking the scrim closes the drawer. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Whether to render the × in the header. Defaults to true. */
  showClose?: boolean;
  /** Accessible name for the × button. Defaults to "Close". */
  closeLabel?: string;
  /**
   * Element to focus when the drawer opens. Without it the browser focuses the
   * first focusable thing inside, or anything carrying `autoFocus`.
   */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Whether to freeze page scrolling while open. Defaults to true. */
  lockScroll?: boolean;
  /**
   * Renders the drawer elsewhere in the DOM — `true` for `document.body`, or
   * an element to render into. Off by default.
   *
   * Not needed for stacking or clipping: `showModal()` puts the drawer in the
   * top layer, above the whole document whatever the `z-index` and `overflow`
   * of its ancestors. Reach for this when the drawer's *position in the DOM*
   * is the problem — nested inside a `<form>` whose submission its buttons
   * would trigger, inside an element with a native click listener, or under an
   * ancestor that may become `inert` or unmount beneath it.
   *
   * It does not change event propagation in React: a portal moves the DOM
   * node, not the React tree, so a parent component's `onClick` still fires.
   */
  portal?: boolean | HTMLElement;
  className?: string;
} & Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "className" | "title" | "role" | "open" | "onClose" | "onCancel"
>;

/**
 * Panel that slides in from an edge of the viewport, over the page.
 *
 * Shares every behaviour with `Dialog` — both are a modal native `<dialog>`,
 * so both get the top layer, the focus trap, the inert background and the
 * scrim from the browser rather than from code here. The difference is purely
 * geometric: a drawer is pinned to one edge and fills its cross axis.
 *
 * There's deliberately no `alertdialog` option. A decision urgent enough for
 * that role shouldn't arrive as a panel sliding in from the side.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "md",
  closeOnEscape = true,
  closeOnBackdropClick = true,
  showClose = true,
  closeLabel = "Close",
  initialFocus,
  lockScroll = true,
  portal = false,
  className,
  ...props
}: DrawerProps) {
  const { titleId, descriptionId, surfaceProps } = useModalSurface({
    open,
    onClose,
    closeOnEscape,
    closeOnBackdropClick,
    initialFocus,
    lockScroll,
  });

  const content = (
    <dialog
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={["sh-drawer", `sh-drawer--${side}`, `sh-drawer--${size}`, className]
        .filter(Boolean)
        .join(" ")}
      {...surfaceProps}
      {...props}
    >
      <div className="sh-drawer__header">
        <div className="sh-drawer__heading">
          <h2 id={titleId} className="sh-drawer__title">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="sh-drawer__description">
              {description}
            </p>
          )}
        </div>

        {showClose && (
          <button
            type="button"
            className="sh-drawer__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {children !== undefined && children !== null && children !== false && (
        <div className="sh-drawer__body">{children}</div>
      )}

      {footer && <div className="sh-drawer__footer">{footer}</div>}
    </dialog>
  );

  return portalInto(content, portal);
}
