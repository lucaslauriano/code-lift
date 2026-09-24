'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bookmark, Check, Circle, CircleDashed, MinusCircle, Search } from 'lucide-react';
import {
  difficultySchema,
  progressStatusSchema,
  trackSchema,
  type ListQuestionsQuery,
  type Company,
  type ProgressStatus,
  type QuestionSummary,
  type Topic,
  type Track,
} from '@code-lift/shared';
import { Badge } from '@code-lift/ui/badge';
import { Card } from '@code-lift/ui/card';
import { Input } from '@code-lift/ui/input';
import { cn } from '@code-lift/ui/cn';
import { useQuestions } from '@/lib/queries';

const STATUS_ICON: Record<ProgressStatus, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: CircleDashed,
  done: Check,
  skipped: MinusCircle,
};

/** The Codility track is what a Toptal mock draws from; LeetCode is the wider practice set. */
const TRACK_LABEL: Record<Track, string> = {
  codility: 'Codility',
  leetcode: 'LeetCode',
};

const STATUS_LABEL: Record<ProgressStatus, string> = {
  todo: 'Not started',
  in_progress: 'In progress',
  done: 'Solved',
  skipped: 'Skipped',
};

export function QuestionList(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ListQuestionsQuery>({});

  // Search is applied client-side against the already-fetched page so typing does not refetch.
  // The catalogue is small enough that this is both simpler and faster than debouncing a request.
  const { data, isPending, isError, error } = useQuestions(filters);
  const catalogue = useQuestions({});

  const questions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return data?.questions ?? [];
    return (data?.questions ?? []).filter((question) =>
      `${question.title} ${question.summary} ${question.topics.join(' ')}`
        .toLowerCase()
        .includes(needle),
    );
  }, [data, search]);

  return (
    <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start">
      <div className="order-2 min-w-0 flex-1 lg:order-1">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            type="search"
            placeholder="Search questions"
            aria-label="Search questions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        {isError ? (
          <Card className="p-6 text-sm text-[var(--destructive)]">
            {error instanceof Error ? error.message : 'Could not load the catalogue.'}
          </Card>
        ) : isPending ? (
          <ListSkeleton />
        ) : questions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Nothing matches those filters.
          </Card>
        ) : (
          <>
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              {questions.length} question{questions.length === 1 ? '' : 's'}
            </p>
            <ul className="flex flex-col gap-2">
              {questions.map((question) => (
                <li key={question.slug}>
                  <QuestionCard question={question} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        facets={facetsOf(catalogue.data?.questions ?? [])}
        // Sticky on wide screens: with dozens of questions the panel would otherwise scroll away and
        // leave no way to change filters without going back to the top.
        className="order-1 w-full shrink-0 lg:sticky lg:top-6 lg:order-2 lg:w-64"
      />
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionSummary }): React.ReactElement {
  const StatusIcon = STATUS_ICON[question.progressStatus];
  const solved = question.progressStatus === 'done';

  return (
    <Card className="transition-colors hover:border-[color-mix(in_oklch,var(--primary)_45%,var(--border))]">
      <Link
        href={`/questions/${question.slug}`}
        className="flex flex-wrap items-start gap-x-4 gap-y-2 p-4"
      >
        <span
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border',
            solved
              ? 'border-transparent bg-[var(--success)] text-[var(--background)]'
              : 'border-[var(--border)] text-[var(--muted-foreground)]',
          )}
          title={STATUS_LABEL[question.progressStatus]}
        >
          <StatusIcon className="size-3" />
          <span className="sr-only">{STATUS_LABEL[question.progressStatus]}</span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{question.title}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted-foreground)]">
            {question.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={question.difficulty}>{question.difficulty}</Badge>
            {question.topics.map((topic) => (
              <Badge key={topic}>{topic}</Badge>
            ))}
            {question.companies.includes('toptal') ? <Badge tone="accent">toptal</Badge> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-[var(--muted-foreground)]">
          {question.bookmarked ? <Bookmark className="size-3.5" aria-label="Bookmarked" /> : null}
          <span>~{question.estimatedMinutes}min</span>
        </div>
      </Link>
    </Card>
  );
}

interface Facets {
  topics: Topic[];
  companies: Company[];
}

/** The values actually present in the catalogue, so a filter never offers an empty result. */
function facetsOf(questions: readonly QuestionSummary[]): Facets {
  const topics = new Set<Topic>();
  const companies = new Set<Company>();
  for (const question of questions) {
    for (const topic of question.topics) topics.add(topic);
    for (const company of question.companies) companies.add(company);
  }
  return {
    topics: [...topics].sort(),
    companies: [...companies].sort(),
  };
}

function FilterPanel({
  filters,
  onChange,
  facets,
  className,
}: {
  filters: ListQuestionsQuery;
  onChange: (next: ListQuestionsQuery) => void;
  facets: Facets;
  className?: string;
}): React.ReactElement {
  function set<K extends keyof ListQuestionsQuery>(key: K, value: ListQuestionsQuery[K]): void {
    const next = { ...filters };
    // Selecting the active value again clears it, so a filter never becomes a trap.
    if (next[key] === value) delete next[key];
    else next[key] = value;
    onChange(next);
  }

  const active = Object.keys(filters).length;

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Filters</h2>
        {active > 0 ? (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-xs text-[var(--primary)] hover:underline"
          >
            Clear ({active})
          </button>
        ) : null}
      </div>

      <FilterGroup label="Track">
        {trackSchema.options.map((value) => (
          <FilterChip
            key={value}
            active={filters.track === value}
            onClick={() => set('track', value)}
          >
            {TRACK_LABEL[value]}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Difficulty">
        {difficultySchema.options.map((value) => (
          <FilterChip
            key={value}
            active={filters.difficulty === value}
            onClick={() => set('difficulty', value)}
          >
            {value}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Status">
        {progressStatusSchema.options.map((value) => (
          <FilterChip
            key={value}
            active={filters.status === value}
            onClick={() => set('status', value)}
          >
            {STATUS_LABEL[value]}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Topic">
        {facets.topics.map((value) => (
          <FilterChip
            key={value}
            active={filters.topic === value}
            onClick={() => set('topic', value)}
          >
            {value}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label="Company">
        {facets.companies.map((value) => (
          <FilterChip
            key={value}
            active={filters.company === value}
            onClick={() => set('company', value)}
          >
            {value}
          </FilterChip>
        ))}
      </FilterGroup>
    </Card>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <fieldset className="mb-4 last:mb-0">
      <legend className="mb-1.5 text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border px-2 py-1 text-xs transition-colors',
        active
          ? 'border-[var(--primary)] bg-[color-mix(in_oklch,var(--primary)_18%,transparent)] text-[var(--primary)]'
          : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
      )}
    >
      {children}
    </button>
  );
}

function ListSkeleton(): React.ReactElement {
  return (
    <ul className="flex flex-col gap-2" aria-busy="true" aria-label="Loading questions">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <Card className="h-24 animate-pulse bg-[var(--muted)]" />
        </li>
      ))}
    </ul>
  );
}
