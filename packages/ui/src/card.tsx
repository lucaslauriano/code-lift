import type { HTMLAttributes } from 'react';
import { cn } from './cn';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps): React.ReactElement {
  return <div className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: DivProps): React.ReactElement {
  return <h3 className={cn('text-base leading-none font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: DivProps): React.ReactElement {
  return <p className={cn('text-sm text-[var(--muted-foreground)]', className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps): React.ReactElement {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps): React.ReactElement {
  return <div className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}
