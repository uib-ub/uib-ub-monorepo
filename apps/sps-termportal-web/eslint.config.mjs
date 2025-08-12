import { createConfigForNuxt } from "@nuxt/eslint-config/flat";

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: true,
      indent: 2,
      quotes: "double",
    },
  },
}).append({
  files: ["**/*.{js,ts,vue}"],
  rules: {
    "vue/no-v-html": "off",
    "tsdoc/syntax": "warn",
    "import/default": "warn",
  },
  plugins: {
    tsdoc: (await import("eslint-plugin-tsdoc")).default,
  },
});
