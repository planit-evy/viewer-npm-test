import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // your entry file
  format: ['esm', 'cjs'], // output both module types
  dts: true, // generate type declarations
  outDir: 'dist', // build output folder
  clean: true, // clean dist before build
  sourcemap: true, // generate sourcemaps
  external: ['react', 'react-dom'], // don't bundle React
});
