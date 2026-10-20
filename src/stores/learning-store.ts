import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Review { userId: string; cardId: string; deckId: string; box: number; nextAt: string; lastAt: string; correct: number; total: number }
interface Attempt { id: string; userId: string; quizId: string; title: string; percentage: number; passed: boolean; at: string }
interface LearningState {
  reviews: Record<string, Review>
  attempts: Attempt[]
  recordCard: (userId: string, deckId: string, cardId: string, correct: boolean) => void
  recordQuiz: (attempt: Omit<Attempt, 'at'>) => void
}
export const useLearningStore = create<LearningState>()(persist((set) => ({
  reviews: {}, attempts: [],
  recordCard: (userId, deckId, cardId, correct) => set(s => {
    const key = `${userId}:${cardId}`, old = s.reviews[key]
    const box = correct ? Math.min(5, (old?.box || 1) + 1) : 1
    const next = new Date(); next.setDate(next.getDate() + [0, 1, 2, 5, 14, 30][box])
    return { reviews: { ...s.reviews, [key]: { userId, deckId, cardId, box, nextAt: next.toISOString(), lastAt: new Date().toISOString(), correct: (old?.correct || 0) + Number(correct), total: (old?.total || 0) + 1 } } }
  }),
  recordQuiz: attempt => set(s => s.attempts.some(a => a.id === attempt.id) ? s : ({ attempts: [{ ...attempt, at: new Date().toISOString() }, ...s.attempts] })),
}), { name: 'medlearn-learning-v1', skipHydration: true }))
