/* .mjs, and ESM, because package.json now declares `"type": "module"` - which
   it does so that Node stops reparsing every TypeScript script it runs and
   warning about it. This was the only CommonJS file in the repo. */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
