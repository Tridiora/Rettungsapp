'use client'
import {SourceLinks} from '@/components/source-links'
import { LanguageSwitch, LearningText, TermText } from '@/components/learning-language'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Quiz } from '@/types'
import { useLibrary } from '@/lib/use-library'
import { useAppStore } from '@/stores/app-store'
import { useLearningStore } from '@/stores/learning-store'

export function QuizExecutionClient({ quizId }: { quizId: string }) {
  const { quizzes } = useLibrary()
  const quiz = quizzes.find(q => q.id === quizId)
  if (!quiz || !quiz.questions.length) return <div className="p-8 space-y-4"><h1 className="text-xl font-bold">Dieses Quiz ist noch nicht verfügbar.</h1><Link href="/quiz" className="underline text-accent-ink">Zur Quizübersicht</Link></div>
  return <QuizPlayer key={quiz.id + JSON.stringify(quiz.questions)} quiz={quiz} />
}
function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const user = useAppStore(s => s.currentUser)
  const recordQuiz = useLearningStore(s => s.recordQuiz)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [finished, setFinished] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(quiz.timeLimit || null)
  const [attemptId, setAttemptId] = useState(() => crypto.randomUUID())
  const correct = (q: Quiz['questions'][number]) => {
    const selected = answers[q.id] || [], expected = q.answers.filter(a => a.isCorrect).map(a => a.id)
    return selected.length === expected.length && expected.every(id => selected.includes(id))
  }
  const total = quiz.questions.reduce((n,q) => n + q.points, 0)
  const score = quiz.questions.reduce((n,q) => n + (correct(q) ? q.points : 0), 0)
  const percentage = total ? Math.round(score / total * 100) : 0
  const finish = useCallback(() => {
    setFinished(true)
    if (user) recordQuiz({ id: attemptId, userId: user.id, quizId: quiz.id, title: quiz.title, percentage, passed: percentage >= quiz.passingScore })
  }, [user, recordQuiz, attemptId, quiz.id, quiz.title, quiz.passingScore, percentage])
  useEffect(() => {
    if (finished || remaining === null) return
    const timer = window.setTimeout(() => { if (remaining <= 1) { setRemaining(0); finish() } else setRemaining(remaining - 1) }, 1000)
    return () => window.clearTimeout(timer)
  }, [finished, remaining, finish])
  const question = quiz.questions[index]
  return <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
    <header className="flex justify-between items-center gap-4"><Link className="text-accent-ink underline" href="/quiz">Zur Quizübersicht</Link><span className="rounded-xl border border-border p-3 text-sm">{remaining === null ? 'Ohne Zeitlimit' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2,'0')}`}</span></header><h1 className="text-2xl font-bold">{quiz.title}</h1><LanguageSwitch />
    {!finished ? <section className="p-6 rounded-2xl border border-border bg-surface space-y-5"><p className="text-accent-ink">Frage {index + 1} von {quiz.questions.length}</p><h2 className="text-xl font-semibold"><LearningText technical={question.text} simple={question.simpleText} /></h2>{question.imageUrl&&<img src={question.imageUrl} alt="Abbildung zur Quizfrage" className="max-h-72 mx-auto rounded-xl"/>}<p className="text-sm text-muted">{question.type === 'multiple_choice' ? 'Mehrere Antworten können richtig sein.' : 'Wähle genau eine Antwort.'}</p><div className="space-y-3">{question.answers.map(a => { const selected = answers[question.id]?.includes(a.id) || false; return <div key={a.id} role="button" tabIndex={0} aria-pressed={selected} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.currentTarget.click()}}} onClick={() => setAnswers(old => ({ ...old, [question.id]: question.type === 'multiple_choice' ? selected ? (old[question.id] || []).filter(id => id !== a.id) : [...(old[question.id] || []), a.id] : [a.id] }))} className={`w-full text-left p-4 rounded-xl border ${selected ? 'border-accent bg-accent/15' : 'border-border hover:bg-surface-hover'}`}><TermText text={a.text}/></div> })}</div><div className="flex justify-between gap-3"><button disabled={index === 0} onClick={() => setIndex(index - 1)} className="rounded-xl border border-border px-4 py-3">Zurück</button><button disabled={!answers[question.id]?.length} onClick={() => index + 1 === quiz.questions.length ? finish() : setIndex(index + 1)} className="rounded-xl bg-accent text-white px-5 py-3">{index + 1 === quiz.questions.length ? 'Auswerten' : 'Nächste Frage'}</button></div></section> : <>
      <section className="p-6 bg-surface border border-border rounded-2xl space-y-3"><h2 className="text-2xl font-bold">{percentage}% · {percentage >= quiz.passingScore ? 'Bestanden' : 'Weiter üben'}</h2><p>{score} von {total} Punkten. Bestehensgrenze: {quiz.passingScore}%.</p><p className="text-sm text-muted">Ergebnis im lokalen Lernprofil gespeichert.</p><button className="bg-accent text-white rounded-xl px-4 py-3" onClick={() => { setAnswers({}); setIndex(0); setFinished(false); setRemaining(quiz.timeLimit || null); setAttemptId(crypto.randomUUID()) }}>Erneut versuchen</button></section>
      {quiz.questions.map(q => <article key={q.id} className="p-5 border border-border rounded-xl bg-surface space-y-2"><h3 className="font-bold">{correct(q) ? '✓' : '↻'} <LearningText technical={q.text} simple={q.simpleText} /></h3><p className="text-sm">Richtig: {q.answers.filter(a => a.isCorrect).map(a => a.text).join(' · ')}</p><p className="text-sm text-muted">Deine Auswahl: {q.answers.filter(a => answers[q.id]?.includes(a.id)).map(a => a.text).join(' · ') || 'Keine Antwort'}</p>{q.explanation && <p><LearningText technical={q.explanation} simple={q.simpleExplanation} /></p>}<SourceLinks source={q.source}/></article>)}
    </>}
  </div>
}
