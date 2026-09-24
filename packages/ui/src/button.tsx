import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
        secondary: 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)]',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]',
        ghost:
          'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  children?: ReactNode;
}

export function Button({ className, variant, size, ...props }: ButtonProps): React.ReactElement {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export { button as buttonVariants };
