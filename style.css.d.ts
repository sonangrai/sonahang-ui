/**
 * Declaration for the `sonahang-ui/style.css` subpath export.
 *
 * TypeScript 6 raises TS2882 for a side-effect import that resolves to no
 * declarations, and not every consumer pulls in a bundler's ambient CSS module
 * types (`vite/client`, `next-env.d.ts`, …). Shipping this means
 * `import 'sonahang-ui/style.css'` typechecks anywhere.
 *
 * Deliberately empty: the stylesheet has no runtime exports, it is only ever
 * imported for its side effect.
 *
 * Lives at the repo root rather than in `dist/` because the library build runs
 * with `emptyOutDir`, which would wipe it on every rebuild. It's listed in
 * `files` so it still ships.
 */

export {};
