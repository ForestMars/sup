module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // Point to all tsconfigs for workspace packages
    project: [
      './packages/*/tsconfig.json'
    ],
    tsconfigRootDir: __dirname
  },
  ignorePatterns: [
    '**/node_modules/*',
    '**/dist/*',
    '**/build/*',
    '**/*.json',
    '**/tsconfig.json',
    '.eslintrc.js',
    '**/*.yaml',
    '**/*.yml'
  ],
  env: {
    es2020: true,
    node: true,
    browser: false
  },
  rules: {
    // Customize or extend these as needed for your team
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'no-unused-vars': 'off', // Delegate to TS
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-floating-promises': 'warn'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: '*.test.ts',
      rules: {
        // Example: be less strict in tests
      }
    }
  ],
  settings: {
    'import/resolver': {
      typescript: {
        // Ensures ESLint finds your tsconfigs
        project: './packages/*/tsconfig.json'
      }
    }
  }
};