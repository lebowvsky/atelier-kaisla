import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt().append(
  {
    files: ['app/test-helpers/**/*.ts', 'app/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
