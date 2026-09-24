import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Mock tests' };

export default function MockPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Mock tests"
        description="Codility-style: 90 minutes, three questions, no solutions until time is up."
      />
      <PhasePlaceholder phase="Phase 1" what="Timed mock sessions" />
    </>
  );
}
