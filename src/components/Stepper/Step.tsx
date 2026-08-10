import type { ReactNode } from "react";

import { useStepContext } from "./stepper.context";
import type { StepStatus } from "./stepper.context";
import "./Stepper.css";

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M8 4.5v4.5" strokeLinecap="round" />
    <circle cx="8" cy="11.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export type StepProps = {
  /** Short name for the step. */
  title: ReactNode;
  /** Optional detail below the title. */
  description?: ReactNode;
  /** Overrides the status derived from position. */
  status?: StepStatus;
  /** Replaces the number or state glyph in the indicator. */
  icon?: ReactNode;
  /** Makes the step activatable, for going back to an earlier one. */
  onClick?: () => void;
  /** Prevents activation. Only meaningful alongside `onClick`. */
  disabled?: boolean;
  className?: string;
};

/** One step in a `Stepper`. */
export function Step({
  title,
  description,
  status,
  icon,
  onClick,
  disabled = false,
  className,
}: StepProps) {
  const { index, isLast, status: derivedStatus, orientation } = useStepContext("Step");
  const resolved = status ?? derivedStatus;

  const indicator =
    icon ??
    (resolved === "complete" ? (
      <CheckIcon />
    ) : resolved === "error" ? (
      <ErrorIcon />
    ) : (
      // Steps are numbered from one, whatever their array index.
      index + 1
    ));

  const content = (
    <>
      <span className="sh-step__indicator">{indicator}</span>
      <span className="sh-step__text">
        <span className="sh-step__title">{title}</span>
        {description && <span className="sh-step__description">{description}</span>}
      </span>
    </>
  );

  return (
    <li
      className={[
        "sh-step",
        `sh-step--${resolved}`,
        `sh-step--${orientation}`,
        isLast && "sh-step--last",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {onClick ? (
        <button
          type="button"
          className="sh-step__body sh-step__body--interactive"
          onClick={onClick}
          disabled={disabled}
          // Announced as "current step" rather than just being styled that way.
          aria-current={resolved === "current" ? "step" : undefined}
        >
          {content}
        </button>
      ) : (
        <span
          className="sh-step__body"
          aria-current={resolved === "current" ? "step" : undefined}
        >
          {content}
        </span>
      )}

      {/*
        Decorative: the ordered list already conveys sequence, so the line
        between steps is presentation only.
      */}
      {!isLast && <span className="sh-step__connector" aria-hidden="true" />}
    </li>
  );
}
