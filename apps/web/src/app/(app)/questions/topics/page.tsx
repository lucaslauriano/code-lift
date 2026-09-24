import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Topics' };

export default function Page(): React.ReactElement {
  return (
    <>
      <PageHeader title="Topics" description="Browse questions by topic." />
      <PhasePlaceholder phase="Phase 1" what="This screen" />
    </>
  );
}
