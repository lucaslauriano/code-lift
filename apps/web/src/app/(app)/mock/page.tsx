import type { Metadata } from 'next';
import { MockHome } from '@/components/mock/mock-runner';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Mock tests' };

export default function MockPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Mock tests"
        description="Codility-style: 90 minutes, three questions, no solutions until time is up."
      />
      <MockHome />
    </>
  );
}
