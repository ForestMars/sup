import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'eslint.config.*'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Apply this to everything
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        Bun: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.ts', 'eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'error',
      // This rule causes the crash on files without a tsconfig
      '@typescript-eslint/no-floating-promises': 'warn', 
    },
  },
  {
    // FIX: Disable type-aware rules for files NOT in your packages (CLI, tests, etc.)
    // This stops the "don't have parserOptions set" crash.
    files: ['apps/cli/**/*.ts', 'tests/**/*.ts', 'apps/bedside/**/*.tsx'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // Explicitly turn off the rule that's crashing the CLI linter
      '@typescript-eslint/no-floating-promises': 'off',
    }
  }
);