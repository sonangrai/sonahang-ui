import "./Logo.css";

export type LogoProps = {
  className?: string;
};

/** Wordmark for the design system — the `sonahang-ui` lockup with its accent rule. */
export function Logo({ className }: LogoProps) {
  const classes = ["sh-logo", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className="sh-logo__wordmark">
        sonahang
        <span className="sh-logo__accent">-ui</span>
      </span>
      <span className="sh-logo__rule" />
    </div>
  );
}
