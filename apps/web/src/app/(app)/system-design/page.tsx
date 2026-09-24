import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'System design' };

export default function Page(): React.ReactElement {
  return (
    <>
      <PageHeader title="System design" description="Frontend system design write-ups." />
      <PhasePlaceholder phase="Phase 4" what="This screen" />
    </>
  );
}
