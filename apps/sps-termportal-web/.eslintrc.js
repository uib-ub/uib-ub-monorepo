module.exports = {
  root: true,
  extends: ["custom/nuxt"],
  plugins: ["eslint-plugin-tsdoc"],
  rules: {"vue/no-v-html": "off"},
};
