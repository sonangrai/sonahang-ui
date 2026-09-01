import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const dirname = import.meta.dirname;

// The name of the cascade layer every library rule is wrapped in. Because
// unlayered CSS beats *all* layered CSS regardless of specificity, putting
// the library in a layer is what lets a consumer's own styles — plain
// classes, CSS modules, Tailwind utilities — override a component just by
// targeting it, without !important or specificity hacks.
const CASCADE_LAYER = 'sonahang-ui';

// A remote `@import url()` is only valid as the first rule of a stylesheet
// and is illegal inside `@layer`, so the font import stays unlayered. It
// declares no rules of its own, so there is nothing for a consumer to
// override there anyway.
const UNLAYERED = ['src/tokens/fonts.css'];

/**
 * Wraps each library CSS file in `@layer sonahang-ui { … }` before Vite's own
 * CSS pipeline sees it. Same-named layer blocks merge, so wrapping the files
 * individually yields one layer in the bundled stylesheet, with the rules in
 * their original order.
 *
 * Only the library build does this — the demo app and Storybook load the
 * source CSS directly and have no consumer styles to lose to.
 */
function cascadeLayerCss(): Plugin {
  return {
    name: 'sonahang-ui:cascade-layer-css',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.css')) return null;
      if (UNLAYERED.some((skip) => file.endsWith(skip))) return null;
      return { code: `@layer ${CASCADE_LAYER} {\n${code}\n}\n`, map: null };
    },
  };
}

// Library build config, separate from vite.config.ts (which serves the demo
// app + Storybook + Vitest). Run via `pnpm build:lib`, which also runs
// tsconfig.build.json afterwards to emit the .d.ts files (vite-plugin-dts
// doesn't emit anything under Vite 8's environment-based build yet, so
// plain tsc handles declarations instead).
export default defineConfig({
  plugins: [react(), cascadeLayerCss()],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      name: 'SonahangUI',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'sonahang-ui.js' : 'sonahang-ui.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // The whole library is client-side (hooks, context, DOM refs), so mark
        // the bundle with the React Server Components directive. Without it,
        // Next.js App Router evaluates these modules on the server and throws
        // "createContext only works in Client Components".
        banner: '"use client";',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
