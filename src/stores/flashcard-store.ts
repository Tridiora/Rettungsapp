import { create } from 'zustand'
import type { StudyProgress } from '@/types'

// ── Leitner box intervals (in days) ──────────────────
const LEITNER_INTERVALS: Record<number, number> = {
  1: 0, // every session
  2: 2,
  3: 5,
  4: 14,
  5: 30,
}

// ── Store interface ──────────────────────────────────
interface FlashcardStore {
  // Current study session
  currentDeckId: string | null
  currentCardIndex: number
  isFlipped: boolean

  // Study progress – keyed by flashcard ID
  studyProgress: Map<string, StudyProgress>

  // Actions
  setCurrentDeck: (deckId: string) => void
  flipCard: () => void
  nextCard: () => void
  previousCard: () => void
  markCard: (cardId: string, correct: boolean) => void
  resetSession: () => void

  // Spaced Repetition (Leitner)
  getNextReviewCards: (deckId: string) => string[]
  moveCardToBox: (cardId: string, box: number) => void
}

// ── Helpers ──────────────────────────────────────────

function getNextReviewDate(box: number): Date {
  const now = new Date()
  now.setDate(now.getDate() + LEITNER_INTERVALS[box])
  return now
}

function isDueForReview(progress: StudyProgress): boolean {
  return new Date(progress.nextReviewAt) <= new Date()
}

// ── Store implementation ─────────────────────────────
export const useFlashcardStore = create<FlashcardStore>()((set, get) => ({
  // State
  currentDeckId: null,
  currentCardIndex: 0,
  isFlipped: false,
  studyProgress: new Map<string, StudyProgress>(),

  // Actions
  setCurrentDeck: (deckId) =>
    set({
      currentDeckId: deckId,
      currentCardIndex: 0,
      isFlipped: false,
    }),

  flipCard: () => set((s) => ({ isFlipped: !s.isFlipped })),

  nextCard: () =>
    set((s) => ({
      currentCardIndex: s.currentCardIndex + 1,
      isFlipped: false,
    })),

  previousCard: () =>
    set((s) => ({
      currentCardIndex: Math.max(0, s.currentCardIndex - 1),
      isFlipped: false,
    })),

  markCard: (cardId, correct) =>
    set((s) => {
      const progress = new Map(s.studyProgress)
      const existing = progress.get(cardId)

      if (existing) {
        const newBox = correct
          ? Math.min(5, existing.box + 1)
          : 1
        progress.set(cardId, {
          ...existing,
          box: newBox,
          nextReviewAt: getNextReviewDate(newBox),
          lastReviewedAt: new Date(),
          correctCount: existing.correctCount + (correct ? 1 : 0),
          incorrectCount: existing.incorrectCount + (correct ? 0 : 1),
          streak: correct ? existing.streak + 1 : 0,
        })
      } else {
        const newBox = correct ? 2 : 1
        progress.set(cardId, {
          id: `sp-${cardId}`,
          userId: '1',
          flashcardId: cardId,
          box: newBox,
          nextReviewAt: getNextReviewDate(newBox),
          lastReviewedAt: new Date(),
          correctCount: correct ? 1 : 0,
          incorrectCount: correct ? 0 : 1,
          streak: correct ? 1 : 0,
        })
      }

      return { studyProgress: progress }
    }),

  resetSession: () =>
    set({
      currentCardIndex: 0,
      isFlipped: false,
    }),

  getNextReviewCards: (_deckId) => {
    const { studyProgress } = get()
    const dueCards: string[] = []
    studyProgress.forEach((progress, cardId) => {
      if (isDueForReview(progress)) {
        dueCards.push(cardId)
      }
    })
    return dueCards
  },

  moveCardToBox: (cardId, box) =>
    set((s) => {
      const progress = new Map(s.studyProgress)
      const existing = progress.get(cardId)
      const clampedBox = Math.max(1, Math.min(5, box))

      if (existing) {
        progress.set(cardId, {
          ...existing,
          box: clampedBox,
          nextReviewAt: getNextReviewDate(clampedBox),
        })
      } else {
        progress.set(cardId, {
          id: `sp-${cardId}`,
          userId: '1',
          flashcardId: cardId,
          box: clampedBox,
          nextReviewAt: getNextReviewDate(clampedBox),
          correctCount: 0,
          incorrectCount: 0,
          streak: 0,
        })
      }

      return { studyProgress: progress }
    }),
}))
