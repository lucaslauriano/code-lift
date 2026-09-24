import type { ApiError } from '@code-lift/shared';

export const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3334';

export class ApiRequestError extends Error {
  override readonly name = 'ApiRequestError';

  constructor(
    readonly status: number,
    message: string,
    readonly issues: string[] = [],
  ) {
    super(message);
  }
}

/**
 * Browser-side call to the Nest API.
 *
 * `credentials: 'include'` is mandatory: the session lives in an httpOnly cookie and the API runs
 * on a different port, so the browser treats it as cross-origin and would otherwise omit it.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function toError(response: Response): Promise<ApiRequestError> {
  let message = response.statusText || 'Request failed';
  let issues: string[] = [];

  try {
    const body = (await response.json()) as ApiError;
    if (Array.isArray(body.message)) {
      issues = body.message;
      message = body.message[0] ?? message;
    } else if (typeof body.message === 'string') {
      message = body.message;
    }
  } catch {
    // A non-JSON error body (a proxy page, a crash) is not worth a second failure.
  }

  return new ApiRequestError(response.status, message, issues);
}
