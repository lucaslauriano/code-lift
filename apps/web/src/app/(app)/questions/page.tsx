import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Practice questions' };

/**
 * Phase 1 fills this in from GET /questions.
 *
 * Deliberately not reading packages/content from here: the API already owns that read, and having
 * the Next server do its own disk access would put two readers on the same tree.
 */
export default function QuestionsPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Practice questions"
        description="Filter by difficulty, topic, company and status; open a workspace to solve."
      />
      <PhasePlaceholder phase="Phase 1" what="The question list and workspace" />
    </>
  );
}
