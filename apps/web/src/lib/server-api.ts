import { cookies } from 'next/headers';
import { API_URL, ApiRequestError } from './api';

/**
 * Where the Next *server* reaches the API.
 *
 * Not the same as NEXT_PUBLIC_API_URL: that one is baked into the browser bundle and must be the
 * host-visible address, while inside docker compose the Next container reaches the API by service
 * name. Locally the two are identical, which is exactly why this is easy to get wrong.
 */
const INTERNAL_API_URL = process.env['API_INTERNAL_URL'] ?? API_URL;

/**
 * Server-side call to the Nest API, from a React Server Component.
 *
 * The browser's cookie never reaches the API on its own here — the request originates from the
 * Next server — so it is read from the incoming request and forwarded by hand.
 */
export async function serverApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieHeader = (await cookies()).toString();

  const response = await fetch(`${INTERNAL_API_URL}${path}`, {
    ...init,
    headers: { ...init.headers, cookie: cookieHeader },
    cache: 'no-store',
  });

  if (!response.ok) throw new ApiRequestError(response.status, response.statusText);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
