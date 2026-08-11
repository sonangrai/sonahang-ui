import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Same guard as Dialog.css.test.ts, for the same reason: jsdom has no layout
 * engine, so the only way to catch an exit-animation reflow is to check the
 * rule that causes it.
 *
 * A native <dialog> is `display: none` until [open], so `display` has to be
 * scoped to that state. But only the properties being transitioned may live
 * there — everything else reverts the instant [open] is removed, while the
 * element is still on screen for the length of the slide out.
 */
const css = readFileSync(path.join(import.meta.dirname, "../Drawer.css"), "utf8");

/** Properties declared in a top-level rule — indented copies are skipped. */
const propertiesIn = (selector: string): string[] => {
  const pattern = new RegExp(`^${selector.replace(/[.[\]]/g, "\\$&")} \\{([^}]*)\\}`, "m");
  const block = css.match(pattern);
  if (!block) throw new Error(`No top-level rule found for ${selector}`);

  return [...block[1].matchAll(/^\s*([a-z-]+)\s*:/gm)].map((match) => match[1]);
};

describe("Drawer.css", () => {
  it("scopes only the transitioned properties to [open]", () => {
    expect(propertiesIn(".sh-drawer[open]").sort()).toEqual(["display", "transform"]);
  });

  it("keeps the layout on the base rule", () => {
    // So it survives the slide out rather than snapping back.
    expect(propertiesIn(".sh-drawer")).toContain("flex-direction");
  });

  it("still scopes display to [open]", () => {
    // Unscoped, it would beat the UA's `display: none` and leave every drawer
    // on screen permanently.
    expect(propertiesIn(".sh-drawer")).not.toContain("display");
    expect(propertiesIn(".sh-drawer[open]")).toContain("display");
  });

  it("gives every side a resting offset for [open] to cancel", () => {
    // A side without one would appear instantly instead of sliding.
    for (const side of ["left", "right", "top", "bottom"]) {
      expect(propertiesIn(`.sh-drawer--${side}`)).toContain("transform");
    }
  });
});
