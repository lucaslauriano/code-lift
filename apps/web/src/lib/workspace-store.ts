'use client';

import { create } from 'zustand';
import type { CaseResult, Language, LogEntry, RunResult, TestCase } from '@code-lift/shared';

export type LeftTab = 'description' | 'solution' | 'editorial' | 'submissions';
export type BottomTab = 'cases' | 'result' | 'console';
export type RunMode = 'run' | 'submit';

export interface WorkspaceState {
  /** Which question this state belongs to; used to detect navigation between questions. */
  slug: string | null;
  language: Language;
  code: string;
  leftTab: LeftTab;
  bottomTab: BottomTab;
  /** Cases the user typed in themselves, appended to the public ones on a Run. */
  customCases: TestCase[];
  running: RunMode | null;
  /** Streamed in as the worker reports each case, so results appear progressively. */
  liveCases: CaseResult[];
  liveLogs: LogEntry[];
  result: RunResult | null;
  lastMode: RunMode | null;

  init(slug: string, language: Language, code: string): void;
  setLanguage(language: Language): void;
  setCode(code: string): void;
  setLeftTab(tab: LeftTab): void;
  setBottomTab(tab: BottomTab): void;
  addCustomCase(testCase: TestCase): void;
  removeCustomCase(index: number): void;
  startRun(mode: RunMode): void;
  pushCase(result: CaseResult): void;
  pushLog(entry: LogEntry): void;
  finishRun(result: RunResult): void;
  cancelRun(): void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  slug: null,
  language: 'typescript',
  code: '',
  leftTab: 'description',
  bottomTab: 'cases',
  customCases: [],
  running: null,
  liveCases: [],
  liveLogs: [],
  result: null,
  lastMode: null,

  /**
   * Resets everything for a question.
   *
   * A single store shared across questions would otherwise carry the previous question's results
   * and custom cases into the next one — which looks like the app ran your new code and passed.
   */
  init: (slug, language, code) =>
    set({
      slug,
      language,
      code,
      leftTab: 'description',
      bottomTab: 'cases',
      customCases: [],
      running: null,
      liveCases: [],
      liveLogs: [],
      result: null,
      lastMode: null,
    }),

  setLanguage: (language) => set({ language }),
  setCode: (code) => set({ code }),
  setLeftTab: (leftTab) => set({ leftTab }),
  setBottomTab: (bottomTab) => set({ bottomTab }),

  addCustomCase: (testCase) => set((state) => ({ customCases: [...state.customCases, testCase] })),
  removeCustomCase: (index) =>
    set((state) => ({ customCases: state.customCases.filter((_, i) => i !== index) })),

  startRun: (mode) =>
    set({
      running: mode,
      lastMode: mode,
      liveCases: [],
      liveLogs: [],
      result: null,
      bottomTab: 'result',
    }),
  pushCase: (result) => set((state) => ({ liveCases: [...state.liveCases, result] })),
  pushLog: (entry) => set((state) => ({ liveLogs: [...state.liveLogs, entry] })),
  finishRun: (result) => set({ running: null, result }),
  cancelRun: () => set({ running: null }),
}));
