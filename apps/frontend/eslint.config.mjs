import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt().append(
  {
    files: ['app/test-helpers/**/*.ts', 'app/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
)
