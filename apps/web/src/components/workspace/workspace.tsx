'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Check, ChevronLeft, MinusCircle, Play, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  type CaseResult,
  type Language,
  type LogEntry,
  type QuestionDetail,
  type RunResult,
  type TestCase,
} from '@code-lift/shared';
import { Badge } from '@code-lift/ui/badge';
import { Button } from '@code-lift/ui/button';
import { cn } from '@code-lift/ui/cn';
import { apiFetch } from '@/lib/api';
import { readCode, writeCode } from '@/lib/code-storage';
import { useCreateSubmission, useQuestion, useSetProgress, useSubmissions } from '@/lib/queries';
import { useWorkspaceStore, type BottomTab, type LeftTab } from '@/lib/workspace-store';
import { CasesPanel } from './cases-panel';
import { ConsolePanel, ResultsPanel } from './results-panel';
import { SubmissionsPanel } from './submissions-panel';

// Monaco touches `window` on import, and the runner bundle is about 750 kB — neither belongs in
// the server render or the initial chunk.
const CodeEditor = dynamic(() => import('./code-editor').then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-[var(--muted-foreground)]">
      Loading editor…
    </div>
  ),
});

export interface WorkspaceProps {
  detail: QuestionDetail;
  /** Rendered on the server; null when a mock session is withholding it. */
  promptNode: React.ReactNode;
  editorialNode: React.ReactNode | null;
  solutionSource: string | null;
  /** Set while this question is part of a running mock session. */
  mockSessionId: string | null;
}

