'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TestCase } from '@code-lift/shared';
import { Button } from '@code-lift/ui/button';
import { Input } from '@code-lift/ui/input';
import { Label } from '@code-lift/ui/label';

interface CasesPanelProps {
  publicCases: TestCase[];
  customCases: TestCase[];
  hiddenCaseCount: number;
  perfCaseCount: number;
  onAdd: (testCase: TestCase) => void;
  onRemove: (index: number) => void;
}

export function CasesPanel({
  publicCases,
  customCases,
  hiddenCaseCount,
  perfCaseCount,
  onAdd,
  onRemove,
}: CasesPanelProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section>
        <h3 className="mb-2 text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
          Public cases ({publicCases.length})
        </h3>
        <ul className="flex flex-col gap-1.5">
          {publicCases.map((testCase, index) => (
            <li
              key={index}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2"
            >
              <p className="text-sm">{testCase.name ?? `Case ${index + 1}`}</p>
              <p className="mt-1 font-mono text-xs break-all text-[var(--muted-foreground)]">
                solution({formatArgs(testCase.input)}) → {formatValue(testCase.expected)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {customCases.length > 0 ? (
        <section>
          <h3 className="mb-2 text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
            Your cases ({customCases.length})
          </h3>
          <ul className="flex flex-col gap-1.5">
            {customCases.map((testCase, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md border border-[var(--border)] px-3 py-2"
              >
                <p className="min-w-0 flex-1 font-mono text-xs break-all">
                  solution({formatArgs(testCase.input)}) → {formatValue(testCase.expected)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove your case ${index + 1}`}
                  onClick={() => onRemove(index)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AddCaseForm onAdd={onAdd} />

      <p className="text-xs text-[var(--muted-foreground)]">
        Submit also runs {hiddenCaseCount} hidden case{hiddenCaseCount === 1 ? '' : 's'} and{' '}
        {perfCaseCount} performance case{perfCaseCount === 1 ? '' : 's'}.
      </p>
    </div>
  );
}

/**
 * Adds a case by typing JSON.
 *
 * Arguments are a JSON array because the solution is called with a spread argument list — a
 * one-argument solution still takes `[value]`, and making that explicit avoids the ambiguity of
 * "is this array the argument, or the list of arguments?".
 */
function AddCaseForm({ onAdd }: { onAdd: (testCase: TestCase) => void }): React.ReactElement {
  const [input, setInput] = useState('');
  const [expected, setExpected] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    setError(null);

    let parsedInput: unknown;
    let parsedExpected: unknown;
    try {
      parsedInput = JSON.parse(input);
    } catch {
      setError('Arguments must be valid JSON, e.g. [5, [1, 2, 3]]');
      return;
    }
    if (!Array.isArray(parsedInput)) {
      setError('Arguments must be a JSON array — the list of arguments, not a single value.');
      return;
    }
    try {
      parsedExpected = JSON.parse(expected);
    } catch {
      setError('Expected must be valid JSON, e.g. 6 or [1, 2] or "abc"');
      return;
    }

    onAdd({ name: 'Your case', input: parsedInput, expected: parsedExpected });
    setInput('');
    setExpected('');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
      <h3 className="text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
        Add your own case
      </h3>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-40 flex-1">
          <Label htmlFor="case-input" className="text-xs">
            Arguments (JSON array)
          </Label>
          <Input
            id="case-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="[5, [1, 3, 1, 4, 2, 3, 5, 4]]"
            className="mt-1 font-mono text-xs"
          />
        </div>
        <div className="min-w-32 flex-1">
          <Label htmlFor="case-expected" className="text-xs">
            Expected
          </Label>
          <Input
            id="case-expected"
            value={expected}
            onChange={(event) => setExpected(event.target.value)}
            placeholder="6"
            className="mt-1 font-mono text-xs"
          />
        </div>
        <Button type="submit" variant="secondary" size="md" className="mt-auto">
          <Plus /> Add
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </form>
  );
}

const MAX_PREVIEW = 120;

function formatValue(value: unknown): string {
  let text: string;
  try {
    text = JSON.stringify(value) ?? String(value);
  } catch {
    text = String(value);
  }
  return text.length > MAX_PREVIEW ? `${text.slice(0, MAX_PREVIEW)}…` : text;
}

function formatArgs(input: readonly unknown[]): string {
  return input.map(formatValue).join(', ');
}
