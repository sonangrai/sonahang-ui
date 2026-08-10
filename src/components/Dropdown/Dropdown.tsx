import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { DropdownContext } from "./dropdown.context";
import type { DropdownAlign, DropdownFocusTarget, DropdownPlacement } from "./dropdown.context";
import "./Dropdown.css";

export type DropdownProps = {
  children?: ReactNode;
  /** Open state — makes the component controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to closed. */
  defaultOpen?: boolean;
  /** Fired whenever the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the menu sits on. Defaults to `bottom`. */
  placement?: DropdownPlacement;
  /** Which edge the menu lines up with. Defaults to `start`. */
  align?: DropdownAlign;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Root of a menu-button dropdown: a trigger and a popup of commands.
 *
 * This is the *action* menu pattern (`role="menu"`), not a value picker —
 * use `Select` for choosing a value. Nothing here is a form control.
 */
export function Dropdown({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  align = "start",
  className,
  ...props
}: DropdownProps) {
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [focusOnOpen, setFocusOnOpen] = useState<DropdownFocusTarget>(null);

  const open = useCallback(
    (focus: DropdownFocusTarget = null) => {
      setFocusOnOpen(focus);
      if (!isControlled) setUncontrolledOpen(true);
      onOpenChange?.(true);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(
    ({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
      setFocusOnOpen(null);
      if (!isControlled) setUncontrolledOpen(false);
      onOpenChange?.(false);
      // Focus would otherwise fall to the body when the menu unmounts.
      if (restoreFocus) triggerRef.current?.focus();
    },
    [isControlled, onOpenChange],
  );

  /*
   * Dismiss on an outside press. Bound to pointerdown rather than click so the
   * menu closes on press, matching platform menus, and so a press that starts
   * outside can't land on an item that moved under the cursor.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        // Focus is already leaving; yanking it back to the trigger would
        // fight whatever the user just pressed.
        close({ restoreFocus: false });
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  /*
   * Escape is handled at the document rather than on the menu, because focus
   * isn't always inside it: a controlled parent can open the menu without
   * moving focus, and a menu that ignores Escape in that state is a trap.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        open,
        close,
        focusOnOpen,
        triggerId: `${baseId}-trigger`,
        menuId: `${baseId}-menu`,
        triggerRef,
        placement,
        align,
      }}
    >
      <div
        ref={rootRef}
        className={["sh-dropdown", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}
