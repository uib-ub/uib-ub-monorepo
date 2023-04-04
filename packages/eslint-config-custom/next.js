module.exports = {
  extends: ["next/core-web-vitals", "./base.js"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
  },
  plugins: [],
};
