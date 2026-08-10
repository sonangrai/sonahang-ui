import { useEffect, useRef } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { useDropdownContext } from "./dropdown.context";
import "./Dropdown.css";

export type DropdownMenuProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * The popup list of commands.
 *
 * Unmounted while closed rather than hidden, so there's nothing focusable or
 * announceable left behind, and owns the roving focus the menu pattern needs.
 */
export function DropdownMenu({ children, className, onKeyDown, ...props }: DropdownMenuProps) {
  const { isOpen, close, focusOnOpen, triggerId, menuId, placement, align } =
    useDropdownContext("DropdownMenu");
  const menuRef = useRef<HTMLDivElement>(null);

  /** Enabled items, in DOM order — disabled ones aren't reachable. */
  const getItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    );

  // Move focus into the menu when it was opened by keyboard.
  useEffect(() => {
    if (!isOpen || !focusOnOpen) return;

    const items = getItems();
    const target = focusOnOpen === "last" ? items[items.length - 1] : items[0];
    target?.focus();
  }, [isOpen, focusOnOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    // Escape is handled by Dropdown at the document level — see the note there.

    // Tab moves on rather than being trapped; the menu just gets out of the way.
    if (event.key === "Tab") {
      close({ restoreFocus: false });
      return;
    }

    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const items = getItems();
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement as HTMLButtonElement);

    let index: number;
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = items.length - 1;
    else if (current === -1) index = 0;
    // Wrap at both ends, as the menu pattern specifies.
    else if (event.key === "ArrowDown") index = (current + 1) % items.length;
    else index = (current - 1 + items.length) % items.length;

    // Stop the arrows scrolling the page behind the menu.
    event.preventDefault();
    items[index]?.focus();
  };

  return (
    <div
      ref={menuRef}
      id={menuId}
      className={[
        "sh-dropdown__menu",
        `sh-dropdown__menu--${placement}`,
        `sh-dropdown__menu--${align}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="menu"
      aria-labelledby={triggerId}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}
