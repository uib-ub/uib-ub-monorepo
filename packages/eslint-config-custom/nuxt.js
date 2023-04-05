module.exports = {
  extends: ["@nuxtjs/eslint-config-typescript", "./base.js"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["off"],
    "tsdoc/syntax": "warn",
    "import/default": "warn",
  },
  plugins: ["simple-import-sort"],
};
