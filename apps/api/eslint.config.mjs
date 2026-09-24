import base from '@code-lift/config/eslint/base';

export default [
  ...base,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    rules: {
      /**
       * Off here, and only here.
       *
       * Nest resolves constructor injection from the `design:paramtypes` metadata that
       * `emitDecoratorMetadata` writes, which references the injected class *at runtime*. Rewriting
       * `import { ConfigService }` to `import type { ConfigService }` erases that import, and the
       * failure is a runtime "Nest can't resolve dependencies" at boot — not a type error. The
       * autofix for this rule would silently break dependency injection across the app.
       */
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    // Seed and one-off scripts are meant to talk to the operator.
    files: ['src/seed.ts'],
    rules: { 'no-console': 'off' },
  },
];
