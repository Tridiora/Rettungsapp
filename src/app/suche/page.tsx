'use client'
import Link from 'next/link'
import { anatomyModels as initialModels } from '@/lib/anatomy-data'
import { useEditorialStore } from '@/stores/editorial-store'
import { useSearchParams } from 'next/navigation'
import { useLibrary } from '@/lib/use-library'
export default function SearchPage() {
  const q = useSearchParams().get('q')?.trim().toLocaleLowerCase('de') || ''
  const library = useLibrary()
  const records = useEditorialStore(s => s.records)
  const anatomyModels = records === null ? [] : records.filter(r => r.kind === 'anatomy').map(r => r.data as unknown as typeof initialModels[number])
  const entries = [...library.decks.map(d => ({ title: d.title, text: d.description || '', type: 'Lernset', href: `/karteikarten/${d.id}` })), ...library.cards.map(c => ({ title: c.front, text: c.back, type: 'Lernkarte', href: `/karteikarten/${c.deckId}` })), ...library.quizzes.map(q => ({ title: q.title, text: q.description || '', type: 'Wissensquiz', href: `/quiz/${q.id}` })), ...library.documents.map(d => ({ title: d.title, text: d.summary, type: 'Unterlage', href: `/dokumente?dokument=${d.id}` })), ...anatomyModels.map(m => ({ title: `Anatomie: ${m.title}`, text: m.parts.map(p => `${p.name} (${p.term})`).join(' · '), type: 'Interaktive Anatomie', href: `/anatomie?bereich=${m.id}` }))]
  const matches = entries.filter(e => !q || `${e.title} ${e.text}`.toLocaleLowerCase('de').includes(q))
  return <div className="max-w-4xl mx-auto p-6 space-y-5"><h1 className="text-3xl font-bold">{q ? `Suchergebnisse für „${q}“` : 'Alle Lerninhalte'}</h1><p className="text-muted">{matches.length} Treffer in veröffentlichten Inhalten</p>{!matches.length && <p>Keine Treffer. Versuche einen kürzeren Begriff oder einen anderen Fachbegriff.</p>}{matches.map((m,i) => <Link key={`${m.href}-${i}`} href={m.href} className="block rounded-xl border border-border bg-surface p-5 hover:border-accent"><span className="text-xs text-accent-ink">{m.type}</span><h2 className="font-bold mt-1">{m.title}</h2><p className="text-sm text-muted line-clamp-2 mt-1">{m.text}</p></Link>)}</div>
}
