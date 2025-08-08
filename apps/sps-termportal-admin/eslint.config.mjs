import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: false,
      indent: 2,
      quotes: 'single',
    }
  }
})
  .append({
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'vue/no-v-html': 'off',
      'tsdoc/syntax': 'warn',
    },
    plugins: {
      'tsdoc': (await import('eslint-plugin-tsdoc')).default,
    },
  }) 