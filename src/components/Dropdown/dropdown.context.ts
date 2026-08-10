import { createContext, useContext } from "react";
import type { RefObject } from "react";

/** Where focus should land when the menu opens, or null to leave it alone. */
export type DropdownFocusTarget = "first" | "last" | null;

export type DropdownPlacement = "bottom" | "top";
export type DropdownAlign = "start" | "end";

export type DropdownContextValue = {
  isOpen: boolean;
  /** Opens the menu, optionally moving focus to an end of the list. */
  open: (focus?: DropdownFocusTarget) => void;
  /** Closes the menu. Returns focus to the trigger unless told not to. */
  close: (options?: { restoreFocus?: boolean }) => void;
  /** Set while the menu is opening, consumed once by the menu on mount. */
  focusOnOpen: DropdownFocusTarget;
  triggerId: string;
  menuId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  placement: DropdownPlacement;
  align: DropdownAlign;
};

export const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);

/** Reads the surrounding `Dropdown`, failing loudly rather than silently. */
export function useDropdownContext(component: string): DropdownContextValue {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Dropdown>.`);
  }

  return context;
}
