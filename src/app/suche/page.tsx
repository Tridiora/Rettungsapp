'use client'
import { useState } from 'react'
import Link from 'next/link'
import { anatomyModels as initialModels } from '@/lib/anatomy-data'
import { useEditorialStore } from '@/stores/editorial-store'
import { useSearchParams } from 'next/navigation'
import { useLibrary } from '@/lib/use-library'
import { useAppStore } from '@/stores/app-store'
import type { YearLevel } from '@/types'

export default function SearchPage() {
  const searchParam = useSearchParams().get('q')?.trim().toLocaleLowerCase('de') || ''
  const [query, setQuery] = useState(searchParam)
  const [yearFilter, setYearFilter] = useState<YearLevel>('all')

  const library = useLibrary()
  const records = useEditorialStore((s) => s.records)
  const anatomyModels =
    records === null
      ? []
      : records.filter((r) => r.kind === 'anatomy').map((r) => r.data as unknown as typeof initialModels[number])

  const entries = [
    ...library.decks.map((d) => ({
      title: d.title,
      text: d.description || '',
      type: 'Lernset',
      yearLevel: d.yearLevel,
      href: `/karteikarten/${d.id}`,
    })),
    ...library.cards.map((c) => ({
      title: c.front,
      text: c.back,
      type: 'Lernkarte',
      yearLevel: c.yearLevel,
      href: `/karteikarten/${c.deckId}`,
    })),
    ...library.quizzes.map((q) => ({
      title: q.title,
      text: q.description || '',
      type: 'Wissensquiz',
      yearLevel: q.yearLevel,
      href: `/quiz/${q.id}`,
    })),
    ...library.documents.map((d) => ({
      title: d.title,
      text: d.summary,
      type: 'Unterlage',
      yearLevel: d.yearLevel,
      href: `/dokumente?dokument=${d.id}`,
    })),
    ...anatomyModels.map((m) => ({
      title: `Anatomie: ${m.title}`,
      text: m.parts.map((p) => `${p.name} (${p.term})`).join(' · '),
      type: 'Interaktive Anatomie',
      yearLevel: undefined,
      href: `/anatomie?bereich=${m.id}`,
    })),
  ]

  const matches = entries.filter((e) => {
    const textMatch = !query || `${e.title} ${e.text}`.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))
    const yearMatch = yearFilter === 'all' || e.yearLevel === yearFilter || !e.yearLevel
    return textMatch && yearMatch
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {query ? `Suchergebnisse für „${query}“` : 'Alle Lerninhalte durchsuchen'}
        </h1>
        <p className="text-sm text-muted mt-1">
          Freier Zugriff auf alle Themengebiete – unabhängig vom Ausbildungsjahr.
        </p>
      </div>

      {/* ── Search Input ── */}
      <input
        aria-label="Inhalte durchsuchen"
        className="w-full border border-border bg-surface rounded-2xl p-4 text-base shadow-sm focus:border-accent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Beliebigen Fachbegriff, Diagnose, Medikament oder Maßnahme eingeben …"
      />

      {/* ── Optional Lehrjahr Filter ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted">Lehrjahr-Filter:</span>
        {(
          [
            ['all', 'Alle Lehrjahre'],
            [1, '1. Lehrjahr'],
            [2, '2. Lehrjahr'],
            [3, '3. Lehrjahr'],
          ] as const
        ).map(([val, label]) => (
          <button
            key={String(val)}
            onClick={() => setYearFilter(val as YearLevel)}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
              yearFilter === val
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'border-border bg-surface text-muted hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">
        {matches.length} Treffer in veröffentlichten Lerninhalten
      </p>

      {!matches.length && (
        <div className="p-8 text-center border border-dashed border-border rounded-2xl space-y-2">
          <p className="font-semibold">Keine Treffer gefunden.</p>
          <p className="text-xs text-muted">
            Versuche einen kürzeren Begriff, den lateinischen Fachbegriff oder setze den Lehrjahr-Filter zurück.
          </p>
          {yearFilter !== 'all' && (
            <button
              onClick={() => setYearFilter('all')}
              className="text-xs text-accent-ink underline font-bold"
            >
              In allen Lehrjahren suchen
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {matches.map((m, i) => (
          <Link
            key={`${m.href}-${i}`}
            href={m.href}
            className="block rounded-2xl border border-border bg-surface p-5 hover:border-accent transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-accent-ink">{m.type}</span>
              {m.yearLevel && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent-ink">
                  {m.yearLevel}. Lehrjahr
                </span>
              )}
            </div>
            <h2 className="font-bold text-lg text-foreground mt-1">{m.title}</h2>
            <p className="text-sm text-muted line-clamp-2 mt-1">{m.text}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
