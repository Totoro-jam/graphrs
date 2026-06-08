import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/adapters.ts', 'src/use-graphrs-layout.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  splitting: true,
  treeshake: true,
  external: ['react', '@xyflow/react', '@graphrs/core', '@graphrs/layout'],
});
