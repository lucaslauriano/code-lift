import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PhasePlaceholder } from '@/components/phase-placeholder';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Streak, questions solved per week, weak topics and recent submissions."
      />
      <PhasePlaceholder phase="Phase 1" what="Progress tracking" />
    </>
  );
}
