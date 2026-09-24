import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { MockSession } from '@code-lift/shared';
import { PageHeader } from '@/components/page-header';
import { serverApiFetch } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Mock session' };

// Client-only: the countdown reads the clock on first render, and a server render would disagree
// with the browser by however long the response took.
const MockSessionView = dynamic(() =>
  import('@/components/mock/mock-runner').then((m) => m.MockSessionView),
);

export default async function MockSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;

  let session: MockSession;
  try {
    session = await serverApiFetch<MockSession>(`/mock-sessions/${id}`);
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={session.finishedAt ? 'Mock result' : 'Mock in progress'}
        description={
          session.finishedAt
            ? 'Scored. Editorials for these questions are unlocked again.'
            : 'The deadline is enforced on the server — the clock here is just a display.'
        }
      />
      <MockSessionView session={session} />
    </>
  );
}
