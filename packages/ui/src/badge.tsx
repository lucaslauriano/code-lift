import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from './cn';

const badge = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        easy: 'bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]',
        medium: 'bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]',
        hard: 'bg-[color-mix(in_oklch,var(--destructive)_18%,transparent)] text-[var(--destructive)]',
        accent: 'bg-[color-mix(in_oklch,var(--primary)_18%,transparent)] text-[var(--primary)]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export function Badge({ className, tone, ...props }: BadgeProps): React.ReactElement {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
