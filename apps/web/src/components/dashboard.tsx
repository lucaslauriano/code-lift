'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import type { ProgressSummary, TopicProgress } from '@code-lift/shared';
import { Badge } from '@code-lift/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-lift/ui/card';
import { cn } from '@code-lift/ui/cn';
import { useProgressSummary } from '@/lib/queries';

export function Dashboard(): React.ReactElement {
  const { data, isPending, isError } = useProgressSummary();

  if (isError) {
    return <p className="p-6 text-sm text-[var(--destructive)]">Could not load your progress.</p>;
  }
  if (isPending) {
    return (
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} className="h-40 animate-pulse bg-[var(--muted)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      <SolvedCard summary={data} />
      <StreakCard summary={data} />
      <WeakTopicsCard topics={data.byTopic} />
      <ActivityCard summary={data} />
      <RecentCard summary={data} />
    </div>
  );
}

function SolvedCard({ summary }: { summary: ProgressSummary }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solved</CardTitle>
        <CardDescription>Questions with every case passing.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-3xl font-semibold tabular-nums">
          {summary.totals.done}
          <span className="ml-1 text-base font-normal text-[var(--muted-foreground)]">
            / {summary.totals.total}
          </span>
        </p>
        <div className="flex flex-col gap-2">
          {summary.byDifficulty.map((group) => (
            <div key={group.difficulty}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <Badge tone={group.difficulty}>{group.difficulty}</Badge>
                <span className="font-mono text-[var(--muted-foreground)] tabular-nums">
                  {group.done}/{group.total}
                </span>
              </div>
              <Meter value={group.total > 0 ? group.done / group.total : 0} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StreakCard({ summary }: { summary: ProgressSummary }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak</CardTitle>
        <CardDescription>Consecutive days with a question solved.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* A screen reader should hear one phrase, not "3" followed by "days". aria-label is
            prohibited on a paragraph, so the spoken version is real text and the split-up visual
            pieces are hidden from assistive technology instead. */}
        <p className="flex items-baseline gap-2">
          <Flame
            aria-hidden
            className={cn(
              'size-7 self-center',
              summary.streakDays > 0 ? 'text-[var(--warning)]' : 'text-[var(--muted-foreground)]',
            )}
          />
          <span aria-hidden className="text-3xl font-semibold tabular-nums">
            {summary.streakDays}
          </span>
          <span aria-hidden className="text-sm text-[var(--muted-foreground)]">
            day{summary.streakDays === 1 ? '' : 's'}
          </span>
          <span className="sr-only">
            {summary.streakDays} day{summary.streakDays === 1 ? '' : 's'} streak
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Topics ranked by how often submissions there fail.
 *
 * Deliberately not "topics you have not started": a topic you keep attempting and keep failing is
 * the one worth practising, and it is invisible in a plain completion count.
 */
function WeakTopicsCard({ topics }: { topics: TopicProgress[] }): React.ReactElement {
  const weak = topics
    .filter((topic) => topic.failureRate > 0)
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weak topics</CardTitle>
        <CardDescription>Highest share of failed submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {weak.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Nothing failing yet. Submit a few and this fills in.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {weak.map((topic) => (
              <li key={topic.topic}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <Link
                    href={`/questions?topic=${topic.topic}`}
                    className="hover:text-[var(--primary)]"
                  >
                    {topic.topic}
                  </Link>
                  <span className="font-mono text-[var(--muted-foreground)] tabular-nums">
                    {Math.round(topic.failureRate * 100)}% failed
                  </span>
                </div>
                <Meter value={topic.failureRate} tone="destructive" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCard({ summary }: { summary: ProgressSummary }): React.ReactElement {
  const weeks = groupIntoWeeks(summary.activity);
  const busiest = Math.max(1, ...weeks.map((week) => week.count));

  return (
    <Card className="sm:col-span-2">
      <CardHeader>
        <CardTitle>Solved per week</CardTitle>
        <CardDescription>Last 12 weeks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-24 items-end gap-1.5">
          {weeks.map((week) => (
            <div key={week.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-[var(--primary)]"
                style={{ height: `${Math.max(2, (week.count / busiest) * 100)}%` }}
                title={`${week.label}: ${week.count} solved`}
              />
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                {week.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentCard({ summary }: { summary: ProgressSummary }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {summary.recentSubmissions.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Nothing yet.{' '}
            <Link href="/questions" className="text-[var(--primary)] hover:underline">
              Pick a question
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {summary.recentSubmissions.map((submission) => (
              <li key={submission.id} className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    submission.status === 'passed'
                      ? 'bg-[var(--success)]'
                      : 'bg-[var(--destructive)]',
                  )}
                />
                <Link
                  href={`/questions/${submission.questionSlug}`}
                  className="min-w-0 flex-1 truncate hover:text-[var(--primary)]"
                >
                  {submission.questionSlug}
                </Link>
                <span className="font-mono text-xs text-[var(--muted-foreground)] tabular-nums">
                  {submission.passedCases}/{submission.totalCases}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Meter({
  value,
  tone = 'primary',
}: {
  value: number;
  tone?: 'primary' | 'destructive';
}): React.ReactElement {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full',
          tone === 'primary' ? 'bg-[var(--primary)]' : 'bg-[var(--destructive)]',
        )}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

/** Buckets daily counts into the last 12 weeks, oldest first, including empty weeks. */
function groupIntoWeeks(
  activity: readonly { date: string; count: number }[],
): { label: string; count: number }[] {
  const byDate = new Map(activity.map((entry) => [entry.date, entry.count]));
  const weeks: { label: string; count: number }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let week = 11; week >= 0; week -= 1) {
    const end = new Date(cursor.getTime() - week * 7 * 86_400_000);
    let count = 0;
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(end.getTime() - day * 86_400_000);
      count += byDate.get(isoDate(date)) ?? 0;
    }
    weeks.push({ label: isoDate(end), count });
  }
  return weeks;
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
