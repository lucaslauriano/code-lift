import base from '@code-lift/config/eslint/base';

export default [
  ...base,
  {
    // Question sources are authored content, not library code: a starter file is meant to have an
    // unused parameter, and a solution is meant to be readable rather than idiomatic-for-this-repo.
    files: ['questions/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
