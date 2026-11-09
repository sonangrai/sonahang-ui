import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { CollapsibleContext, CollapsibleDepthContext } from "./collapsible.context";
import "./Collapsible.css";

export type CollapsibleProps = {
  /** `CollapsibleItem`s — which may themselves contain `CollapsibleItem`s. */
  children?: ReactNode;
  /**
   * Values of the open items, at any level — makes the component controlled.
   * Values must therefore be unique across the whole tree.
   */
  value?: string[];
  /** Initially open items when uncontrolled. */
  defaultValue?: string[];
  /** Fired with the full list of open items. */
  onChange?: (value: string[]) => void;
  /**
   * Replaces the default chevron on open items. Applies to every level;
   * an item's own `expandedIcon` wins over this.
   */
  expandedIcon?: ReactNode;
  /**
   * Replaces the default chevron on closed items. Applies to every level;
   * an item's own `collapsedIcon` wins over this.
   */
  collapsedIcon?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange">;

/**
 * Multi-level set of collapsible sections — nav trees, file trees, nested
 * settings.
 *
 * Nest `CollapsibleItem`s inside each other to add levels; depth and
 * indentation are worked out from the nesting. Every item opens and closes
 * independently, and closing a parent keeps its children's state, so they
 * reappear as they were.
 */
export function Collapsible({
  children,
  value,
  defaultValue,
  onChange,
  expandedIcon,
  collapsedIcon,
  className,
  ...props
}: CollapsibleProps) {
  const baseId = useId();

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const open = isControlled ? value : uncontrolledValue;

  const toggle = (itemValue: string) => {
    const next = open.includes(itemValue)
      ? open.filter((item) => item !== itemValue)
      : [...open, itemValue];

    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  return (
    <CollapsibleContext.Provider
      value={{ value: open, toggle, baseId, expandedIcon, collapsedIcon }}
    >
      <CollapsibleDepthContext.Provider value={0}>
        <div className={["sh-collapsible", className].filter(Boolean).join(" ")} {...props}>
          {children}
        </div>
      </CollapsibleDepthContext.Provider>
    </CollapsibleContext.Provider>
  );
}
