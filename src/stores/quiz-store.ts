import { create } from 'zustand'
import type { Quiz } from '@/types'

// ── Store interface ──────────────────────────────────
interface QuizStore {
  // Current quiz
  currentQuiz: Quiz | null
  currentQuestionIndex: number
  selectedAnswers: Map<string, string[]>
  timeRemaining: number | null
  isActive: boolean
  showResults: boolean

  // Actions
  startQuiz: (quiz: Quiz) => void
  selectAnswer: (questionId: string, answerId: string) => void
  deselectAnswer: (questionId: string, answerId: string) => void
  nextQuestion: () => void
  previousQuestion: () => void
  submitQuiz: () => void
  resetQuiz: () => void
  tick: () => void

  // Results
  getScore: () => { score: number; total: number; percentage: number }
  getQuestionResult: (questionId: string) => boolean
}

// ── Store implementation ─────────────────────────────
export const useQuizStore = create<QuizStore>()((set, get) => ({
  // State
  currentQuiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: new Map<string, string[]>(),
  timeRemaining: null,
  isActive: false,
  showResults: false,

  // Actions
  startQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      currentQuestionIndex: 0,
      selectedAnswers: new Map(),
      timeRemaining: quiz.timeLimit ?? null,
      isActive: true,
      showResults: false,
    }),

  selectAnswer: (questionId, answerId) =>
    set((s) => {
      const answers = new Map(s.selectedAnswers)
      const question = s.currentQuiz?.questions.find(
        (q) => q.id === questionId,
      )
      const existing = answers.get(questionId) ?? []

      if (question?.type === 'single_choice' || question?.type === 'true_false') {
        // Single-choice: replace selection
        answers.set(questionId, [answerId])
      } else {
        // Multiple-choice: toggle
        if (!existing.includes(answerId)) {
          answers.set(questionId, [...existing, answerId])
        }
      }

      return { selectedAnswers: answers }
    }),

  deselectAnswer: (questionId, answerId) =>
    set((s) => {
      const answers = new Map(s.selectedAnswers)
      const existing = answers.get(questionId) ?? []
      answers.set(
        questionId,
        existing.filter((id) => id !== answerId),
      )
      return { selectedAnswers: answers }
    }),

  nextQuestion: () =>
    set((s) => {
      const max = (s.currentQuiz?.questions.length ?? 1) - 1
      return {
        currentQuestionIndex: Math.min(s.currentQuestionIndex + 1, max),
      }
    }),

  previousQuestion: () =>
    set((s) => ({
      currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1),
    })),

  submitQuiz: () =>
    set({
      isActive: false,
      showResults: true,
    }),

  resetQuiz: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      selectedAnswers: new Map(),
      timeRemaining: null,
      isActive: false,
      showResults: false,
    }),

  tick: () =>
    set((s) => {
      if (s.timeRemaining === null || s.timeRemaining <= 0) return s
      const next = s.timeRemaining - 1
      if (next <= 0) {
        return { timeRemaining: 0, isActive: false, showResults: true }
      }
      return { timeRemaining: next }
    }),

  // Computed
  getScore: () => {
    const { currentQuiz, selectedAnswers } = get()
    if (!currentQuiz) return { score: 0, total: 0, percentage: 0 }

    let score = 0
    const total = currentQuiz.questions.reduce((sum, q) => sum + q.points, 0)

    for (const question of currentQuiz.questions) {
      const selected = selectedAnswers.get(question.id) ?? []
      const correctIds = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id)

      const isCorrect =
        correctIds.length === selected.length &&
        correctIds.every((id) => selected.includes(id))

      if (isCorrect) {
        score += question.points
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    return { score, total, percentage }
  },

  getQuestionResult: (questionId) => {
    const { currentQuiz, selectedAnswers } = get()
    const question = currentQuiz?.questions.find((q) => q.id === questionId)
    if (!question) return false

    const selected = selectedAnswers.get(questionId) ?? []
    const correctIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id)

    return (
      correctIds.length === selected.length &&
      correctIds.every((id) => selected.includes(id))
    )
  },
}))
