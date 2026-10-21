'use client'

import {questionsForYear} from '@/lib/learning-filters'
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
  Shuffle,
} from 'lucide-react'
import { categories } from '@/lib/db/mock-data'
import { useLibrary } from '@/lib/use-library'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import type { YearLevel } from '@/types'

export default function QuizOverviewPage() {
  const { quizzes: allQuizzes } = useLibrary()
  const quizzes = allQuizzes.filter(q=>q.questions.length>=20)
  const user = useAppStore((s) => s.currentUser)
  const selectedYear = useAppStore((s) => s.selectedYear)
  const setSelectedYear = useAppStore((s) => s.setSelectedYear)
  const quizAttempts = useLearningStore((s) => s.attempts).filter((a) => a.userId === user?.id)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesCat = selectedCategory === 'all' || q.categoryId === selectedCategory
    const matchesYear = questionsForYear(q,selectedYear).length >= 20
    return matchesCat && matchesYear
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-ink text-sm font-semibold mb-1">
            <Brain className="w-4 h-4" />
            <span>Wissen wiederholen, festigen & prüfen</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Wissensquiz für die Notfallsanitäterausbildung
          </h1>
          <p className="text-sm text-muted">
            Übe mit Fragen aus dem Curriculum für Deutschland. Fragen und Antworten werden auf Wunsch bei jedem Durchlauf zufällig neu gemischt.
          </p>
        </div>
      </div>

      {/* ── Lehrjahr-Filter (Roter Faden) ── */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Ausbildungsjahr (Roter Faden):</span>
          <span className="text-xs text-muted">Alle Inhalte sind uneingeschränkt zugänglich</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'Alle Lehrjahre'],
              [1, '1. Lehrjahr: Grundlagen'],
              [2, '2. Lehrjahr: Notfallmedizin & Trauma'],
              [3, '3. Lehrjahr: Invasive Maßnahmen & Examen'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={String(val)}
              onClick={() => setSelectedYear(val as YearLevel)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
                selectedYear === val
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface-hover border border-border text-muted hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
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
          Alle Themengebiete
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

      {!filteredQuizzes.length && (
        <div className="p-8 text-center border border-dashed border-border rounded-2xl">
          <p className="text-muted">Für diesen Filter gibt es noch kein passendes Quiz.</p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSelectedYear('all')
            }}
            className="text-accent-ink text-sm underline font-semibold mt-2"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {/* ── Quizzes Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const attempt = quizAttempts.find((a) => a.quizId === quiz.id)

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-surface border border-border hover:border-accent/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2 items-center">
                    {quiz.yearLevel && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-ink">
                        {quiz.yearLevel}. Lehrjahr
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-ink">
                      {quiz.category?.name || 'Allgemein'}
                    </span>
                  </div>
                  {quiz.isExamSimulation && (
                    <span className="text-[11px] font-bold text-accent-ink bg-accent/10 px-2 py-0.5 rounded-full">
                      Examenssimulation
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-foreground">{quiz.title}</h3>
                <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{quiz.description}</p>

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
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between">
                    <span>Letztes Ergebnis:</span>
                    <span className="font-bold">
                      {attempt.percentage}% {attempt.passed ? 'Bestanden' : 'Weiter üben'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface-hover/50 border-t border-border flex justify-end">
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-all"
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
