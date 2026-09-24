'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@code-lift/ui/button';
import { Input } from '@code-lift/ui/input';
import { Label } from '@code-lift/ui/label';
import { loginRequestSchema, type SessionUser } from '@code-lift/shared';
import { ApiRequestError, apiFetch } from '@/lib/api';

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    // Same schema the API validates against — catch the obvious mistakes without a round trip.
    const parsed = loginRequestSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your details');
      return;
    }

    setPending(true);
    try {
      await apiFetch<SessionUser>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught.message
          : 'Could not reach the API. Is it running?',
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
