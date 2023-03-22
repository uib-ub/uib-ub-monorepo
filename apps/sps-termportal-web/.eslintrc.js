module.exports = {
  root: true,
  plugins: ["eslint-plugin-tsdoc"],
  extends: ["@nuxtjs/eslint-config-typescript", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["off"],
    "tsdoc/syntax": "warn",
    "import/default": "warn",
  },
};
