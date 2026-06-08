import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/layout.ts', 'src/analysis.ts', 'src/adapters.ts', 'src/types.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  splitting: true,
  treeshake: true,
  external: [
    '@graphrs/core',
    '@graphrs/layout',
    '@graphrs/community',
    '@graphrs/centrality',
    '@antv/g6',
  ],
});
