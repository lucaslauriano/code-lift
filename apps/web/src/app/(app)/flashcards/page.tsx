import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Flashcards' };

export default function Page(): React.ReactElement {
  return (
    <>
      <PageHeader title="Flashcards" description="Spaced repetition with FSRS." />
      <PhasePlaceholder phase="Phase 3" what="This screen" />
    </>
  );
}
