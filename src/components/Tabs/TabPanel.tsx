import type { HTMLAttributes, ReactNode } from "react";

import { panelId, tabId, useTabsContext } from "./tabs.context";
import "./Tabs.css";

export type TabPanelProps = {
  /** Ties this panel to the `Tab` with the same value. */
  value: string;
  children?: ReactNode;
  /**
   * Keeps the panel mounted while hidden, preserving its state (scroll
   * position, form input, in-flight requests). Off by default so unselected
   * panels cost nothing.
   */
  keepMounted?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/** Content for the `Tab` with the same value. */
export function TabPanel({
  value,
  children,
  keepMounted = false,
  className,
  ...props
}: TabPanelProps) {
  const { value: selected, baseId } = useTabsContext("TabPanel");
  const isSelected = selected === value;

  if (!isSelected && !keepMounted) return null;

  return (
    <div
      id={panelId(baseId, value)}
      className={["sh-tabs__panel", className].filter(Boolean).join(" ")}
      role="tabpanel"
      aria-labelledby={tabId(baseId, value)}
      // `hidden` rather than unmounting, so kept-alive panels stay out of the
      // accessibility tree and the tab order while retaining their state.
      hidden={!isSelected}
      /*
       * The panel is focusable so keyboard users can reach and scroll it after
       * arrowing through the tabs — its content may hold nothing focusable.
       */
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
