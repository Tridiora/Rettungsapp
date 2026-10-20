'use client'

import { useLibraryStore } from '@/stores/library-store'
import { useContentStore } from '@/stores/content-store'
import { isPublished } from './library-types'
import type { Library } from './library-types'
import type { CommunityCard } from '@/stores/content-store'
import { useEditorialStore } from '@/stores/editorial-store'

export function useLibrary() {
  const records=useEditorialStore(s=>s.records)
  const library:Library={decks:[],cards:[],quizzes:[],documents:[]}
  for(const row of records||[])if(row.kind in library) (library[row.kind as keyof Library] as unknown[]).push({...row.data,publication:'published'})
  return selectLibrary(library, [])
}

export function selectLibrary(library: Library, community: CommunityCard[]) {
  const decks = library.decks.filter(isPublished)
  const deckIds = new Set(decks.map(d => d.id))
  const cards = [...library.cards.filter(isPublished), ...community.filter(c => c.status === 'approved')]
    .filter(c => deckIds.has(c.deckId))
  return { decks: decks.map(d => ({ ...d, cardCount: cards.filter(c => c.deckId === d.id).length })),
    cards, quizzes: library.quizzes.filter(isPublished), documents: library.documents.filter(isPublished) }
}
