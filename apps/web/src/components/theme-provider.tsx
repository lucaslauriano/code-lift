'use client';

import { ThemeProvider as NextThemes } from 'next-themes';

/** Dark is the default; the class strategy keeps the tokens in packages/ui in charge. */
export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
