'use client'
import {questionsForYear} from '@/lib/learning-filters'
import { SourceLinks } from '@/components/source-links'
import { LanguageSwitch, LearningText, TermText } from '@/components/learning-language'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { Quiz } from '@/types'
import { useLibrary } from '@/lib/use-library'
import { useAppStore } from '@/stores/app-store'
import { useLearningStore } from '@/stores/learning-store'
import { Shuffle, RotateCcw, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export function QuizExecutionClient({ quizId }: { quizId: string }) {
  const { quizzes } = useLibrary()
  const quiz = quizzes.find((q) => q.id === quizId)
  if (!quiz || !quiz.questions.length) {
    return (
      <div className="p-8 space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-bold">Dieses Quiz ist noch nicht verfügbar.</h1>
        <Link href="/quiz" className="underline text-accent-ink">
          Zur Quizübersicht
        </Link>
      </div>
    )
  }
  return <QuizSetup key={quiz.id} quiz={quiz} />
}

function QuizSetup({quiz}:{quiz:Quiz}) {
 const selectedYear=useAppStore(s=>s.selectedYear)
 const [count,setCount]=useState(20)
 const [started,setStarted]=useState<Quiz|null>(null)
 const eligible=questionsForYear(quiz,selectedYear)
 if(started)return <QuizPlayer key={started.id} quiz={started}/>
 return <section className="max-w-3xl mx-auto p-5 md:p-8 space-y-5">
  <Link href="/quiz" className="underline">Zur Quizübersicht</Link>
  <h1 className="text-2xl font-bold">{quiz.title}</h1>
  <p>{eligible.length} Fragen · {selectedYear==='all'?'Alle Lehrjahre':`${selectedYear}. Lehrjahr`} · Erklärgrafiken in der Auswertung</p>
  <label className="block">Umfang der Lernrunde<select aria-label="Fragen pro Runde" className="block mt-2 rounded-xl border border-border bg-surface p-3" value={count} onChange={e=>setCount(Number(e.target.value))}>{[20,40,eligible.length].filter((n,i,a)=>n<=eligible.length&&a.indexOf(n)===i).map(n=><option key={n} value={n}>{n} Fragen</option>)}</select></label>
  {eligible.length<20?<p>Für dieses Lehrjahr sind noch keine 20 Fragen verfügbar. Wähle in der Übersicht „Alle Lehrjahre“.</p>:<button className="rounded-xl bg-accent text-white px-6 py-3" onClick={()=>setStarted({...quiz,questions:shuffleArray(eligible).slice(0,count),yearLevel:selectedYear})}>Lernrunde starten</button>}
 </section>
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const user = useAppStore((s) => s.currentUser)
  const recordQuiz = useLearningStore((s) => s.recordQuiz)

  const [shuffleMode, setShuffleMode] = useState(true)
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now())

  // Prepared questions with optional shuffled order and shuffled answer options
  const activeQuestions = useMemo(() => {
    let qs = quiz.questions.map((q) => ({
      ...q,
      answers: shuffleMode ? shuffleArray(q.answers) : q.answers,
    }))
    if (shuffleMode) {
      qs = shuffleArray(qs)
    }
    return qs
  }, [quiz.questions, shuffleMode, shuffleSeed])

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [finished, setFinished] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(quiz.timeLimit || null)
  const [attemptId, setAttemptId] = useState(() => crypto.randomUUID())

  const correct = (q: Quiz['questions'][number]) => {
    const selected = answers[q.id] || []
    const expected = q.answers.filter((a) => a.isCorrect).map((a) => a.id)
    return selected.length === expected.length && expected.every((id) => selected.includes(id))
  }

  const total = activeQuestions.reduce((n, q) => n + q.points, 0)
  const score = activeQuestions.reduce((n, q) => n + (correct(q) ? q.points : 0), 0)
  const percentage = total ? Math.round((score / total) * 100) : 0

  const finish = useCallback(() => {
    setFinished(true)
    if (user) {
      recordQuiz({
        id: attemptId,
        userId: user.id,
        quizId: quiz.id,
        title: quiz.title,
        percentage,
        passed: percentage >= quiz.passingScore,
      })
    }
  }, [user, recordQuiz, attemptId, quiz.id, quiz.title, quiz.passingScore, percentage])

  useEffect(() => {
    if (finished || remaining === null) return
    const timer = window.setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0)
        finish()
      } else {
        setRemaining(remaining - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [finished, remaining, finish])

  function restart(reshuffle = true) {
    setAnswers({})
    setIndex(0)
    setFinished(false)
    setRemaining(quiz.timeLimit || null)
    setAttemptId(crypto.randomUUID())
    if (reshuffle) setShuffleSeed(Date.now())
  }

  const question = activeQuestions[index]

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      {/* ── Top Bar ── */}
      <header className="flex flex-wrap justify-between items-center gap-3">
        <Link className="inline-flex items-center gap-1.5 text-accent-ink underline text-sm font-semibold" href="/quiz">
          <ArrowLeft className="w-4 h-4" />
          <span>Zur Quizübersicht</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !shuffleMode
              setShuffleMode(next)
              restart(next)
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              shuffleMode ? 'bg-accent/15 border-accent text-accent-ink' : 'border-border bg-surface text-muted'
            }`}
            title="Fragen und Antworten zufällig mischen, um den Lernerfolg zu festigen"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{shuffleMode ? 'Gemischte Reihenfolge: An' : 'Reihenfolge: Original'}</span>
          </button>
          <span className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
            {remaining === null ? 'Ohne Zeitlimit' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
          </span>
        </div>
      </header>

      {/* ── Title & Language Switch ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          {quiz.yearLevel && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-ink">
              {quiz.yearLevel}. Lehrjahr
            </span>
          )}
          <span className="text-xs text-muted">{quiz.category?.name || 'Allgemein'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{quiz.title}</h1>
      </div>

      <LanguageSwitch />

      {!finished ? (
        <section className="p-6 rounded-3xl border border-border bg-surface space-y-5 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-accent-ink">
              Frage {index + 1} von {activeQuestions.length}
            </span>
            <span className="text-muted">
              {question.type === 'multiple_choice' ? 'Mehrere Antworten möglich' : 'Genau eine richtige Antwort'}
            </span>
          </div>

          <h2 className="text-xl font-bold leading-relaxed">
            <LearningText technical={question.text} simple={question.simpleText} />
          </h2>

          {question.imageUrl && (
            <img src={question.imageUrl} alt="Abbildung zur Quizfrage" className="max-h-72 mx-auto rounded-2xl" />
          )}

          {/* ── Answer Choices ── */}
          <div className="space-y-3">
            {question.answers.map((a) => {
              const selected = answers[question.id]?.includes(a.id) || false
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      e.currentTarget.click()
                    }
                  }}
                  onClick={() =>
                    setAnswers((old) => ({
                      ...old,
                      [question.id]:
                        question.type === 'multiple_choice'
                          ? selected
                            ? (old[question.id] || []).filter((id) => id !== a.id)
                            : [...(old[question.id] || []), a.id]
                          : [a.id],
                    }))
                  }
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selected ? 'border-accent bg-accent/15 font-medium' : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <TermText text={a.text} />
                </div>
              )
            })}
          </div>

          {/* ── Navigation Buttons ── */}
          <div className="flex justify-between gap-3 pt-3 border-t border-border">
            <button
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              Zurück
            </button>
            <button
              disabled={!answers[question.id]?.length}
              onClick={() => (index + 1 === activeQuestions.length ? finish() : setIndex(index + 1))}
              className="rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-40"
            >
              {index + 1 === activeQuestions.length ? 'Auswerten' : 'Nächste Frage'}
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* ── Results Summary ── */}
          <section className="p-6 md:p-8 bg-surface border border-border rounded-3xl space-y-4 shadow-sm text-center">
            <div className="inline-flex p-3 rounded-full bg-accent/10 text-accent-ink mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black">
              {percentage}% · {percentage >= quiz.passingScore ? 'Bestanden! 🎉' : 'Weiter üben'}
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              Du hast {score} von {total} Punkten erreicht. Die Bestehensgrenze liegt bei {quiz.passingScore}%.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                className="inline-flex items-center gap-2 bg-accent text-white rounded-xl px-5 py-3 font-semibold shadow-sm hover:opacity-90"
                onClick={() => restart(true)}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Neu gemischt wiederholen</span>
              </button>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 border border-border rounded-xl px-5 py-3 font-semibold bg-surface-hover"
              >
                <span>Anderes Quiz wählen</span>
              </Link>
            </div>
          </section>

          {/* ── Question by Question Review ── */}
          <h3 className="text-xl font-bold pt-4">Detaillierte Auswertung & Begründungen</h3>
          <div className="space-y-4">
            {activeQuestions.map((q) => {
              const isQCorrect = correct(q)
              return (
                <article
                  key={q.id}
                  className={`p-5 border rounded-2xl bg-surface space-y-3 ${
                    isQCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isQCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {isQCorrect ? 'Richtig' : 'Falsch beantwortet'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base">
                    <LearningText technical={q.text} simple={q.simpleText} />
                  </h4>

                  <div className="text-xs space-y-1">
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ Richtige Antwort: {q.answers.filter((a) => a.isCorrect).map((a) => a.text).join(' · ')}
                    </p>
                    <p className="text-muted">
                      Deine Auswahl: {q.answers.filter((a) => answers[q.id]?.includes(a.id)).map((a) => a.text).join(' · ') || 'Keine Antwort'}
                    </p>
                  </div>

                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-surface-hover/70 text-xs text-foreground/90 border border-border leading-relaxed">
                      <strong>Begründung: </strong>
                      <LearningText technical={q.explanation} simple={q.simpleExplanation} />
                    </div>
                  )}

                  {q.explanationImageUrl && <img loading="lazy" src={q.explanationImageUrl} alt={`Erklärschema zur Auflösung: ${q.text}`} className="w-full rounded-xl"/>}
                  <SourceLinks source={q.source} />
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
