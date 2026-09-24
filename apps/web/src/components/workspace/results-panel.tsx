'use client';

import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import type { CaseResult, CaseStatus, LogEntry, RunResult } from '@code-lift/shared';
import { cn } from '@code-lift/ui/cn';

const STATUS_STYLE: Record<
  CaseStatus,
  { icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  passed: { icon: Check, tone: 'text-[var(--success)]', label: 'Passed' },
  failed: { icon: X, tone: 'text-[var(--destructive)]', label: 'Failed' },
  error: { icon: AlertTriangle, tone: 'text-[var(--warning)]', label: 'Error' },
  timeout: { icon: Clock, tone: 'text-[var(--warning)]', label: 'Timed out' },
};

interface ResultsPanelProps {
  running: boolean;
  liveCases: CaseResult[];
  result: RunResult | null;
}

export function ResultsPanel({
  running,
  liveCases,
  result,
}: ResultsPanelProps): React.ReactElement {
  // While a run is in flight the finished cases are shown as they stream in; once it settles the
  // authoritative list takes over, because it also contains the cases that never reported.
  const cases = result?.cases.length ? result.cases : liveCases;

  if (result?.compileError) {
    return (
      <div className="p-4">
        <p className="mb-2 text-sm font-medium text-[var(--destructive)]">Could not compile</p>
        <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 font-mono text-xs whitespace-pre-wrap">
          {result.compileError}
        </pre>
      </div>
    );
  }

  if (!running && !result && cases.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
        Run your code to see results. <Kbd>⌘</Kbd> <Kbd>↵</Kbd> runs the public cases, <Kbd>⌘</Kbd>{' '}
        <Kbd>⇧</Kbd> <Kbd>↵</Kbd> submits against every case.
      </p>
    );
  }

  const passed = cases.filter((testCase) => testCase.status === 'passed').length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-2.5 text-sm">
        {running ? (
          <span className="text-[var(--muted-foreground)]">Running…</span>
        ) : (
          <span
            className={cn(
              'font-medium',
              passed === cases.length ? 'text-[var(--success)]' : 'text-[var(--destructive)]',
            )}
          >
            {passed} / {cases.length} passed
          </span>
        )}
        {result ? (
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {Math.round(result.durationMs)}ms total
          </span>
        ) : null}
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {cases.map((testCase) => (
          <CaseRow key={testCase.index} result={testCase} />
        ))}
      </ul>
    </div>
  );
}

function CaseRow({ result }: { result: CaseResult }): React.ReactElement {
  const { icon: Icon, tone, label } = STATUS_STYLE[result.status];
  const failed = result.status !== 'passed';

  return (
    <li className="px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={cn('size-4 shrink-0', tone)} aria-hidden />
        <span className="sr-only">{label}:</span>
        <span className="min-w-0 flex-1 truncate text-sm">{result.name}</span>

        {result.hidden ? <Tag>hidden</Tag> : null}
        {result.perf ? <Tag>perf</Tag> : null}
        <span className="font-mono text-xs text-[var(--muted-foreground)] tabular-nums">
          {formatDuration(result.durationMs)}
        </span>
      </div>

      {failed ? (
        <div className="mt-2 ml-6.5 flex flex-col gap-1 font-mono text-xs">
          {result.error ? (
            <p className="whitespace-pre-wrap text-[var(--warning)]">{result.error}</p>
          ) : null}
          {result.expected !== null ? (
            <p className="text-[var(--muted-foreground)]">
              expected <span className="text-[var(--foreground)]">{result.expected}</span>
            </p>
          ) : null}
          {result.received !== null ? (
            <p className="text-[var(--muted-foreground)]">
              received <span className="text-[var(--destructive)]">{result.received}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function ConsolePanel({ logs }: { logs: LogEntry[] }): React.ReactElement {
  if (logs.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
        Nothing logged yet. <code className="font-mono">console.log</code> from your solution shows
        up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--border)] font-mono text-xs">
      {logs.map((log, index) => (
        <li key={index} className="flex gap-3 px-4 py-1.5">
          <span className="shrink-0 text-[var(--muted-foreground)]">
            {log.caseIndex === null ? '—' : `#${log.caseIndex + 1}`}
          </span>
          <span
            className={cn(
              'whitespace-pre-wrap',
              log.level === 'error' && 'text-[var(--destructive)]',
              log.level === 'warn' && 'text-[var(--warning)]',
            )}
          >
            {log.message}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Tag({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] tracking-wide text-[var(--muted-foreground)] uppercase">
      {children}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[11px]">
      {children}
    </kbd>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
