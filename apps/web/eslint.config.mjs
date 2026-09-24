import react from '@code-lift/config/eslint/react';

export default [
  ...react,
  { ignores: ['.next/**', 'next-env.d.ts', 'test-results/**', 'playwright-report/**'] },
  {
    // Playwright fixtures destructure a parameter called `use`, which the React hooks rule reads as
    // a hook call in a non-component function. These files contain no React at all.
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
];
