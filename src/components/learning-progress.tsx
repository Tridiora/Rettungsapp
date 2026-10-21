'use client'
import Link from 'next/link'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { useLibrary } from '@/lib/use-library'
import { LearningTimeline } from '@/components/timeline/learning-timeline'
import { Award, BookOpen, Brain, CheckCircle2, TrendingUp } from 'lucide-react'

export default function LearningProgress() {
  const { reviews, attempts } = useLearningStore()
  const user = useAppStore((s) => s.currentUser)
  const { decks, cards } = useLibrary()

  const mine = Object.values(reviews).filter((r) => r.userId === user?.id && cards.some((c) => c.id === r.cardId))
  const quizzes = attempts.filter((a) => a.userId === user?.id)

  // Calculate cards learned per year level
  const yearStats = [1, 2, 3].map((year) => {
    const yearDecks = decks.filter((d) => d.yearLevel === year || (d.tags && d.tags.includes(`${year}. Lehrjahr`)))
    const yearCards = cards.filter((c) => c.yearLevel === year || yearDecks.some((d) => d.id === c.deckId))
    const learnedInYear = mine.filter((r) => yearCards.some((c) => c.id === r.cardId)).length
    const totalInYear = yearCards.length || (yearDecks.reduce((sum, d) => sum + d.cardCount, 0))
    const pct = totalInYear > 0 ? Math.round((learnedInYear / totalInYear) * 100) : 0
    return { year, learnedInYear, totalInYear, pct }
  })

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black">Mein Ausbildungs- & Lernfortschritt</h1>
        <p className="text-muted text-sm mt-1">
          Deine tatsächlichen Ergebnisse und Zeitstrahl-Meilensteine aus diesem Lernprofil.
        </p>
      </div>

      {/* ── Interactive Timeline ── */}
      <LearningTimeline />

      {/* ── Progress by Year Level ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Fortschritt nach Ausbildungsjahren</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {yearStats.map(({ year, learnedInYear, totalInYear, pct }) => (
            <div key={year} className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">{year}. Lehrjahr</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent-ink">
                  {pct}%
                </span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {learnedInYear} von {totalInYear} Karten verinnerlicht
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Spaced Repetition Boxes ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Langzeitgedächtnis (Leitner-Lernsystem)</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((box) => (
            <div key={box} className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-xs font-semibold text-muted">Fach {box}</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{mine.filter((r) => r.box === box).length}</p>
              <p className="text-[11px] text-muted mt-2">
                Wiederholung nach {[0, 1, 2, 5, 14, 30][box]} Tagen
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Learning Sets ── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Lernsets & Beherrschung</h2>
          <Link href="/karteikarten" className="text-accent-ink text-sm underline font-semibold">
            Alle Lernsets
          </Link>
        </div>
        <div className="space-y-3">
          {decks.slice(0, 10).map((d) => {
            const learned = mine.filter((r) => r.deckId === d.id).length
            return (
              <Link
                key={d.id}
                href={`/karteikarten/${d.id}`}
                className="block border border-border bg-surface p-5 rounded-2xl hover:border-accent transition-colors"
              >
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <h3 className="font-bold text-base">{d.title}</h3>
                    {d.yearLevel && (
                      <span className="text-[11px] text-accent-ink font-semibold">
                        {d.yearLevel}. Lehrjahr
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-muted">
                    {learned} / {d.cardCount}
                  </span>
                </div>
                <progress
                  aria-label={`Geübte Karten: ${d.title}`}
                  max={d.cardCount || 1}
                  value={learned}
                  className="w-full h-2 mt-4 accent-teal-600 rounded-full"
                />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Recent Quiz Results ── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Letzte Quiz-Ergebnisse</h2>
          <Link href="/quiz" className="text-accent-ink text-sm underline font-semibold">
            Neues Quiz starten
          </Link>
        </div>
        {!quizzes.length && (
          <p className="text-muted text-sm">
            Noch keine Quiz-Ergebnisse gespeichert.{' '}
            <Link href="/quiz" className="underline text-accent-ink font-semibold">
              Jetzt ein Quiz starten
            </Link>
          </p>
        )}
        <div className="space-y-2">
          {quizzes.slice(0, 15).map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-border bg-surface p-4 flex flex-wrap justify-between items-center gap-3"
            >
              <div>
                <strong className="block text-sm">{a.title}</strong>
                <small className="text-muted text-xs">{new Date(a.at).toLocaleString('de-DE')}</small>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  a.passed
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                }`}
              >
                {a.percentage}% · {a.passed ? 'Bestanden' : 'Weiter üben'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
