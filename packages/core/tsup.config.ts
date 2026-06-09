import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/graph-only.ts', 'src/worker.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
  splitting: true,
  treeshake: true,
});
