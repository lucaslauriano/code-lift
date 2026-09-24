import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps): React.ReactElement {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm',
        'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
