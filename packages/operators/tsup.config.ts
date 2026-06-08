import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/set-operations.ts','src/transforms.ts','src/subgraph.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
