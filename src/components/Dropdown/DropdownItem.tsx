import type { ButtonHTMLAttributes, ReactNode } from "react";

import { useDropdownContext } from "./dropdown.context";
import "./Dropdown.css";

export type DropdownItemProps = {
  children?: ReactNode;
  /** Runs when the item is chosen. The menu closes afterwards. */
  onSelect?: () => void;
  /** Keeps the menu open after choosing — for items that toggle something. */
  closeOnSelect?: boolean;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Styles the item as a destructive action. */
  destructive?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "onSelect">;

/** A single command in the menu. */
export function DropdownItem({
  children,
  onSelect,
  closeOnSelect = true,
  icon,
  destructive = false,
  className,
  onClick,
  ...props
}: DropdownItemProps) {
  const { close } = useDropdownContext("DropdownItem");

  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "sh-dropdown__item",
        destructive && "sh-dropdown__item--destructive",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      /*
       * Focus is moved here by the menu's arrow keys, so items must be
       * focusable programmatically but not stops in the page's tab order.
       */
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onSelect?.();
        if (closeOnSelect) close();
      }}
      {...props}
    >
      {icon && (
        <span className="sh-dropdown__item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="sh-dropdown__item-label">{children}</span>
    </button>
  );
}
