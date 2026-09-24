import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ActiveMockSession, QuestionDetail, QuestionEditorial } from '@code-lift/shared';
import { Markdown } from '@/components/markdown';
import { Workspace } from '@/components/workspace/workspace';
import { serverApiFetch } from '@/lib/server-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const detail = await serverApiFetch<QuestionDetail>(`/questions/${slug}`);
    return { title: detail.meta.title };
  } catch {
    return { title: 'Question' };
  }
}

/**
 * The workspace shell.
 *
 * Statement and editorial are compiled to markup here, on the server, and handed to the client
 * component as nodes. That is what makes the mock-session lock real: when a session is running,
 * the editorial is never fetched and never rendered, so there is nothing in the page to reveal.
 */
export default async function QuestionPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;

  let detail: QuestionDetail;
  try {
    detail = await serverApiFetch<QuestionDetail>(`/questions/${slug}`);
  } catch {
    notFound();
  }

  const { session } = await serverApiFetch<ActiveMockSession>('/mock-sessions/active').catch(
    () => ({
      session: null,
    }),
  );
  const lockedByMock = session?.questionSlugs.includes(slug) ?? false;

  const editorial = lockedByMock
    ? null
    : await serverApiFetch<QuestionEditorial>(`/questions/${slug}/editorial`).catch(() => null);

  return (
    <Workspace
      detail={detail}
      promptNode={<Markdown source={detail.prompt} />}
      editorialNode={editorial ? <Markdown source={editorial.editorial} /> : null}
      solutionSource={editorial?.solution ?? null}
      mockSessionId={lockedByMock ? (session?.id ?? null) : null}
    />
  );
}
