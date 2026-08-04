import { createContext } from "react";

export type SwitchGroupContextValue = {
  /** Shared `name`, so the switches submit together as one field. */
  name: string;
  /** Values of the switches currently on. Each toggles independently. */
  value: string[];
  /** Called with the switch's value when it's turned on or off. */
  onToggle: (value: string, checked: boolean) => void;
  /** Set when the whole group is disabled. */
  disabled?: boolean;
  /** Default label side for the group's switches. */
  labelPosition?: "left" | "right";
};

/**
 * Lets `SwitchGroup` coordinate its `Switch` children without cloning them.
 * A `Switch` used outside a group falls back to its own props.
 * Kept in its own module so the component files only export components
 * (see the react-refresh rule in eslint.config.js).
 */
export const SwitchGroupContext = createContext<SwitchGroupContextValue | undefined>(undefined);
