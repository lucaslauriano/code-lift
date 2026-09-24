'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  ActiveMockSession,
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  ListQuestionsQuery,
  ListQuestionsResponse,
  MockSession,
  ProgressStatus,
  ProgressSummary,
  QuestionCases,
  QuestionDetail,
  Submission,
} from '@code-lift/shared';
import { apiFetch } from './api';

export const queryKeys = {
  questions: (query: ListQuestionsQuery) => ['questions', query] as const,
  question: (slug: string) => ['question', slug] as const,
  cases: (slug: string) => ['question-cases', slug] as const,
  submissions: (slug: string) => ['submissions', slug] as const,
  progressSummary: ['progress-summary'] as const,
  activeMock: ['mock-active'] as const,
  mockSession: (id: string) => ['mock-session', id] as const,
  mockSessions: ['mock-sessions'] as const,
};

function toSearch(query: ListQuestionsQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

export function useQuestions(query: ListQuestionsQuery): UseQueryResult<ListQuestionsResponse> {
  return useQuery({
    queryKey: queryKeys.questions(query),
    queryFn: () => apiFetch<ListQuestionsResponse>(`/questions${toSearch(query)}`),
    // Keeps the list on screen while a filter change is in flight, instead of flashing a spinner.
    placeholderData: (previous) => previous,
  });
}

export function useQuestion(slug: string): UseQueryResult<QuestionDetail> {
  return useQuery({
    queryKey: queryKeys.question(slug),
    queryFn: () => apiFetch<QuestionDetail>(`/questions/${slug}`),
  });
}

/**
 * The full case list, fetched only when Submit needs it.
 *
 * It is large — a question with two 100k performance inputs is about 800 kB — and it never changes
 * for a given content version, so it is fetched lazily and then cached for the session.
 */
export function useQuestionCases(slug: string, enabled: boolean): UseQueryResult<QuestionCases> {
  return useQuery({
    queryKey: queryKeys.cases(slug),
    queryFn: () => apiFetch<QuestionCases>(`/questions/${slug}/cases`),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useSubmissions(slug: string): UseQueryResult<Submission[]> {
  return useQuery({
    queryKey: queryKeys.submissions(slug),
    queryFn: () => apiFetch<Submission[]>(`/submissions?questionSlug=${encodeURIComponent(slug)}`),
  });
}

export function useProgressSummary(): UseQueryResult<ProgressSummary> {
  return useQuery({
    queryKey: queryKeys.progressSummary,
    queryFn: () => apiFetch<ProgressSummary>('/progress/summary'),
  });
}

export function useActiveMockSession(): UseQueryResult<ActiveMockSession> {
  return useQuery({
    queryKey: queryKeys.activeMock,
    queryFn: () => apiFetch<ActiveMockSession>('/mock-sessions/active'),
  });
}

export function useMockSession(id: string): UseQueryResult<MockSession> {
  return useQuery({
    queryKey: queryKeys.mockSession(id),
    queryFn: () => apiFetch<MockSession>(`/mock-sessions/${id}`),
  });
}

export function useMockSessions(): UseQueryResult<MockSession[]> {
  return useQuery({
    queryKey: queryKeys.mockSessions,
    queryFn: () => apiFetch<MockSession[]>('/mock-sessions'),
  });
}

export function useCreateSubmission(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubmissionRequest) =>
      apiFetch<CreateSubmissionResponse>('/submissions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.submissions(slug) });
      void client.invalidateQueries({ queryKey: queryKeys.question(slug) });
      void client.invalidateQueries({ queryKey: queryKeys.progressSummary });
    },
  });
}

export function useSetProgress(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (status: ProgressStatus) =>
      apiFetch<{ status: ProgressStatus }>(`/progress/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.question(slug) });
      void client.invalidateQueries({ queryKey: ['questions'] });
      void client.invalidateQueries({ queryKey: queryKeys.progressSummary });
    },
  });
}

export function useStartMockSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<MockSession>('/mock-sessions', {
        method: 'POST',
        body: JSON.stringify({ preset: 'toptal_codility' }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.activeMock });
      void client.invalidateQueries({ queryKey: queryKeys.mockSessions });
    },
  });
}

export function useFinishMockSession(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<MockSession>(`/mock-sessions/${id}/finish`, { method: 'POST' }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.activeMock });
      void client.invalidateQueries({ queryKey: queryKeys.mockSession(id) });
      void client.invalidateQueries({ queryKey: queryKeys.mockSessions });
    },
  });
}
