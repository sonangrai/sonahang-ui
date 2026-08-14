import { describe, expect, it } from "vitest";

import { buttonClassNames } from "../buttonClassNames";

describe("buttonClassNames", () => {
  it("defaults to a medium primary button", () => {
    expect(buttonClassNames()).toBe("sh-button sh-button--primary sh-button--md");
  });

  it("applies the variant and size", () => {
    expect(buttonClassNames({ variant: "outline", size: "lg" })).toBe(
      "sh-button sh-button--outline sh-button--lg",
    );
  });

  it("adds the full-width modifier", () => {
    expect(buttonClassNames({ fullWidth: true })).toContain("sh-button--full-width");
  });

  it("adds the loading modifier", () => {
    expect(buttonClassNames({ loading: true })).toContain("sh-button--loading");
  });

  it("leaves the modifiers off when not asked for", () => {
    const classes = buttonClassNames();

    expect(classes).not.toContain("full-width");
    expect(classes).not.toContain("loading");
  });

  it("appends a custom className last", () => {
    expect(buttonClassNames({ className: "mine" }).endsWith("mine")).toBe(true);
  });

  it("skips an undefined className rather than printing it", () => {
    expect(buttonClassNames({ className: undefined })).not.toContain("undefined");
  });
});
