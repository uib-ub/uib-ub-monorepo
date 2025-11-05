import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import { config as baseConfig } from "./index.js";

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: true,
      indent: 2,
      quotes: "double",
    },
  },
}).append(...baseConfig, {
  files: ["**/*.{js,ts,vue}"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["off"],
    "tsdoc/syntax": "warn",
    "import/default": "warn",
  },
  plugins: {
    "simple-import-sort": (await import("eslint-plugin-simple-import-sort"))
      .default,
  },
});
