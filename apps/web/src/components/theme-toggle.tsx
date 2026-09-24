'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@code-lift/ui/button';

/**
 * Theme switch with no mounted-state dance.
 *
 * The server cannot know the stored theme, so instead of hiding the icon until hydration, both
 * icons render and CSS picks one from the `.light` class next-themes puts on <html>. No effect,
 * no cascading render, no hydration mismatch.
 */
export function ThemeToggle(): React.ReactElement {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      <Moon className="light:hidden" aria-hidden />
      <Sun className="hidden light:block" aria-hidden />
    </Button>
  );
}
