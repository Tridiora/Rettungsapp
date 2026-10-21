import { decks } from '@/lib/db/mock-data'
import { curriculumLibrary } from '@/lib/curriculum'
import { germanStarter } from '@/lib/db/german-starter'
import { expandedLibrary } from '@/lib/curriculum/expanded'
import { StudySessionClient } from '@/components/flashcards/study-session-client'

export function generateStaticParams() {
  return [...decks, ...germanStarter.decks, ...curriculumLibrary.decks, ...expandedLibrary.decks].map((d) => ({ deckId: d.id }))
}

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  return <StudySessionClient key={deckId} deckId={deckId} />
}
