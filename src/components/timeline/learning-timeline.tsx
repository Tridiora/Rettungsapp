'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/app-store'
import type { YearLevel, Milestone, ClassTimeline } from '@/types'
import { Calendar, Clock, Award, Compass, Settings, CheckCircle2, Circle, ArrowRight, BookOpen } from 'lucide-react'

export function LearningTimeline() {
  const { selectedYear, setSelectedYear, personalTimeline, setPersonalTimeline, currentUser } = useAppStore()
  const [showConfig, setShowConfig] = useState(false)

  const timeline = personalTimeline || {
    startDate: '2024-10-01',
    durationMonths: 36,
    examDate: '2027-08-15',
    milestones: [],
  }

  // Calculate current timeline progress
  const calculation = useMemo(() => {
    const start = new Date(timeline.startDate).getTime()
    const now = new Date().getTime()
    const durationMs = timeline.durationMonths * 30.4375 * 24 * 60 * 60 * 1000
    const end = start + durationMs

    const elapsedMs = Math.max(0, now - start)
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / durationMs) * 100)))

    // Current month in apprenticeship (1-indexed)
    const currentMonth = Math.min(timeline.durationMonths, Math.max(1, Math.ceil(elapsedMs / (30.4375 * 24 * 60 * 60 * 1000))))

    // Estimated current year level based on progress
    let calculatedYear: 1 | 2 | 3 = 1
    if (timeline.durationMonths <= 12) {
      calculatedYear = 1
    } else {
      const third = timeline.durationMonths / 3
      if (currentMonth <= third) calculatedYear = 1
      else if (currentMonth <= third * 2) calculatedYear = 2
      else calculatedYear = 3
    }

    // Days until exam
    let daysToExam: number | null = null
    if (timeline.examDate) {
      const exam = new Date(timeline.examDate).getTime()
      daysToExam = Math.max(0, Math.ceil((exam - now) / (1000 * 60 * 60 * 24)))
    }

    return { progressPercent, currentMonth, calculatedYear, daysToExam }
  }, [timeline])

  // Form state for config modal
  const [formData, setFormData] = useState<ClassTimeline>({
    startDate: timeline.startDate,
    durationMonths: timeline.durationMonths,
    examDate: timeline.examDate || '',
    milestones: timeline.milestones || [],
  })

  function saveConfig(e: React.FormEvent) {
    e.preventDefault()
    setPersonalTimeline(formData)
    setShowConfig(false)
  }

  const yearTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: '1. Ausbildungsjahr', subtitle: 'Basiskompetenzen, Anatomie & Erstversorgung' },
    2: { title: '2. Ausbildungsjahr', subtitle: 'Erweiterte Notfallmedizin, EKG & Traumatologie' },
    3: { title: '3. Ausbildungsjahr', subtitle: 'Invasive Maßnahmen (§ 2a), ALS & Staatsexamen' },
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-6 shadow-sm">
      {/* ── Header: Status & Quick Info ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-ink bg-accent/10 px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" />
            <span>Ausbildungs-Zeitlinie & Roter Faden</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {yearTitles[calculation.calculatedYear]?.title} · Monat {calculation.currentMonth} von {timeline.durationMonths}
          </h2>
          <p className="text-sm text-muted">
            {yearTitles[calculation.calculatedYear]?.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {calculation.daysToExam !== null && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-center">
              <span className="text-xs text-muted block">Staatsexamen</span>
              <strong className="text-lg font-black text-primary-ink">{calculation.daysToExam} Tage</strong>
            </div>
          )}
          <button
            onClick={() => setShowConfig(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-hover px-3.5 py-2.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
            title="Zeitplan und Ausbildungsdaten bearbeiten"
          >
            <Settings className="w-4 h-4" />
            <span>Zeitplan anpassen</span>
          </button>
        </div>
      </div>

      {/* ── Visual Timeline Bar ── */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-muted">
          <span>Ausbildungsstart ({new Date(timeline.startDate).toLocaleDateString('de-DE')})</span>
          <span className="font-semibold text-foreground">{calculation.progressPercent}% absolviert</span>
          <span>{timeline.examDate ? `Prüfung (${new Date(timeline.examDate).toLocaleDateString('de-DE')})` : 'Abschluss'}</span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-3 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-primary to-accent transition-all duration-500 rounded-full"
            style={{ width: `${calculation.progressPercent}%` }}
          />
        </div>

        {/* Year Segments Indicator */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] text-muted">
          <div className={`p-1.5 rounded-lg border ${calculation.calculatedYear === 1 ? 'border-accent bg-accent/10 font-bold text-accent-ink' : 'border-border'}`}>
            1. Lehrjahr (1.–12. Monat)
          </div>
          <div className={`p-1.5 rounded-lg border ${calculation.calculatedYear === 2 ? 'border-accent bg-accent/10 font-bold text-accent-ink' : 'border-border'}`}>
            2. Lehrjahr (13.–24. Monat)
          </div>
          <div className={`p-1.5 rounded-lg border ${calculation.calculatedYear === 3 ? 'border-accent bg-accent/10 font-bold text-accent-ink' : 'border-border'}`}>
            3. Lehrjahr (25.–36. Monat)
          </div>
        </div>
      </div>

      {/* ── Lehrjahr-Filter (Roter Faden ohne Beschränkungen) ── */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Themenschwerpunkt filtern:</span>
          {selectedYear !== 'all' && (
            <button
              onClick={() => setSelectedYear('all')}
              className="text-xs text-accent-ink underline font-medium"
            >
              Filter aufheben (Alle anzeigen)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              ['all', 'Alle Lehrjahre', 'Gesamtes Curriculum'],
              [1, '1. Lehrjahr', 'Grundlagen & Vitalzeichen'],
              [2, '2. Lehrjahr', 'Notfallmedizin & Trauma'],
              [3, '3. Lehrjahr', 'Invasive Maßnahmen & Examen'],
            ] as const
          ).map(([val, label, sub]) => {
            const active = selectedYear === val
            return (
              <button
                key={String(val)}
                onClick={() => setSelectedYear(val as YearLevel)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  active
                    ? 'border-accent bg-accent text-white shadow-sm'
                    : 'border-border bg-surface hover:bg-surface-hover text-foreground'
                }`}
              >
                <span className="block font-bold text-sm">{label}</span>
                <span className={`block text-[11px] mt-0.5 ${active ? 'text-white/80' : 'text-muted'}`}>{sub}</span>
              </button>
            )
          })}
        </div>

        <p className="text-[12px] text-muted italic pt-1">
          💡 <strong>Hinweis zur Orientierung:</strong> Das Lehrjahr dient als roter Faden. Du kannst jederzeit jedes Thema suchen, öffnen und üben – ohne jede Beschränkung.
        </p>
      </div>

      {/* ── Milestones List ── */}
      {timeline.milestones && timeline.milestones.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Ausbildungsabschnitte & Meilensteine</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeline.milestones.map((m) => {
              const isPast = new Date(m.date).getTime() < new Date().getTime()
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
                    isPast
                      ? 'border-border bg-surface-hover/50 text-muted'
                      : 'border-accent/40 bg-accent/5 text-foreground'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <strong className="block font-semibold">{m.title}</strong>
                    <span className="block text-muted">{new Date(m.date).toLocaleDateString('de-DE')}</span>
                    {m.description && <p className="text-[11px] text-muted leading-tight">{m.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Configuration Modal ── */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={saveConfig}
            className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-xl font-bold">Ausbildungszeitplan anpassen</h3>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Lege den Beginn, die Gesamtlaufzeit und deinen voraussichtlichen Prüfungstermin fest, um deine persönliche Zeitlinie in der App zu steuern.
            </p>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Startdatum der Ausbildung / des Studiums
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </label>

              <label className="block text-sm font-semibold">
                Ausbildungsdauer / Regellaufzeit (in Monaten)
                <select
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                >
                  <option value={36}>36 Monate (Reguläre Notfallsanitäter-Ausbildung)</option>
                  <option value={24}>24 Monate (Verkürzte Ausbildung / Weiterbildung)</option>
                  <option value={12}>12 Monate (1-jährige Ergänzungsprüfung / Rettungssanitäter)</option>
                  <option value={6}>6 Monate (Kompaktlehrgang)</option>
                </select>
              </label>

              <label className="block text-sm font-semibold">
                Voraussichtlicher Termin des Staatsexamens / Abschluss
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
