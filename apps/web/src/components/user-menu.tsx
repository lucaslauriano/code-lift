'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@code-lift/ui/button';
import type { SessionUser } from '@code-lift/shared';
import { apiFetch } from '@/lib/api';

export function UserMenu({ user }: { user: SessionUser }): React.ReactElement {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut(): Promise<void> {
    setSigningOut(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } catch {
      toast.error('Could not sign out');
      setSigningOut(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--muted-foreground)]">{user.name ?? user.email}</span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        disabled={signingOut}
        onClick={() => void signOut()}
      >
        <LogOut />
      </Button>
    </div>
  );
}
