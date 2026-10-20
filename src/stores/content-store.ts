import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Flashcard } from '@/types'

export interface CommunityCard extends Omit<Flashcard, 'createdAt' | 'updatedAt'> {
  simpleExplanation: string
  source: string
  feedback?: string
  createdAt: string
  updatedAt: string
}

interface ContentState {
  cards: CommunityCard[]
  submit: (card: Omit<CommunityCard, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void
  review: (id: string, status: 'approved' | 'rejected', feedback: string) => void
}

// Local prototype repository. Production authorization belongs on the server.
export const useContentStore = create<ContentState>()(persist((set) => ({
  cards: [],
  submit: (card) => set((state) => ({ cards: [...state.cards, {
    ...card, id: crypto.randomUUID(), status: 'pending_review',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }] })),
  review: (id, status, feedback) => set((state) => ({
    cards: state.cards.map((card) => card.id === id && card.status === 'pending_review'
      ? { ...card, status, feedback, updatedAt: new Date().toISOString() } : card),
  })),
}), { name: 'medlearn-community-v1', skipHydration: true }))
