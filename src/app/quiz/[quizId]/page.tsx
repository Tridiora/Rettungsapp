import { quizzes } from '@/lib/db/mock-data'
import { QuizExecutionClient } from '@/components/quiz/quiz-execution-client'

export function generateStaticParams() {
  return quizzes.map((q) => ({ quizId: q.id }))
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  return <QuizExecutionClient quizId={quizId} />
}
