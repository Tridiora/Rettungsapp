'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useContentStore } from '@/stores/content-store'
import { decks } from '@/lib/db/mock-data'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'

interface ModerationSubmission {
  id: string
  title: string
  question: string
  answer: string
  category: string
  authorName: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string
}


export default function VerwaltungPage() {
  const { currentUser, setCurrentUser } = useAppStore()
  const { cards, review } = useContentStore()
  const canReview = !!currentUser && ['moderator', 'admin', 'developer'].includes(currentUser.role)
  const submissions: ModerationSubmission[] = cards.map(c => ({ id: c.id, title: c.front, question: c.front, answer: c.back + '\n\nEinfach erklärt: ' + c.simpleExplanation + '\n\nQuelle: ' + c.source, category: decks.find(d => d.id === c.deckId)?.title || '', authorName: c.authorId, submittedAt: new Date(c.createdAt).toLocaleDateString('de-DE'), status: c.status === 'approved' ? 'approved' : c.status === 'rejected' ? 'rejected' : 'pending', feedback: c.feedback }))
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    if (!canReview) return
    if (action === 'rejected' && !feedbackText[id]?.trim()) return
    review(id, action, feedbackText[id]?.trim() || '')
  }

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return
    setCurrentUser({
      ...currentUser,
      role,
    })
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'all') return true
    return s.status === filter
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-ink text-sm font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Qualitätssicherung & Rollenverwaltung</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Moderation & Inhalts-Freigabe
          </h1>
          <p className="text-sm text-muted">
            Lokale Vorschau: Prüfung und Freigabe gelten nur in diesem Browser. Echte Konten und serverseitige Rollen sind noch nicht eingerichtet.
          </p>
        </div>

        {/* Role Switcher Demo Control */}
        <div className="p-2 rounded-2xl bg-surface border border-border flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted pl-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Rolle simulieren:
          </span>
          {(['user', 'moderator', 'admin', 'developer'] as UserRole[]).map((r) => (
            <button
              key={{ user: 'Lernende Person', moderator: 'Moderation', admin: 'Administration', developer: 'Entwicklung' }[r]}
              onClick={() => handleRoleChange(r)}
              className={cn(
                'px-3 py-1.5 rounded-xl capitalize font-bold transition-all',
                currentUser?.role === r
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submissions Review Queue ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                filter === 'pending'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              )}
            >
              Ausstehend ({submissions.filter((s) => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                filter === 'approved'
                  ? 'bg-success text-white'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              )}
            >
              Freigegeben ({submissions.filter((s) => s.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              )}
            >
              Alle Einträge
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {!canReview ? <p>Die Prüfung ist der Moderation vorbehalten. Zum Testen kannst du oben die Rolle wechseln.</p> : filteredSubmissions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-sm">
              Keine Einträge in dieser Kategorie vorhanden.
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-ink">
                      {sub.category}
                    </span>
                    <h3 className="font-bold text-base text-foreground">
                      {sub.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Eingereicht von <strong>{sub.authorName}</strong></span>
                    <span>&middot;</span>
                    <span>{sub.submittedAt}</span>
                  </div>
                </div>

                {/* Card Content Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                    <span className="text-[11px] font-bold text-primary-ink uppercase">
                      Vorderseite (Frage):
                    </span>
                    <p className="text-xs text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                      {sub.question}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                    <span className="text-[11px] font-bold text-success-ink uppercase">
                      Rückseite (Antwort):
                    </span>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {sub.answer}
                    </p>
                  </div>
                </div>

                {sub.feedback && <p className="text-sm">Rückmeldung: {sub.feedback}</p>}
                {sub.status === 'pending' && <label className="block text-sm">Rückmeldung (bei Ablehnung erforderlich)<textarea value={feedbackText[sub.id] || ''} onChange={e => setFeedbackText({ ...feedbackText, [sub.id]: e.target.value })} className="block w-full rounded-xl border border-border bg-background p-3 mt-2" /></label>}
                {/* Action Controls for Moderator/Admin */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {sub.status === 'approved' && (
                      <span className="text-xs font-bold text-success-ink flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Für alle Benutzer freigeschaltet
                      </span>
                    )}
                    {sub.status === 'rejected' && (
                      <span className="text-xs font-bold text-secondary-ink flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Abgelehnt
                      </span>
                    )}
                    {sub.status === 'pending' && (
                      <span className="text-xs font-medium text-warning-ink flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Wartet auf medizinische Prüfung
                      </span>
                    )}
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        disabled={!feedbackText[sub.id]?.trim()} onClick={() => handleAction(sub.id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary text-secondary-ink hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Ablehnen</span>
                      </button>

                      <button
                        onClick={() => handleAction(sub.id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Freigeben & Veröffentlichen</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
