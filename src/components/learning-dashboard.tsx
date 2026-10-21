'use client'
import Link from 'next/link'
import { useNative } from '@/lib/use-native'
import { AnatomyThumbnail } from '@/components/anatomy-thumbnail'
import { BookOpen, Brain, HeartPulse, FileText, ArrowRight, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { useLibrary } from '@/lib/use-library'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { LearningTimeline } from '@/components/timeline/learning-timeline'

export default function LearningDashboard() {
  const native = useNative()
  const { decks, quizzes, documents, cards } = useLibrary()
  const user = useAppStore(s => s.currentUser)
  const selectedYear = useAppStore(s => s.selectedYear)
  const setSelectedYear = useAppStore(s => s.setSelectedYear)
  const learning = useLearningStore()
  const reviews = Object.values(learning.reviews).filter(r => r.userId === user?.id)
  const attempts = learning.attempts.filter(a => a.userId === user?.id)
  const today = new Date().toISOString()
  const due = reviews.filter(r => r.nextAt <= today && cards.some(c => c.id === r.cardId))
  const resume = decks.find(d => d.id === due[0]?.deckId) || decks.find(d => d.cardCount > 0)

  // Filter decks by selected year level if set, otherwise show all
  const displayedDecks = selectedYear === 'all'
    ? decks
    : decks.filter(d => d.yearLevel === selectedYear || (d.tags && d.tags.includes(`${selectedYear}. Lehrjahr`)))

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-7">
      {/* ── Welcome Banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-primary text-white p-6 md:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="text-sm text-white/80">Dein Lernbegleiter für den Rettungsdienst in Deutschland</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3">
            Hallo {user?.name.split(' ')[0] || 'du'},<br />was möchtest du heute verstehen?
          </h1>
          <p className="text-white/80 mt-4">
            Wissen aufbauen, Zusammenhänge entdecken und sicher wiederholen – in deinem Tempo.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={resume ? `/karteikarten/${resume.id}` : '/karteikarten'}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow-sm hover:opacity-95"
            >
              {due.length ? 'Wiederholen' : 'Lernen starten'}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/quiz?training=random"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-3 font-semibold text-white transition-colors"
            >
              <Sparkles size={18} />
              Zufalls-Prüfungstraining
            </Link>
          </div>
        </div>
        <HeartPulse className="absolute -right-12 top-10 w-72 h-72 text-white/10" strokeWidth={1} />
      </section>

      {/* ── Interactive Apprenticeship Timeline & Year Filter ── */}
      <LearningTimeline />

      {/* ── Progress Counter Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Karten geübt', reviews.length],
          ['Quiz abgeschlossen', attempts.length],
          ['Zur Wiederholung', due.length],
          ['Lernmaterialien', decks.length + quizzes.length + documents.length],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-border bg-surface p-5" key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-3xl font-bold mt-3">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Categories ── */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            href: '/anatomie',
            title: 'Anatomie entdecken',
            text: 'Strukturen anklicken, Animationen ansehen und Zuordnungen üben.',
            icon: HeartPulse,
          },
          {
            href: '/quiz',
            title: 'Wissen testen',
            text: 'Prüfungsfragen beantworten, Reihenfolgen variieren und aus den Begründungen lernen.',
            icon: Brain,
          },
          {
            href: '/dokumente',
            title: 'Unterlagen verstehen',
            text: 'Texte lesen, Stellen markieren und persönliche Notizen sammeln.',
            icon: FileText,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors"
          >
            <item.icon className="w-12 h-12 text-accent-ink mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            <h2 className="text-xl font-bold">{item.title}</h2>
            <p className="text-muted text-sm mt-2">{item.text}</p>
            <span className="inline-flex items-center gap-2 text-accent-ink mt-5 text-sm font-semibold">
              Öffnen
              <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>

      {/* ── Decks / Learning Sets Section ── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {selectedYear === 'all' ? 'Alle Lernsets' : `Lernsets für das ${selectedYear}. Lehrjahr`}
            </h2>
            <p className="text-xs text-muted">
              {selectedYear === 'all'
                ? 'Gesamtes Curriculum aller Ausbildungsjahre'
                : `Empfohlene Schwerpunkte für das ${selectedYear}. Ausbildungsjahr – andere Themen bleiben über die Suche frei zugänglich.`}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {selectedYear !== 'all' && (
              <button
                onClick={() => setSelectedYear('all')}
                className="text-xs text-accent-ink underline"
              >
                Alle Lehrjahre
              </button>
            )}
            <Link href="/karteikarten" className="text-accent-ink underline font-semibold text-sm">
              Alle ansehen
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(displayedDecks.length ? displayedDecks : decks).slice(0, 9).map((d) => (
            <Link
              href={`/karteikarten/${d.id}`}
              key={d.id}
              className="bg-surface rounded-2xl border border-border p-5 hover:border-accent transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {d.yearLevel && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent-ink">
                      {d.yearLevel}. Lehrjahr
                    </span>
                  )}
                  <span className="text-[11px] text-muted">{d.category?.name || 'Curriculum'}</span>
                </div>
                {d.id.startsWith('de-') ? (
                  <AnatomyThumbnail modelId={d.id.slice(3)} />
                ) : (
                  <BookOpen className="text-primary-ink mb-2" />
                )}
                <h3 className="font-bold text-base mt-2">{d.title}</h3>
                {d.description && <p className="text-xs text-muted mt-1 line-clamp-2">{d.description}</p>}
              </div>
              <p className="text-xs text-muted mt-4 pt-3 border-t border-border font-medium">
                {d.cardCount} Karten
              </p>
            </Link>
          ))}
        </div>

        {!decks.length && (
          <p className="text-muted">Noch keine veröffentlichten Lernsets. Im Verwaltungsportal kannst du Inhalte ergänzen.</p>
        )}
      </section>

      {/* ── Admin / Redaktion Link ── */}
      {!native && (
        <Link
          href="/verwaltung"
          className="flex items-center gap-3 rounded-2xl border border-border p-5 bg-surface hover:border-accent transition-colors"
        >
          <ShieldCheck className="text-accent-ink w-6 h-6 shrink-0" />
          <span>
            <strong>Inhalte & Klassen pflegen</strong>
            <span className="block text-sm text-muted">
              Verwaltungsportal für Lernsets, Klassen-Zeitlinien, Fragenreihenfolgen und Unterlagen
            </span>
          </span>
          <ArrowRight className="ml-auto" />
        </Link>
      )}
    </div>
  )
}
