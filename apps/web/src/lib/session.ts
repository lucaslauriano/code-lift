import { redirect } from 'next/navigation';
import type { SessionUser } from '@code-lift/shared';
import { serverApiFetch } from './server-api';

/**
 * The signed-in user, or a redirect to the login page.
 *
 * Called from the authenticated layout so every page under it can assume a session exists.
 */
export async function requireUser(): Promise<SessionUser> {
  try {
    return await serverApiFetch<SessionUser>('/auth/me');
  } catch {
    redirect('/login');
  }
}

/** Like requireUser, but returns null instead of redirecting. */
export async function currentUser(): Promise<SessionUser | null> {
  try {
    return await serverApiFetch<SessionUser>('/auth/me');
  } catch {
    return null;
  }
}
