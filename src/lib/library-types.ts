import type { Deck, Flashcard, Quiz, YearLevel } from '@/types'

export type Publication = 'draft' | 'published' | 'archived'
export type Managed<T> = T & { publication?: Publication; source?: string; yearLevel?: YearLevel }
export interface LearningDocument {
  id: string
  title: string
  category: string
  pages: number
  date: string
  summary: string
  imageUrl?: string
  yearLevel?: YearLevel
  visualSteps?: { title:string; technical:string; simple:string }[]
  resources?: { title:string; url:string; kind:string }[]
  sections: { id: string; title: string; content: string; simpleContent?: string; sources?: string[] }[]
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
