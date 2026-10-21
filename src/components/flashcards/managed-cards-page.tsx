'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLibrary } from '@/lib/use-library'
import { isLearningBeta } from '@/lib/build-mode'
import { useNative } from '@/lib/use-native'
import { useEditorialStore } from '@/stores/editorial-store'
import { useAppStore } from '@/stores/app-store'
import { TermText } from '@/components/learning-language'
import type { YearLevel } from '@/types'

export default function ManagedCardsPage() {
  const { decks, cards } = useLibrary()
  const nativeDevice = useNative(); const native = nativeDevice || isLearningBeta
  const error = useEditorialStore((s) => s.error)
  const records = useEditorialStore((s) => s.records)
  const selectedYear = useAppStore((s) => s.selectedYear)
  const setSelectedYear = useAppStore((s) => s.setSelectedYear)
  const [query, setQuery] = useState('')

  const selectedCards = cards.filter(c => selectedYear === 'all' || (c.yearLevel || 1) === selectedYear)
  const filtered = decks.map(d => ({...d, cardCount:selectedCards.filter(c=>c.deckId===d.id).length})).filter(d => {
    const ownCards=selectedCards.filter(c=>c.deckId===d.id)
    return ownCards.length > 0 && [d.title,d.description,...ownCards.map(c=>c.front)].join(' ').toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <header>
        <p className="text-accent-ink font-semibold">Lernen und wiederholen</p>
        <h1 className="text-3xl font-bold mt-2">Karteikarten & Lernsets</h1>
        <p className="text-muted mt-2">
          Umfangreiches Curriculum für die Notfallsanitäterausbildung nach Lehrjahren geordnet.
        </p>
      </header>

      {/* ── Lehrjahr-Filter ── */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-muted">Filter nach Lehrjahr (Roter Faden):</span>
          <span className="text-muted">Suche und Lehrjahr werden kombiniert</span>
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedYear === val
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface-hover border border-border text-muted hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <input
        aria-label="Lernsets durchsuchen"
        className="w-full border border-border bg-surface rounded-xl p-3"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Thema oder Kartenfrage suchen (im gewählten Lehrjahr) …"
      />

      {error && <p role="alert">{error}</p>}
      {records === null ? (
        <p>Lernsets werden geladen …</p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {filtered.length} Lernsets · {filtered.reduce((sum,d)=>sum+d.cardCount,0)} Karten in dieser Auswahl
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((deck) => (
              <article key={deck.id} className="rounded-3xl border border-border bg-surface p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {deck.yearLevel && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-ink">
                        {deck.yearLevel}. Lehrjahr
                      </span>
                    )}
                    <span className="text-xs text-muted">{deck.category?.name || 'Curriculum'}</span>
                  </div>
                  {deck.coverImage && (
                    <img src={deck.coverImage} alt="" className="rounded-2xl w-full h-36 object-cover mb-2" />
                  )}
                  <h2 className="font-bold text-xl">
                    <TermText text={deck.title} />
                  </h2>
                  <p className="text-muted text-sm mt-1">
                    <TermText text={deck.description || ''} />
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-border">
                  <p className="text-sm font-semibold">{deck.cardCount} Karten</p>
                  <Link className="inline-block bg-accent text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity" href={`/karteikarten/${deck.id}`}>
                    Lernen starten
                  </Link>
                  {deck.id.startsWith('de-basis-') && (
                    <div className="flex flex-wrap gap-4 text-xs text-accent-ink underline">
                      <Link href={`/dokumente?dokument=${deck.id}-lesen`}>Lesen & Medien</Link>
                      <Link href={`/quiz/${deck.id}-quiz`}>Quiz lösen</Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p className="text-muted">Keine passenden Lernsets gefunden. Ändere die Suchbegriffe oder wähle „Alle Lehrjahre“.</p>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-4 text-sm pt-4">
        <Link className="underline text-accent-ink" href="/medien">
          Mit Lernkonto anmelden
        </Link>
        {!native && (
          <Link className="underline text-accent-ink" href="/verwaltung">
            Inhalte im Browser verwalten
          </Link>
        )}
      </div>
    </div>
  )
}
