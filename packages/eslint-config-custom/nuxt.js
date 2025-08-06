import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { config as baseConfig } from "./index.js";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default tseslint.config(
  ...baseConfig,
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      parser: (await import("@nuxtjs/eslint-config-typescript")).default,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["off"],
      "tsdoc/syntax": "warn",
      "import/default": "warn",
    },
    plugins: {
      "simple-import-sort": (await import("eslint-plugin-simple-import-sort")).default,
    },
  },
);
