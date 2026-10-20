'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, FileText, Layers, ShieldCheck, Plus, Search, Archive, Pencil, RotateCcw } from 'lucide-react'
import { useLibraryStore } from '@/stores/library-store'
import { useContentStore } from '@/stores/content-store'
import { useAppStore } from '@/stores/app-store'
import { ContentEditor } from './content-editor'
import Moderation from './moderation'
import type { ContentKind, LibraryItem } from '@/lib/library-types'

const tabs = [{ id: 'decks', label: 'Lernsets', icon: Layers }, { id: 'cards', label: 'Lernkarten', icon: BookOpen }, { id: 'quizzes', label: 'Wissensquiz', icon: ShieldCheck }, { id: 'documents', label: 'Unterlagen', icon: FileText }] as const
const labels = { draft: 'Entwurf', published: 'Veröffentlicht', archived: 'Archiviert' }
export default function AdminPortal() {
  const library = useLibraryStore()
  const { currentUser, setCurrentUser } = useAppStore()
  const pending = useContentStore(s => s.cards.filter(c => c.status === 'pending_review').length)
  const [tab, setTab] = useState<ContentKind | 'review'>('decks')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editor, setEditor] = useState<{ kind: ContentKind; item?: LibraryItem } | null>(null)
  const [notice, setNotice] = useState('')
  const canEdit = ['admin', 'developer'].includes(currentUser?.role || '')
  const canReview = canEdit || currentUser?.role === 'moderator'
  const rows = tab === 'review' ? [] : library[tab].filter(row => (filter === 'all' || (row.publication || 'published') === filter) && ('title' in row ? row.title : row.front).toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')))
  return <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
    <header className="rounded-2xl bg-primary p-6 md:p-8 text-white"><p className="text-sm text-white/80">MedLearn · Deutschland</p><h1 className="text-3xl font-bold mt-2">Verwaltungsportal</h1><p className="mt-3 max-w-2xl text-white/80">Lerninhalte pflegen, Beiträge prüfen und Wissen verständlich aufbereiten.</p></header>
    <div className="rounded-xl bg-surface border border-border p-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted max-w-3xl"><strong className="text-foreground">Lokaler Arbeitsstand.</strong> Änderungen bleiben in diesem Browser. Die Rollen dienen zum Ausprobieren; dieses Portal besitzt noch keine echte Anmeldung oder serverseitige Zugriffskontrolle.</p><label className="text-sm">Vorschaurolle<select aria-label="Vorschaurolle" className="block border border-border bg-background rounded-lg p-2 mt-1" value={currentUser?.role || 'user'} onChange={e => { if (currentUser) setCurrentUser({ ...currentUser, role: e.target.value as 'user' | 'admin' | 'moderator' }); setEditor(null) }}><option value="user">Lernende Person</option><option value="moderator">Moderation</option><option value="admin">Administration</option><option value="developer">Entwicklung</option></select></label></div>
    {!canReview ? <div className="rounded-2xl border border-border bg-surface p-8 space-y-3"><h2 className="text-xl font-bold">Inhalte verwalten</h2><p>Wähle für die lokale Erprobung oben „Administration“. Als lernende Person kannst du eigene Karten zur Prüfung einreichen.</p><Link href="/karteikarten?create=true" className="inline-block text-accent-ink underline">Eigene Karte erstellen</Link></div> : <>
      <nav className="flex flex-wrap gap-2" aria-label="Verwaltungsbereiche">{canEdit && tabs.map(t => <button key={t.id} aria-pressed={tab === t.id} onClick={() => { setTab(t.id); setEditor(null); setQuery(''); setNotice('') }} className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-border ${tab === t.id ? 'bg-primary text-white' : 'bg-surface'}`}><t.icon size={18} />{t.label}<span className="text-xs">{library[t.id].length}</span></button>)}<button aria-pressed={tab === 'review' || !canEdit} onClick={() => { setTab('review'); setEditor(null) }} className="rounded-xl border border-border bg-surface px-4 py-3">Einreichungen ({pending})</button></nav>
      {notice && <p role="status" className="rounded-xl bg-accent/10 text-accent-ink p-3">{notice}</p>}
      {tab === 'review' || !canEdit ? <Moderation /> : editor ? <ContentEditor key={editor.item?.id || editor.kind} {...editor} onClose={saved => { setEditor(null); setNotice(saved ? 'Inhalt gespeichert. Die lokale Bibliothek ist aktualisiert.' : 'Bearbeitung abgebrochen.') }} /> : <>
        <div className="flex flex-wrap gap-3"><label className="flex-1 min-w-48 relative"><Search className="absolute left-3 top-3 text-muted" size={18} /><input aria-label="Inhalte filtern" placeholder="Titel oder Frage suchen …" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl border border-border bg-surface p-3 pl-10" /></label><select aria-label="Veröffentlichungsstatus" className="rounded-xl border border-border bg-surface px-3" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Alle Zustände</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button onClick={() => setEditor({ kind: tab })} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-white"><Plus size={18} />Inhalt erstellen</button></div>
        <div className="space-y-3">{!rows.length && <p className="p-8 rounded-xl border border-border bg-surface">Keine passenden Inhalte. Ändere den Filter oder erstelle einen neuen Inhalt.</p>}{rows.map(row => <article key={row.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5"><div className="min-w-0"><p className="text-xs text-accent-ink mb-1">{labels[row.publication || 'published']} · {row.source ? 'Deutschland' : 'Deutschland-Bezug prüfen'}</p><h2 className="font-semibold break-words">{'title' in row ? row.title : row.front}</h2><p className="text-xs text-muted mt-1">{row.source ? 'Quelle hinterlegt' : 'Bestandsinhalt: deutsche Quelle und fachliche Prüfung ergänzen'}</p></div><div className="flex gap-2 shrink-0"><button onClick={() => setEditor({ kind: tab, item: row })} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"><Pencil size={16} />Bearbeiten</button><button onClick={() => { const archived = row.publication === 'archived'; library.setPublication(tab, row.id, archived ? 'draft' : 'archived'); setNotice(archived ? 'Als Entwurf wiederhergestellt. Zum Veröffentlichen bitte öffnen und prüfen.' : 'Archiviert. Der Inhalt ist aus der Lernansicht entfernt und kann wiederhergestellt werden.') }} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">{row.publication === 'archived' ? <RotateCcw size={16} /> : <Archive size={16} />}{row.publication === 'archived' ? 'Wiederherstellen' : 'Archivieren'}</button></div></article>)}</div>
        {!!library.changes.length && <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer font-semibold">Letzte Änderungen</summary><ul className="mt-3 space-y-2 text-sm text-muted">{library.changes.slice(0, 8).map(c => <li key={c.id}>{new Date(c.at).toLocaleString('de-DE')} · {c.action}: {c.title}</li>)}</ul></details>}
      </>}
    </>}
  </div>
}
