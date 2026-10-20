import type { Deck, Flashcard, Quiz } from '@/types'

export type Publication = 'draft' | 'published' | 'archived'
export type Managed<T> = T & { publication?: Publication; source?: string }
export interface LearningDocument {
  id: string
  title: string
  category: string
  pages: number
  date: string
  summary: string
  sections: { id: string; title: string; content: string; simpleContent?: string }[]
}
export interface Library {
  decks: Managed<Deck>[]
  cards: Managed<Flashcard & { simpleExplanation?: string }>[]
  quizzes: Managed<Quiz>[]
  documents: Managed<LearningDocument>[]
}
export type ContentKind = keyof Library
export type LibraryItem = Library[ContentKind][number]
export const isPublished = (item: { publication?: Publication }) => !item.publication || item.publication === 'published'
