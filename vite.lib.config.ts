import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = import.meta.dirname;

// Library build config, separate from vite.config.ts (which serves the demo
// app + Storybook + Vitest). Run via `pnpm build:lib`, which also runs
// tsconfig.build.json afterwards to emit the .d.ts files (vite-plugin-dts
// doesn't emit anything under Vite 8's environment-based build yet, so
// plain tsc handles declarations instead).
export default defineConfig({
  plugins: [react()],
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
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
