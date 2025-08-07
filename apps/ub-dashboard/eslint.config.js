import { config } from "eslint-config-custom/next";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];