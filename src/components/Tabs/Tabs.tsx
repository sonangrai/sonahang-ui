import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { TabsContext } from "./tabs.context";
import type { TabsActivation, TabsOrientation } from "./tabs.context";
import "./Tabs.css";

export type TabsProps = {
  children?: ReactNode;
  /** Selected tab value — makes the component controlled. */
  value?: string;
  /** Initially selected tab when uncontrolled. */
  defaultValue?: string;
  /** Fired with the newly selected tab's value. */
  onChange?: (value: string) => void;
  /** Layout direction. Defaults to `horizontal`. */
  orientation?: TabsOrientation;
  /** Whether arrowing to a tab selects it. Defaults to `automatic`. */
  activation?: TabsActivation;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange">;

/**
 * Root of the tabs widget: owns the selection and shares it with `TabList`,
 * `Tab`, and `TabPanel` through context.
 */
export function Tabs({
  children,
  value,
  defaultValue,
  onChange,
  orientation = "horizontal",
  activation = "automatic",
  className,
  ...props
}: TabsProps) {
  const baseId = useId();

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const select = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  const classes = ["sh-tabs", `sh-tabs--${orientation}`, className].filter(Boolean).join(" ");

  return (
    <TabsContext.Provider value={{ value: selected, select, baseId, orientation, activation }}>
      <div className={classes} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}
