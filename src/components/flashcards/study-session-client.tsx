'use client'
import {SourceLinks} from '@/components/source-links'
import { LanguageSwitch, LearningText, TermText } from '@/components/learning-language'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  RotateCw,
  Check,
  X,
  Lightbulb,
  Award,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react'
import { useLibrary } from '@/lib/use-library'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'


export function StudySessionClient({ deckId }: { deckId: string }) {
  const { decks, cards: flashcards } = useLibrary()
  const user = useAppStore(s => s.currentUser)
  const recordCard = useLearningStore(s => s.recordCard)
  const deck = decks.find((d) => d.id === deckId)
  const deckCards = flashcards.filter((c) => c.deckId === deckId)
  const cards = deckCards

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sessionResults, setSessionResults] = useState<{
    correct: number
    incorrect: number
    cardBoxes: Record<string, number>
  }>({
    correct: 0,
    incorrect: 0,
    cardBoxes: {},
  })
  const [isFinished, setIsFinished] = useState(false)

  const currentCard = cards[currentIndex]

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!currentCard || !isFlipped || isFinished) return
    if (user) recordCard(user.id, deckId, currentCard.id, isCorrect)
    setSessionResults((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      cardBoxes: {
        ...prev.cardBoxes,
        [currentCard.id]: isCorrect ? 2 : 1,
      },
    }))

    setIsFlipped(false)
    setShowHint(false)

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }, [currentCard, isFlipped, isFinished, currentIndex, cards.length, user, recordCard, deckId])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || (e.target instanceof HTMLElement && e.target.closest('button, input, textarea, select, a, [role=dialog], [contenteditable]'))) return
      if (isFinished) return
      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((prev) => !prev)
      } else if (e.code === 'Digit1' || e.code === 'KeyF') {
        handleAnswer(false)
      } else if (e.code === 'Digit2' || e.code === 'KeyR') {
        handleAnswer(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAnswer, isFinished])


  const restartSession = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowHint(false)
    setIsFinished(false)
    setSessionResults({ correct: 0, incorrect: 0, cardBoxes: {} })
  }

  if (!deck || !currentCard) return <div className="p-8 space-y-4"><h1 className="text-xl font-bold">{deck ? 'Noch keine Karten in diesem Lernset' : 'Lernset nicht gefunden'}</h1><Link className="text-accent-ink underline" href="/karteikarten">Zur Übersicht</Link></div>

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/karteikarten"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-bold text-foreground line-clamp-1">
            {deck.title}
          </h1>
          <span className="text-xs text-muted">
            Karte {currentIndex + 1} von {cards.length}
          </span>
        </div>

        <button
          onClick={restartSession}
          title="Neu starten"
          className="p-2 rounded-xl border border-border bg-surface text-muted hover:text-foreground transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Progress Bar ── */}
      <div className="w-full bg-border h-1.5 rounded-full overflow-hidden my-4">
        <div
          className="bg-accent h-full transition-all duration-300"
          style={{
            width: `${((currentIndex + (isFinished ? 1 : 0)) / cards.length) * 100}%`,
          }}
        />
      </div>

      {/* ── Main Card Area or Finish Screen ── */}
      <div className="flex-1 flex items-center justify-center my-6">
        {!isFinished ? (
          <div className="w-full max-w-2xl perspective-1000">
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="relative w-full min-h-[380px] rounded-3xl bg-surface border border-border shadow-xl p-8 flex flex-col justify-between cursor-pointer select-none"
              style={{ transformStyle: 'preserve-3d' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front Side */}
              <div
                className={cn(
                  'absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl',
                  isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary-ink uppercase tracking-wider">
                      Frage / Fall
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1 font-medium">
                      <RotateCw className="w-3.5 h-3.5" /> Zum Umdrehen klicken
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mt-4">
                    <TermText text={currentCard.front}/>
                  </h2>
                  {currentCard.imageUrl&&<img src={currentCard.imageUrl} alt="Abbildung zur Lernkarte" className="mt-4 max-h-72 mx-auto rounded-xl"/>}
                </div>

                {/* Hint */}
                <div>
                  {currentCard.hint && (
                    <div className="mt-4">
                      {showHint ? (
                        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent-ink font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 shrink-0" />
                          <span>Tipp: <TermText text={currentCard.hint}/></span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowHint(true)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent-ink transition-colors"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Hinweis anzeigen</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-between items-center text-xs text-muted pt-4 border-t border-border">
                    <span>Leitner Box 1 (Neu / Wiederholung)</span>
                    <span className="font-mono text-[11px] bg-background px-2 py-0.5 rounded border border-border">
                      Leertaste = Drehen
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Side (Answer) */}
              <div
                className={cn(
                  'absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl bg-surface-hover/30',
                  !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                )}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/15 text-success-ink uppercase tracking-wider">
                      Erklärung
                    </span>
                    <span className="text-xs text-muted">Antwort prüfen</span>
                  </div>

                  <LanguageSwitch />
                  <p className="text-lg leading-relaxed whitespace-pre-line mt-2 max-h-48 overflow-y-auto"><LearningText technical={currentCard.back} simple={'simpleExplanation' in currentCard ? currentCard.simpleExplanation : undefined} /></p>
                </div>

                {'source' in currentCard && currentCard.source && <SourceLinks source={String(currentCard.source)}/>}
                <div className="mt-6 text-xs text-muted pt-4 border-t border-border flex justify-between">
                  <span>Hast du es gewusst?</span>
                  <span className="font-mono text-[11px] bg-background px-2 py-0.5 rounded border border-border">
                    1 = Falsch &middot; 2 = Richtig
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Finished Summary Screen ── */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg p-8 rounded-3xl bg-surface border border-border shadow-2xl text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent-ink flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-foreground">
                Lernrunde abgeschlossen! 🎉
              </h2>
              <p className="text-sm text-muted mt-1">
                Klasse Einsatz! Dein Wissen für den Rettungsdienst festigt sich mit jeder Wiederholung.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-background border border-border">
              <div className="p-3">
                <span className="text-xs text-muted font-medium block">Gewusst</span>
                <span className="text-2xl font-black text-success-ink">
                  {sessionResults.correct}
                </span>
              </div>
              <div className="p-3">
                <span className="text-xs text-muted font-medium block">Wiederholen</span>
                <span className="text-2xl font-black text-secondary-ink">
                  {sessionResults.incorrect}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={restartSession}
                className="flex-1 py-3 px-4 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-semibold transition-all"
              >
                Nochmal üben
              </button>
              <Link
                href="/karteikarten"
                className="flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Zurück zu Lernsets</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      {!isFinished && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => handleAnswer(false)}
            disabled={!isFlipped}
            className="flex-1 max-w-xs py-3 px-6 rounded-2xl bg-secondary/10 hover:bg-secondary text-secondary-ink hover:text-white border border-secondary/20 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <X className="w-5 h-5" />
            <span>Wiederholen</span>
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-3 rounded-2xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-foreground transition-all"
            title="Karte umdrehen"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleAnswer(true)}
            disabled={!isFlipped}
            className="flex-1 max-w-xs py-3 px-6 rounded-2xl bg-success/15 hover:bg-success text-success-ink hover:text-white border border-success/30 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-5 h-5" />
            <span>Gewusst</span>
          </button>
        </div>
      )}
    </div>
  )
}
