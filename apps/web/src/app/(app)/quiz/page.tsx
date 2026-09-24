import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Quiz' };

export default function Page(): React.ReactElement {
  return (
    <>
      <PageHeader title="Quiz" description="Rapid-fire questions by topic." />
      <PhasePlaceholder phase="Phase 3" what="This screen" />
    </>
  );
}
