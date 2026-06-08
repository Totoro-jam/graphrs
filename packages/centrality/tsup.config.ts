import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/pagerank.ts','src/betweenness.ts','src/closeness.ts','src/eigenvector.ts','src/hits.ts','src/katz.ts','src/harmonic.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