export function Workspace({
  detail,
  promptNode,
  editorialNode,
  solutionSource,
  mockSessionId,
}: WorkspaceProps): React.ReactElement {
  const slug = detail.meta.slug;
  const { data: live } = useQuestion(slug);
  const question = live ?? detail;

  const store = useWorkspaceStore();
  const createSubmission = useCreateSubmission(slug);
  const setProgress = useSetProgress(slug);
  const submissions = useSubmissions(slug);

  const ready = store.slug === slug;

  // Restore the draft for this question, or fall back to the starter file.
  useEffect(() => {
    const language: Language = 'typescript';
    store.init(slug, language, readCode(slug, language) ?? detail.starter);
    // `store` is a stable zustand hook result; re-running on it would reset on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, detail.starter]);

  useEffect(() => {
    if (ready) writeCode(slug, store.language, store.code);
  }, [ready, slug, store.language, store.code]);

  const run = useCallback(
    async (mode: 'run' | 'submit') => {
      const state = useWorkspaceStore.getState();
      if (state.running) return;

      let cases: TestCase[];
      if (mode === 'run') {
        cases = [...detail.publicCases, ...state.customCases];
      } else {
        // Fetched only now: the full list carries the performance inputs and can be ~800 kB.
        try {
          const payload = await apiFetch<{ cases: TestCase[] }>(`/questions/${slug}/cases`);
          cases = payload.cases;
        } catch {
          toast.error('Could not load the full test suite.');
          return;
        }
      }

      state.startRun(mode);

      const { runInWorker } = await import('@code-lift/runner');
      const result: RunResult = await runInWorker({
        code: state.code,
        language: state.language,
        cases,
        onCase: (caseResult: CaseResult) => useWorkspaceStore.getState().pushCase(caseResult),
        onLog: (entry: LogEntry) => useWorkspaceStore.getState().pushLog(entry),
      });

      useWorkspaceStore.getState().finishRun(result);

      if (mode === 'run') {
        if (result.compileError) toast.error('Your code did not compile.');
        return;
      }

      const perfCases = result.cases.filter((testCase) => testCase.perf);
      const response = await createSubmission
        .mutateAsync({
          questionSlug: slug,
          language: state.language,
          code: state.code,
          status: result.status,
          passedCases: result.cases.filter((testCase) => testCase.status === 'passed').length,
          totalCases: result.cases.length,
          perfPassed: perfCases.filter((testCase) => testCase.status === 'passed').length,
          perfTotal: perfCases.length,
          durationMs: result.durationMs,
          ...(mockSessionId ? { mockSessionId } : {}),
        })
        .catch(() => null);

      if (!response) {
        toast.error('The run finished but the submission could not be saved.');
        return;
      }

      if (response.progressStatus === 'done') toast.success('Solved. All cases passed.');
      else if (result.compileError) toast.error('Your code did not compile.');
      else toast.error('Some cases did not pass.');
    },
    [createSubmission, detail.publicCases, mockSessionId, slug],
  );

  // Also bound on the editor itself; this covers focus anywhere else in the workspace.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return;
      event.preventDefault();
      void run(event.shiftKey ? 'submit' : 'run');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

  const leftTabs = useMemo(() => {
    const tabs: { id: LeftTab; label: string; available: boolean }[] = [
      { id: 'description', label: 'Description', available: true },
      { id: 'solution', label: 'Solution', available: solutionSource !== null },
      { id: 'editorial', label: 'Editorial', available: editorialNode !== null },
      { id: 'submissions', label: 'Submissions', available: true },
    ];
    return tabs.filter((tab) => tab.available);
  }, [editorialNode, solutionSource]);

  const running = store.running !== null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border)] px-4 py-3">
        <Link
          href="/questions"
          className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft className="size-4" /> Questions
        </Link>

        <h1 className="font-medium">{question.meta.title}</h1>
        <Badge tone={question.meta.difficulty}>{question.meta.difficulty}</Badge>
        {question.progressStatus === 'done' ? <Badge tone="easy">solved</Badge> : null}
        {mockSessionId ? <Badge tone="accent">mock in progress</Badge> : null}

        <div className="ml-auto flex items-center gap-2">
          {!mockSessionId ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProgress.mutate('skipped')}
                disabled={setProgress.isPending}
              >
                <MinusCircle /> Skip
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProgress.mutate('done')}
                disabled={setProgress.isPending || question.progressStatus === 'done'}
              >
                <Check /> Mark done
              </Button>
            </>
          ) : null}

          <Button variant="secondary" size="sm" onClick={() => void run('run')} disabled={running}>
            <Play /> {store.running === 'run' ? 'Running…' : 'Run'}
          </Button>
          <Button size="sm" onClick={() => void run('submit')} disabled={running}>
            <Send /> {store.running === 'submit' ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </header>

      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize="38%" minSize="22%" className="flex min-w-0 flex-col">
          <TabBar
            tabs={leftTabs.map((tab) => ({ id: tab.id, label: tab.label }))}
            active={store.leftTab}
            onSelect={(id) => store.setLeftTab(id as LeftTab)}
          />
          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {store.leftTab === 'description' ? promptNode : null}
            {store.leftTab === 'solution' && solutionSource ? (
              <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 font-mono text-xs">
                {solutionSource}
              </pre>
            ) : null}
            {store.leftTab === 'editorial' ? editorialNode : null}
            {store.leftTab === 'submissions' ? (
              <SubmissionsPanel
                submissions={submissions.data ?? []}
                loading={submissions.isPending}
                onRestore={(code) => store.setCode(code)}
              />
            ) : null}
          </div>
        </Panel>

        <ResizeHandle direction="horizontal" />

        <Panel minSize="30%" className="flex min-w-0 flex-col">
          <Group orientation="vertical" className="min-h-0 flex-1">
            <Panel defaultSize="62%" minSize="25%" className="min-h-0">
              {ready ? (
                <CodeEditor
                  language={store.language}
                  value={store.code}
                  onChange={store.setCode}
                  onRun={() => void run('run')}
                  onSubmit={() => void run('submit')}
                />
              ) : null}
            </Panel>

            <ResizeHandle direction="vertical" />

            <Panel defaultSize="38%" minSize="15%" className="flex min-h-0 flex-col">
              <TabBar
                tabs={[
                  { id: 'cases', label: `Test cases (${detail.publicCases.length})` },
                  { id: 'result', label: 'Result' },
                  { id: 'console', label: `Console (${store.liveLogs.length})` },
                ]}
                active={store.bottomTab}
                onSelect={(id) => store.setBottomTab(id as BottomTab)}
              />
              <div className="relative min-h-0 flex-1 overflow-y-auto">
                {store.bottomTab === 'cases' ? (
                  <CasesPanel
                    publicCases={detail.publicCases}
                    customCases={store.customCases}
                    hiddenCaseCount={detail.hiddenCaseCount}
                    perfCaseCount={detail.perfCaseCount}
                    onAdd={store.addCustomCase}
                    onRemove={store.removeCustomCase}
                  />
                ) : null}
                {store.bottomTab === 'result' ? (
                  <ResultsPanel
                    running={running}
                    liveCases={store.liveCases}
                    result={store.result}
                  />
                ) : null}
                {store.bottomTab === 'console' ? <ConsolePanel logs={store.liveLogs} /> : null}
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}

function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <div role="tablist" className="flex shrink-0 border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={active === tab.id}
          onClick={() => onSelect(tab.id)}
          className={cn(
            'border-b-2 px-4 py-2 text-sm transition-colors',
            active === tab.id
              ? 'border-[var(--primary)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ResizeHandle({ direction }: { direction: 'horizontal' | 'vertical' }): React.ReactElement {
  return (
    <Separator
      className={cn(
        'bg-[var(--border)] transition-colors hover:bg-[var(--primary)]',
        direction === 'horizontal' ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize',
      )}
    />
  );
}
