'use client'

import Link from 'next/link'
import { useContentStore } from '@/stores/content-store'
import { useAppStore } from '@/stores/app-store'

const labels = { draft: 'Entwurf', pending_review: 'In Prüfung', approved: 'Freigegeben', rejected: 'Überarbeitung nötig' }

export function CommunitySubmissions() {
  const cards = useContentStore((s) => s.cards)
  const user = useAppStore((s) => s.currentUser)
  const mine = cards.filter((c) => c.authorId === user?.id)
  if (!mine.length) return null
  return <section className="rounded-2xl border border-border bg-surface p-5 space-y-4" aria-label="Meine Einreichungen">
    <h2 className="font-bold text-lg">Meine Einreichungen</h2>
    <p className="text-sm text-muted">Dein Beitrag bleibt bis zur Freigabe außerhalb der gemeinsamen Lernsets.</p>
    {mine.map((card) => <article key={card.id} className="border-t border-border pt-3 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{card.front}</h3><span className="text-sm text-accent-ink">{labels[card.status]}</span></div>
      {card.feedback && <p className="text-sm">Rückmeldung: {card.feedback}</p>}
      {card.status === 'approved' && <Link className="text-sm text-accent-ink underline" href={`/karteikarten/${card.deckId}`}>Im Lernset üben</Link>}
    </article>)}
  </section>
}
