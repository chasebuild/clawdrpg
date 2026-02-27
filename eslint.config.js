const js = require('@eslint/js');
const tseslintParser = require('@typescript-eslint/parser');
const tseslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/references/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.log',
      '**/*.js',
      '**/.next/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        globalThis: 'readonly',
        alert: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'no-undef': 'off',
    },
  },
];
