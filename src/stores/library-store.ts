import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decks, flashcards, quizzes } from '@/lib/db/mock-data'
import { officialDocuments } from '@/lib/db/documents'
import { useAppStore } from './app-store'
import { germanStarter } from '@/lib/db/german-starter'
import type { Library, ContentKind, LibraryItem, Publication } from '@/lib/library-types'

type Change = { id: string; title: string; action: string; at: string }
interface LibraryState extends Library {
  changes: Change[]
  save: (kind: ContentKind, item: LibraryItem) => void
  setPublication: (kind: ContentKind, id: string, publication: Publication) => void
}
export function canManage() {
  return ['admin', 'developer'].includes(useAppStore.getState().currentUser?.role || '')
}
export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  decks: [...germanStarter.decks, ...decks.map(d => ({ ...d, publication: 'draft' as const }))],
  cards: [...germanStarter.cards, ...flashcards.map(c => ({ ...c, publication: 'draft' as const }))],
  quizzes: [...germanStarter.quizzes, ...quizzes.map(q => ({ ...q, publication: 'draft' as const }))],
  documents: [...germanStarter.documents, ...officialDocuments.map(d => ({ ...d, publication: 'draft' as const }))], changes: [],
  save: (kind, item) => {
    if (!canManage()) throw new Error('Für diese Änderung ist die lokale Admin-Rolle erforderlich.')
    set(state => {
      const items = state[kind] as LibraryItem[]
      const existing = items.some(row => row.id === item.id)
      return { [kind]: existing ? items.map(row => row.id === item.id ? item : row) : [...items, item],
        changes: [{ id: crypto.randomUUID(), title: 'title' in item ? item.title : item.front,
          action: existing ? 'Bearbeitet' : 'Erstellt', at: new Date().toISOString() }, ...state.changes].slice(0, 100) }
    })
  },
  setPublication: (kind, id, publication) => {
    if (!canManage()) throw new Error('Für diese Änderung ist die lokale Admin-Rolle erforderlich.')
    set(state => ({ [kind]: state[kind].map(item => item.id === id ? { ...item, publication } : item),
      changes: [{ id: crypto.randomUUID(), title: id, action: publication === 'archived' ? 'Archiviert' : 'Als Entwurf wiederhergestellt', at: new Date().toISOString() }, ...state.changes].slice(0, 100) }))
  },
}), { name: 'medlearn-library-v1', skipHydration: true, version: 3,
  migrate: (persisted) => {
    const previous = persisted as LibraryState
    const appendMissing = <T extends { id: string }>(existing: T[], incoming: T[]) => [...existing, ...incoming.filter(item => !existing.some(row => row.id === item.id))]
    const state = { ...previous, decks: appendMissing(previous.decks, germanStarter.decks), cards: appendMissing(previous.cards, germanStarter.cards), quizzes: appendMissing(previous.quizzes, germanStarter.quizzes), documents: appendMissing(previous.documents, germanStarter.documents) }
    return { ...state,
      quizzes: state.quizzes.map(quiz => { const starter = germanStarter.quizzes.find(q => q.id === quiz.id); return { ...quiz, questions: quiz.questions.map(q => { const original = starter?.questions.find(row => row.id === q.id && row.text === q.text); return original ? { ...q, simpleText: !q.simpleText || q.simpleText === `Welche Struktur ist gemeint? ${original.simpleExplanation?.split(': ').slice(1).join(': ')}` ? original.simpleText : q.simpleText, simpleExplanation: q.simpleExplanation || original.simpleExplanation } : q }) } }),
      documents: state.documents.map(doc => { const starter = germanStarter.documents.find(d => d.id === doc.id); return { ...doc, sections: doc.sections.map(section => { const original = starter?.sections.find(row => row.id === section.id && row.content === section.content); return original ? { ...section, simpleContent: section.simpleContent || original.simpleContent } : section }) } }),
    }
  }
}))
