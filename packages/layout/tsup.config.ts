import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/force-directed.ts','src/hierarchical.ts','src/geometric.ts','src/dimensional.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
