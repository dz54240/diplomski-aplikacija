import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "node_modules/**", "eslint.config.js"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      // tsconfig.lint.json broadens the include to test/, scripts/, and root
      // config files so eslint can type-check them too. tsconfig.json stays
      // narrow (src/ only) for the tsc build output (dist/).
      parserOptions: { project: "./tsconfig.lint.json" },
    },
  },
];
