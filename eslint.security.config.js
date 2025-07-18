/**
 * Configuration ESLint avancée pour la sécurité
 * Détecte les vulnérabilités et mauvaises pratiques de sécurité
 */

module.exports = {
  extends: [
    './eslint.config.js',
    'plugin:security/recommended'
  ],
  plugins: [
    'security'
  ],
  rules: {
    // Règles de sécurité strictes
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',

    // Règles TypeScript de sécurité
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',

    // Interdire les pratiques dangereuses
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'warn',
    'no-console': 'warn',

    // Validation des entrées
    'no-regex-spaces': 'error',
    'no-control-regex': 'error',
    'no-invalid-regexp': 'error',

    // Gestion des erreurs
    'no-empty-function': 'warn',
    'no-unused-vars': 'error',
    'prefer-promise-reject-errors': 'error',

    // Bonnes pratiques
    'strict': ['error', 'never'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        'security/detect-object-injection': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['src/utils/security/**/*.{ts,tsx}'],
      rules: {
        'security/detect-eval-with-expression': 'off' // Autorisé dans les utilitaires de sécurité
      }
    }
  ],
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};