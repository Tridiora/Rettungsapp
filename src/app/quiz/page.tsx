'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { categories } from '@/lib/db/mock-data'
import { useLibrary } from '@/lib/use-library'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

export default function QuizOverviewPage() {
  const { quizzes } = useLibrary()
  const user = useAppStore(s => s.currentUser)
  const quizAttempts = useLearningStore(s => s.attempts).filter(a => a.userId === user?.id)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredQuizzes = quizzes.filter((q) => {
    return selectedCategory === 'all' || q.categoryId === selectedCategory
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-secondary-ink text-sm font-semibold mb-1">
            <Brain className="w-4 h-4" />
            <span>Wissen wiederholen und festigen</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Wissensquiz für die Ausbildung
          </h1>
          <p className="text-sm text-muted">
            Übe mit Fragen aus veröffentlichten Lerninhalten für Deutschland. Zeitlimit und Bestehensgrenze stehen beim jeweiligen Quiz.
          </p>
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
            selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-muted hover:text-foreground'
          )}
        >
          Alle Themen
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5',
              selectedCategory === c.id
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:text-foreground'
            )}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {!filteredQuizzes.length && <p>Für diesen Fachbereich gibt es noch kein veröffentlichtes Quiz.</p>}
      {/* ── Quizzes Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const attempt = quizAttempts.find((a) => a.quizId === quiz.id)

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-surface border border-border hover:border-secondary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-ink">
                    {quiz.category?.name || 'Allgemein'}
                  </span>
                  {quiz.isExamSimulation && (
                    <span className="text-[11px] font-bold text-secondary-ink bg-secondary/10 px-2 py-0.5 rounded-full">
                      Prüfung
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-foreground">
                  {quiz.title}
                </h3>
                <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted/70" />
                    <span>{quiz.timeLimit ? `${Math.round(quiz.timeLimit / 60)} Min` : 'Ohne Zeitlimit'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-muted/70" />
                    <span>{quiz.questions.length} Fragen</span>
                  </div>
                </div>

                {attempt && (
                  <div className="mt-3 p-2.5 rounded-xl bg-success/10 border border-success/20 text-xs text-success-ink font-medium flex items-center justify-between">
                    <span>Letztes Ergebnis:</span>
                    <span className="font-bold">{attempt.percentage}% {attempt.passed ? 'Bestanden' : 'Weiter üben'}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface-hover/50 border-t border-border flex justify-end">
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-light text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Quiz starten</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
