import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // These packages ship TypeScript source rather than a build step, so Next compiles them.
  transpilePackages: ['@code-lift/ui'],
  typedRoutes: true,
};

export default config;
