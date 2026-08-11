import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders `content` elsewhere in the DOM. `true` means `document.body`.
 *
 * Not part of the public API.
 */
export function portalInto(content: ReactNode, portal: boolean | HTMLElement): ReactNode {
  if (!portal) return content;

  /*
   * `document` is absent when server rendering, where a portal contributes no
   * markup anyway — so returning nothing here matches what the client will
   * produce and can't cause a hydration mismatch.
   */
  const target =
    portal === true ? (typeof document === "undefined" ? null : document.body) : portal;

  return target ? createPortal(content, target) : null;
}
