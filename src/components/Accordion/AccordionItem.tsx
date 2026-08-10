import { createElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { panelId, triggerId, useAccordionContext } from "./accordion.context";
import "./Accordion.css";

const ChevronIcon = () => (
  <svg
    className="sh-accordion__chevron"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    aria-hidden="true"
  >
    <path d="M4 6.5 8 10.5l4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type AccordionItemProps = {
  /** Identifies this section in the accordion's open list. */
  value: string;
  /** Content of the trigger. */
  title: ReactNode;
  /** Body revealed when open. */
  children?: ReactNode;
  /** Prevents the section being opened or closed. */
  disabled?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "title">;

/** One collapsible section of an `Accordion`. */
export function AccordionItem({
  value,
  title,
  children,
  disabled = false,
  className,
  ...props
}: AccordionItemProps) {
  const { value: openValues, toggle, baseId, headingLevel } = useAccordionContext(
    "AccordionItem",
  );
  const isOpen = openValues.includes(value);

  const trigger = (
    <button
      type="button"
      id={triggerId(baseId, value)}
      className="sh-accordion__trigger"
      aria-expanded={isOpen}
      aria-controls={panelId(baseId, value)}
      disabled={disabled}
      onClick={() => toggle(value)}
    >
      <span className="sh-accordion__title">{title}</span>
      <ChevronIcon />
    </button>
  );

  return (
    <div
      className={[
        "sh-accordion__item",
        isOpen && "sh-accordion__item--open",
        disabled && "sh-accordion__item--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/*
        A real heading, at the rank the page needs, so the sections appear in
        the document outline and in screen-reader heading navigation.
      */}
      {createElement(`h${headingLevel}`, { className: "sh-accordion__heading" }, trigger)}

      {/*
        Kept mounted so the open/close transition has something to animate.
        The panel collapses to zero height and its contents are taken out of
        the accessibility tree and tab order by `visibility` — see the CSS.
      */}
      <div
        id={panelId(baseId, value)}
        className="sh-accordion__panel"
        role="region"
        aria-labelledby={triggerId(baseId, value)}
      >
        <div className="sh-accordion__panel-inner">
          <div className="sh-accordion__content">{children}</div>
        </div>
      </div>
    </div>
  );
}
