import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'admin'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off', // 개발 중이므로 console 허용
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
