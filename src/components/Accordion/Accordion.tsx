import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { AccordionContext } from "./accordion.context";
import type { AccordionHeadingLevel, AccordionType } from "./accordion.context";
import "./Accordion.css";

export type AccordionProps = {
  children?: ReactNode;
  /** Whether more than one item can be open at a time. Defaults to `single`. */
  type?: AccordionType;
  /**
   * Values of the open items — makes the component controlled.
   *
   * Always an array, even for `type="single"`, so the prop's type doesn't
   * change with another prop's value. A single accordion simply never holds
   * more than one entry.
   */
  value?: string[];
  /** Initially open items when uncontrolled. */
  defaultValue?: string[];
  /** Fired with the full list of open items. */
  onChange?: (value: string[]) => void;
  /**
   * For `type="single"`, whether clicking the open item closes it. Defaults
   * to true; set false when one item must always stay open.
   */
  collapsible?: boolean;
  /** Heading rank wrapped around each trigger. Defaults to `3`. */
  headingLevel?: AccordionHeadingLevel;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange">;

/**
 * Stack of collapsible sections.
 *
 * Each trigger is a button inside a real heading, so the sections show up in
 * the document outline and screen-reader heading navigation — an accordion
 * built from bare buttons is invisible to both.
 */
export function Accordion({
  children,
  type = "single",
  value,
  defaultValue,
  onChange,
  collapsible = true,
  headingLevel = 3,
  className,
  ...props
}: AccordionProps) {
  const baseId = useId();

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const open = isControlled ? value : uncontrolledValue;

  const toggle = (itemValue: string) => {
    const isOpen = open.includes(itemValue);

    let next: string[];
    if (type === "multiple") {
      next = isOpen ? open.filter((item) => item !== itemValue) : [...open, itemValue];
    } else if (isOpen) {
      // Refusing to collapse keeps the current item open rather than emptying.
      next = collapsible ? [] : open;
    } else {
      next = [itemValue];
    }

    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ value: open, toggle, baseId, headingLevel }}>
      <div className={["sh-accordion", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
