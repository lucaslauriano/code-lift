import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-lift/ui/card';
import { LoginForm } from '@/components/login-form';
import { currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage(): Promise<React.ReactElement> {
  // Already signed in? No reason to show the form.
  if (await currentUser()) redirect('/dashboard');

  return (
    // The document cannot scroll, so this screen scrolls itself — otherwise the card would be
    // unreachable on a short window.
    <div className="h-dvh overflow-y-auto">
      <div className="grid min-h-full place-items-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                cl
              </span>
              <span className="font-semibold tracking-tight">code-lift</span>
            </div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Your personal interview training ground.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
