import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { requireUser } from '@/lib/session';

/**
 * Everything under this layout is behind a session.
 *
 * The check runs on the server before any page renders, so a signed-out visitor is redirected
 * rather than briefly shown an empty shell.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const user = await requireUser();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
            cl
          </span>
          code-lift
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden border-r border-[var(--border)] md:block">
          <AppSidebar />
        </aside>
        {/*
          `relative` is load-bearing, not decoration. `overflow` alone does not create a
          containing block, so an absolutely positioned descendant — every `sr-only` label, for
          one — anchors to the document instead and stretches it, which makes the whole page
          scroll and drags the header and sidebar out of view.
        */}
        <main className="relative min-w-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
