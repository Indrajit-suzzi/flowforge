import globals from 'globals';

export default [
  { ignores: ['dist', 'uploads', 'node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2022 },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'multi-line'],
      'no-throw-literal': 'error',
    },
  },
];
