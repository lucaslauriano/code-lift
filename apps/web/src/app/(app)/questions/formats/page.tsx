import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Formats' };

export default function Page(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Formats"
        description="Browse questions by format: algorithms, JS functions, UI coding."
      />
      <PhasePlaceholder phase="Phase 1" what="This screen" />
    </>
  );
}
