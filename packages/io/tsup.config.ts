import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/graphml.ts','src/gml.ts','src/dot.ts','src/edgelist.ts','src/pajek.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
