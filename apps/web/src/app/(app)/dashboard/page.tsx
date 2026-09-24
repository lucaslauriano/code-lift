import type { Metadata } from 'next';
import { Dashboard } from '@/components/dashboard';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage(): React.ReactElement {
  return (
    <>
      <PageHeader title="Dashboard" description="Where you are and what to practise next." />
      <Dashboard />
    </>
  );
}
