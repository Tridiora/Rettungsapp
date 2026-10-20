'use client'
import Link from 'next/link'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { useLibrary } from '@/lib/use-library'
export default function LearningProgress() {
  const { reviews, attempts } = useLearningStore()
  const user = useAppStore(s => s.currentUser)
  const { decks, cards } = useLibrary()
  const mine = Object.values(reviews).filter(r => r.userId === user?.id && cards.some(c => c.id === r.cardId))
  const quizzes = attempts.filter(a => a.userId === user?.id)
  return <div className="max-w-5xl mx-auto p-6 space-y-6"><h1 className="text-3xl font-bold">Mein Lernfortschritt</h1><p className="text-muted">Deine tatsächlichen Ergebnisse aus diesem lokalen Lernprofil.</p><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{[1,2,3,4,5].map(box => <div key={box} className="rounded-xl border border-border bg-surface p-4"><p className="text-sm text-muted">Lernfach {box}</p><p className="text-3xl font-bold mt-2">{mine.filter(r => r.box === box).length}</p><p className="text-xs text-muted mt-2">Nach {[0,1,2,5,14,30][box]} Tagen wiederholen</p></div>)}</div><h2 className="text-xl font-bold">Lernsets</h2>{decks.map(d => { const learned = mine.filter(r => r.deckId === d.id).length; return <Link key={d.id} href={`/karteikarten/${d.id}`} className="block border border-border bg-surface p-5 rounded-xl"><div className="flex justify-between gap-3"><h3 className="font-bold">{d.title}</h3><span>{learned} / {d.cardCount}</span></div><progress aria-label={`Geübte Karten: ${d.title}`} max={d.cardCount || 1} value={learned} className="w-full h-2 mt-4 accent-teal-600" /></Link> })}<h2 className="text-xl font-bold">Letzte Quiz-Ergebnisse</h2>{!quizzes.length && <p>Noch keine Quiz-Ergebnisse. <Link href="/quiz" className="underline text-accent-ink">Jetzt ein Quiz starten</Link></p>}{quizzes.slice(0,20).map(a => <div key={a.id} className="rounded-xl border border-border bg-surface p-4 flex flex-wrap justify-between gap-3"><span>{a.title}<small className="block text-muted">{new Date(a.at).toLocaleString('de-DE')}</small></span><strong>{a.percentage}% · {a.passed ? 'Bestanden' : 'Weiter üben'}</strong></div>)}</div>
}
