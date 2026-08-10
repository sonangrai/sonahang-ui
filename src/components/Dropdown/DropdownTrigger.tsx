import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { useDropdownContext } from "./dropdown.context";
import "./Dropdown.css";

export type DropdownTriggerProps = {
  children?: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

/** Button that opens the menu. */
export function DropdownTrigger({
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}: DropdownTriggerProps) {
  const { isOpen, open, close, triggerId, menuId, triggerRef } =
    useDropdownContext("DropdownTrigger");

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isOpen) return;

    /*
     * Down opens at the top of the list, Up at the bottom — the standard
     * shortcut for reaching the last command without walking the whole menu.
     */
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      open("last");
    }
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      id={triggerId}
      className={["sh-dropdown__trigger", className].filter(Boolean).join(" ")}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      // Only points at the menu while it exists in the DOM.
      aria-controls={isOpen ? menuId : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // Closing from the trigger shouldn't re-focus what's already focused.
        if (isOpen) close({ restoreFocus: false });
        else open("first");
      }}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
}
