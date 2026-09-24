import type { LabelHTMLAttributes } from 'react';
import { cn } from './cn';

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement {
  return (
    <label
      className={cn('text-sm font-medium text-[var(--foreground)] select-none', className)}
      {...props}
    />
  );
}
