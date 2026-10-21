import { quizzes } from '@/lib/db/mock-data'
import { curriculumLibrary } from '@/lib/curriculum'
import { germanStarter } from '@/lib/db/german-starter'
import { expandedLibrary } from '@/lib/curriculum/expanded'
import { QuizExecutionClient } from '@/components/quiz/quiz-execution-client'

export function generateStaticParams() {
  return [...quizzes, ...germanStarter.quizzes, ...curriculumLibrary.quizzes, ...expandedLibrary.quizzes].map((q) => ({ quizId: q.id }))
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  return <QuizExecutionClient quizId={quizId} />
}
