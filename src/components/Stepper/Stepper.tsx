import { Children, isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { StepContext } from "./stepper.context";
import type { StepperOrientation, StepStatus } from "./stepper.context";
import "./Stepper.css";

export type StepperProps = {
  children?: ReactNode;
  /** Zero-based index of the step in progress. */
  activeStep?: number;
  /** Layout direction. Defaults to `horizontal`. */
  orientation?: StepperOrientation;
  /** Accessible name for the list. Defaults to "Progress". */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLOListElement>, "className">;

/**
 * Ordered progress through a multi-step flow.
 *
 * An `ol`, because the order is the meaning. Each step's status is derived
 * from its position against `activeStep` — the position is what makes a step
 * complete or upcoming, so callers shouldn't have to restate it.
 *
 * It's a progress indicator, not a `nav` landmark: steps are only navigation
 * when they're given an `onClick`, and a landmark per progress bar would
 * clutter the landmark list.
 */
export function Stepper({
  children,
  activeStep = 0,
  orientation = "horizontal",
  "aria-label": ariaLabel = "Progress",
  className,
  ...props
}: StepperProps) {
  const steps = Children.toArray(children).filter(isValidElement);

  const statusFor = (index: number): StepStatus => {
    if (index < activeStep) return "complete";
    if (index === activeStep) return "current";
    return "upcoming";
  };

  return (
    <ol
      className={["sh-stepper", `sh-stepper--${orientation}`, className]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      {...props}
    >
      {steps.map((step, index) => (
        <StepContext.Provider
          key={step.key ?? index}
          value={{
            index,
            isLast: index === steps.length - 1,
            status: statusFor(index),
            orientation,
          }}
        >
          {step}
        </StepContext.Provider>
      ))}
    </ol>
  );
}
