import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { babel } from "@rollup/plugin-babel";

const minify = terser({
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: false,
  },
});

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/fireworks.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/fireworks.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/fireworks.esm.min.js",
      format: "es",
      plugins: [minify],
      sourcemap: true,
    },
    {
      file: "dist/fireworks.umd.js",
      format: "umd",
      name: "Fireworks",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/fireworks.min.js",
      format: "umd",
      name: "Fireworks",
      exports: "named",
      plugins: [minify],
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    babel({
      babelHelpers: "bundled",
      extensions: [".js"],
      exclude: "node_modules/**",
    }),
  ],
};
