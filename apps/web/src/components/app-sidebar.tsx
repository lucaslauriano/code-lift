'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Code2,
  LayoutDashboard,
  Layers,
  ListChecks,
  Network,
  Timer,
} from 'lucide-react';
import { cn } from '@code-lift/ui/cn';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Shown greyed out with a "soon" tag until the phase that builds it lands. */
  soon?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Practice questions',
    items: [
      { href: '/questions', label: 'All questions', icon: Code2 },
      { href: '/questions/formats', label: 'Formats', icon: Layers },
      { href: '/questions/topics', label: 'Topics', icon: ListChecks },
    ],
  },
  {
    title: 'Train',
    items: [
      { href: '/mock', label: 'Mock tests', icon: Timer },
      { href: '/flashcards', label: 'Flashcards', icon: BrainCircuit, soon: true },
      { href: '/quiz', label: 'Quiz', icon: ListChecks, soon: true },
      { href: '/system-design', label: 'System design', icon: Network, soon: true },
    ],
  },
];

export function AppSidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="relative flex h-full w-60 shrink-0 flex-col gap-6 overflow-y-auto p-3"
    >
      {GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="px-3 pb-2 text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
            {group.title}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }): React.ReactElement {
  const Icon = item.icon;
  const className = cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
    active
      ? 'bg-[var(--accent)] font-medium text-[var(--foreground)]'
      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
    item.soon && 'cursor-not-allowed opacity-50 hover:bg-transparent',
  );

  const body = (
    <>
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.soon ? <span className="ml-auto text-[10px] tracking-wide uppercase">soon</span> : null}
    </>
  );

  if (item.soon) {
    return (
      <span className={className} aria-disabled="true" title="Coming in a later phase">
        {body}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} aria-current={active ? 'page' : undefined}>
      {body}
    </Link>
  );
}

/**
 * `/questions` must not light up while you are on `/questions/topics`, so an exact match wins and
 * a prefix match only counts for paths that go deeper than a sibling route.
 */
function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/questions') return pathname.startsWith('/questions/') && !isSiblingRoute(pathname);
  return pathname.startsWith(`${href}/`);
}

const SIBLING_ROUTES = ['/questions/formats', '/questions/topics'];

function isSiblingRoute(pathname: string): boolean {
  return SIBLING_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
