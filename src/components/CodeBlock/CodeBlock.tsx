import { useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";

import { dedentCode } from "./dedentCode";
import "./CodeBlock.css";

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <rect x="5.75" y="5.75" width="8" height="8" rx="1.5" />
    <path d="M10.5 3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type CopyState = "idle" | "copied" | "error";

/** How long the copied/failed state stays up before reverting. */
const FEEDBACK_MS = 2000;

export type CodeBlockProps = {
  /**
   * The code.
   *
   * A string rather than nodes, because it has to be copied to the clipboard
   * and counted into lines — neither of which is possible with arbitrary
   * children. Shared indentation is stripped, so a template literal can be
   * indented to match the code around it.
   */
  children: string;
  /** Shown on the left of the header. */
  filename?: string;
  /**
   * Puts `language-<value>` on the `<code>`, which is the hook Prism, Shiki
   * and highlight.js look for. Nothing here highlights anything — see the
   * component docs. Also labels the header when there's no filename.
   */
  language?: string;
  /** Numbers down the left of the code. Defaults to false. */
  showLineNumbers?: boolean;
  /** Soft-wraps long lines instead of scrolling sideways. Defaults to false. */
  wrap?: boolean;
  /** Whether to render the copy button. Defaults to true. */
  copyable?: boolean;
  /** Accessible name for the copy button. Defaults to "Copy code". */
  copyLabel?: string;
  /** Caps the height of the code area, which scrolls past it. */
  maxHeight?: number | string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

/**
 * Code with a filename and a copy button.
 *
 * **It does not highlight anything.** A syntax highlighter is a large
 * dependency with opinions about themes and grammars, and this library ships
 * none. `language` puts the conventional `language-*` class on the `<code>`
 * so whichever highlighter the consumer already has can pick the block up.
 */
export function CodeBlock({
  children,
  filename,
  language,
  showLineNumbers = false,
  wrap = false,
  copyable = true,
  copyLabel = "Copy code",
  maxHeight,
  className,
  ...props
}: CodeBlockProps) {
  const code = dedentCode(children);
  const labelId = useId();

  const [copyState, setCopyState] = useState<CopyState>("idle");
  const timerRef = useRef<number | undefined>(undefined);

  // A pending timer would otherwise fire into an unmounted component.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    window.clearTimeout(timerRef.current);

    try {
      // Absent outside a secure context, where the property access itself
      // throws — hence the try rather than a feature check.
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    timerRef.current = window.setTimeout(() => setCopyState("idle"), FEEDBACK_MS);
  };

  const headerLabel = filename ?? language;
  const showHeader = headerLabel !== undefined || copyable;

  return (
    <div
      className={[
        "sh-code-block",
        wrap && "sh-code-block--wrap",
        showLineNumbers && "sh-code-block--numbered",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {showHeader && (
        <div className="sh-code-block__header">
          {headerLabel !== undefined && (
            <span id={labelId} className="sh-code-block__filename">
              {headerLabel}
            </span>
          )}

          {copyable && (
            /*
             * margin-left: auto in the CSS rather than space-between, so the
             * button stays hard right whether or not there's a filename.
             */
            <button
              type="button"
              className="sh-code-block__copy"
              aria-label={copyLabel}
              onClick={handleCopy}
            >
              {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
            </button>
          )}
        </div>
      )}

      {/*
        Focusable so the code can be scrolled without a pointer. `group` rather
        than `region` because a page of code blocks shouldn't be a page of
        landmarks.
      */}
      <pre
        className="sh-code-block__pre"
        tabIndex={0}
        role={headerLabel !== undefined ? "group" : undefined}
        aria-labelledby={headerLabel !== undefined ? labelId : undefined}
        style={maxHeight === undefined ? undefined : { maxHeight }}
      >
        <code className={["sh-code-block__code", language && `language-${language}`].filter(Boolean).join(" ")}>
          {/*
            Split into per-line elements only when numbering, so the plain case
            leaves a clean text node for a highlighter to work on. The numbers
            come from a CSS counter, which keeps them out of the clipboard and
            puts them in the right place when a line wraps.
          */}
          {showLineNumbers
            ? code
                .split("\n")
                // The index is the right key here: a line has no identity
                // beyond its position, and the whole list is re-derived
                // whenever the code changes.
                .map((line, index, all) => (
                  <span key={index} className="sh-code-block__line">
                    {line}
                    {index < all.length - 1 ? "\n" : ""}
                  </span>
                ))
            : code}
        </code>
      </pre>

      {copyable && (
        <span role="status" aria-live="polite" className="sh-code-block__status">
          {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : ""}
        </span>
      )}
    </div>
  );
}
