import { decks } from '@/lib/db/mock-data'
import { StudySessionClient } from '@/components/flashcards/study-session-client'

export function generateStaticParams() {
  return decks.map((d) => ({ deckId: d.id }))
}

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  return <StudySessionClient deckId={deckId} />
}
