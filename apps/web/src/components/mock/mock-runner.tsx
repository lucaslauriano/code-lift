'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Timer, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { TOPTAL_CODILITY_PRESET, type MockSession } from '@code-lift/shared';
import { Badge } from '@code-lift/ui/badge';
import { Button } from '@code-lift/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-lift/ui/card';
import { cn } from '@code-lift/ui/cn';
import {
  useActiveMockSession,
  useFinishMockSession,
  useMockSessions,
  useStartMockSession,
} from '@/lib/queries';

export function MockHome(): React.ReactElement {
  const router = useRouter();
  const active = useActiveMockSession();
  const history = useMockSessions();
  const start = useStartMockSession();

  const session = active.data?.session ?? null;

  return (
    <div className="flex flex-col gap-4 p-6">
      {session ? (
        <ActiveSessionCard session={session} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Codility preset</CardTitle>
            <CardDescription>
              {TOPTAL_CODILITY_PRESET.durationMinutes} minutes,{' '}
              {TOPTAL_CODILITY_PRESET.questionCount} questions across difficulties and topics, drawn
              from what you have not solved. No solutions or editorials until the clock stops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={start.isPending || active.isPending}
              onClick={() =>
                start.mutate(undefined, {
                  onSuccess: (created) => router.push(`/mock/${created.id}`),
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : 'Could not start a mock.'),
                })
              }
            >
              <Timer /> {start.isPending ? 'Starting…' : 'Start mock test'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Past sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {history.isPending ? (
            <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
          ) : (history.data ?? []).length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No sessions yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(history.data ?? []).map((past) => (
                <li key={past.id}>
                  <Link
                    href={`/mock/${past.id}`}
                    className="flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--accent)]"
                  >
                    <time dateTime={past.startedAt} className="text-[var(--muted-foreground)]">
                      {new Date(past.startedAt).toLocaleString()}
                    </time>
                    <span className="ml-auto font-mono tabular-nums">
                      {past.finishedAt ? `${Math.round(past.score ?? 0)}/100` : 'in progress'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActiveSessionCard({ session }: { session: MockSession }): React.ReactElement {
  return (
    <Card className="border-[var(--primary)]">
      <CardHeader>
        <CardTitle>A session is running</CardTitle>
        <CardDescription>Only one at a time. Finish it before starting another.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={`/mock/${session.id}`}
          className="inline-flex h-9 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Resume session
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * The live session screen: a countdown driven by the server's deadline, and the three questions.
 *
 * The clock is presentation only — `endsAt` is set and enforced server-side, so pausing the tab or
 * editing local time buys nothing.
 */
export function MockSessionView({ session }: { session: MockSession }): React.ReactElement {
  const router = useRouter();
  const finish = useFinishMockSession(session.id);
  const remaining = useCountdown(session.endsAt, session.finishedAt !== null);

  const over = session.finishedAt !== null;
  const expired = !over && remaining <= 0;

  // The session is over the moment the clock hits zero; closing it out is what produces the score.
  useEffect(() => {
    if (!expired || finish.isPending || finish.isSuccess) return;
    finish.mutate(undefined, {
      onSuccess: () => {
        toast.info('Time is up. The session has been scored.');
        router.refresh();
      },
    });
  }, [expired, finish, router]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card className={cn(!over && 'border-[var(--primary)]')}>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div>
            <p className="text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
              {over ? 'Finished' : 'Time remaining'}
            </p>
            <p
              className={cn(
                'font-mono text-3xl font-semibold tabular-nums',
                !over && remaining < 5 * 60_000 && 'text-[var(--destructive)]',
              )}
            >
              {over ? `${Math.round(session.score ?? 0)}/100` : formatRemaining(remaining)}
            </p>
          </div>

          {!over ? (
            <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <TriangleAlert className="size-4" />
              Solutions and editorials are locked until this ends.
            </p>
          ) : null}

          {!over ? (
            <Button
              variant="outline"
              className="ml-auto"
              disabled={finish.isPending}
              onClick={() =>
                finish.mutate(undefined, {
                  onSuccess: () => router.refresh(),
                })
              }
            >
              {finish.isPending ? 'Scoring…' : 'Finish now'}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {over && session.results ? (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              Correctness counts for 70, performance for 30. Editorials are unlocked now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {session.results.map((result) => (
                <li
                  key={result.questionSlug}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[var(--border)] px-3 py-2.5"
                >
                  <Link
                    href={`/questions/${result.questionSlug}`}
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    {result.title}
                  </Link>
                  <Badge tone={result.difficulty}>{result.difficulty}</Badge>
                  {!result.attempted ? <Badge>not attempted</Badge> : null}
                  <span className="font-mono text-xs text-[var(--muted-foreground)] tabular-nums">
                    {result.passedCases}/{result.totalCases} cases · perf {result.perfPassed}/
                    {result.perfTotal}
                  </span>
                  <span
                    className={cn(
                      'ml-auto font-mono font-semibold tabular-nums',
                      result.score >= 80
                        ? 'text-[var(--success)]'
                        : result.score >= 40
                          ? 'text-[var(--warning)]'
                          : 'text-[var(--destructive)]',
                    )}
                  >
                    {result.score}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {session.questionSlugs.map((slug, index) => (
                <li key={slug}>
                  <Link
                    href={`/questions/${slug}`}
                    className="flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2.5 text-sm hover:bg-[var(--accent)]"
                  >
                    <span className="font-mono text-[var(--muted-foreground)]">{index + 1}</span>
                    <span className="font-medium">{slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Milliseconds left against the server's deadline, ticking once a second. */
function useCountdown(endsAt: string, frozen: boolean): number {
  const deadline = Date.parse(endsAt);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => setRemaining(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(id);
  }, [deadline, frozen]);

  return remaining;
}

function formatRemaining(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
