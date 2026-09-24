import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { QuestionList } from '@/components/questions/question-list';

export const metadata: Metadata = { title: 'Practice questions' };

export default function QuestionsPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        title="Practice questions"
        description="Filter by difficulty, topic, company and status. Open one to solve it."
      />
      <QuestionList />
    </>
  );
}
