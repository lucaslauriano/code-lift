'use client';

import { RotateCcw } from 'lucide-react';
import type { Submission } from '@code-lift/shared';
import { Button } from '@code-lift/ui/button';
import { cn } from '@code-lift/ui/cn';

export function SubmissionsPanel({
  submissions,
  loading,
  onRestore,
}: {
  submissions: Submission[];
  loading: boolean;
  onRestore: (code: string) => void;
}): React.ReactElement {
  if (loading) {
    return <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>;
  }

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        No submissions yet. Submit runs your code against every case, including the hidden and
        performance ones.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {submissions.map((submission) => (
        <li
          key={submission.id}
          className="rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className={cn(
                'font-medium',
                submission.status === 'passed'
                  ? 'text-[var(--success)]'
                  : 'text-[var(--destructive)]',
              )}
            >
              {submission.passedCases}/{submission.totalCases} cases
            </span>
            {submission.perfTotal > 0 ? (
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                perf {submission.perfPassed}/{submission.perfTotal}
              </span>
            ) : null}
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              {Math.round(submission.durationMs)}ms
            </span>
            {submission.mockSessionId ? (
              <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                mock
              </span>
            ) : null}
            <time
              dateTime={submission.createdAt}
              className="ml-auto text-xs text-[var(--muted-foreground)]"
            >
              {new Date(submission.createdAt).toLocaleString()}
            </time>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-1.5 -ml-2"
            onClick={() => onRestore(submission.code)}
          >
            <RotateCcw /> Load this code
          </Button>
        </li>
      ))}
    </ul>
  );
}
