import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/vf2.ts','src/canonical.ts','src/automorphism.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
