import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * The closing animation is a whole-element transition, and jsdom has no layout
 * engine to watch it with. What can be checked is the rule that makes it work.
 *
 * A native <dialog> is `display: none` until [open], so `display` has to be
 * scoped to that state. But only the properties being transitioned may live
 * there: everything else reverts the instant [open] is removed, while the
 * element is still on screen for the length of the exit animation. Putting
 * `flex-direction: column` in that block reflowed the header, body and footer
 * into a row for 180ms on every close.
 */
const css = readFileSync(path.join(import.meta.dirname, "../Dialog.css"), "utf8");

/** Properties declared in a top-level rule — indented copies are skipped. */
const propertiesIn = (selector: string): string[] => {
  const pattern = new RegExp(
    `^${selector.replace(/[.[\]]/g, "\\$&")} \\{([^}]*)\\}`,
    "m",
  );
  const block = css.match(pattern);
  if (!block) throw new Error(`No top-level rule found for ${selector}`);

  return [...block[1].matchAll(/^\s*([a-z-]+)\s*:/gm)].map((match) => match[1]);
};

describe("Dialog.css", () => {
  it("scopes only the transitioned properties to [open]", () => {
    const transitioned = ["display", "opacity", "transform"];

    expect(propertiesIn(".sh-dialog[open]").sort()).toEqual(transitioned);
  });

  it("keeps the layout on the base rule", () => {
    // So it survives the exit animation rather than snapping back.
    expect(propertiesIn(".sh-dialog")).toContain("flex-direction");
  });

  it("still scopes display to [open]", () => {
    // Unscoped, it would beat the UA's `display: none` and leave every dialog
    // on screen permanently.
    expect(propertiesIn(".sh-dialog")).not.toContain("display");
    expect(propertiesIn(".sh-dialog[open]")).toContain("display");
  });
});
