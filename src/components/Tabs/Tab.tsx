import type { ButtonHTMLAttributes, ReactNode } from "react";

import { panelId, tabId, useTabsContext } from "./tabs.context";
import "./Tabs.css";

export type TabProps = {
  /** Ties this tab to the `TabPanel` with the same value. */
  value: string;
  children?: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "className">;

/** A single tab. Must be rendered inside a `TabList`. */
export function Tab({ value, children, className, disabled, onClick, ...props }: TabProps) {
  const { value: selected, select, baseId } = useTabsContext("Tab");
  const isSelected = selected === value;

  const classes = ["sh-tabs__tab", isSelected && "sh-tabs__tab--selected", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      className={classes}
      // Read back by TabList's keyboard handler to resolve the focused tab.
      data-value={value}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      /*
       * Roving tabindex: only the selected tab is in the tab order, so Tab
       * moves past the whole widget rather than through every tab. The arrow
       * keys are what move between them.
       */
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
