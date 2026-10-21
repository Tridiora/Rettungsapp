'use client'
import { LessonMedia } from '@/components/lesson-media'
import { SourceLinks } from '@/components/source-links'
import { LanguageSwitch, TermText } from '@/components/learning-language'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Highlighter,
  Bookmark,
  MessageSquare,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSearchParams } from 'next/navigation'
import { useLibrary } from '@/lib/use-library'
import { cn } from '@/lib/utils'

interface DocumentItem {
  id: string
  title: string
  category: string
  pages: number
  date: string
  summary: string
  sections: {
    id: string
    title: string
    content: string
    simpleContent?: string
  }[]
}

interface UserHighlight {
  id: string
  docId: string
  sectionId: string
  text: string
  color: string
  note?: string
  language?: 'technical' | 'simple'
  createdAt: string
}

export default function DokumentePage() {
  const { documents: officialDocuments } = useLibrary()
  const { currentUser, learningLanguage, selectedYear, setSelectedYear } = useAppStore()
  const params = useSearchParams()
  const [selectedId, setSelectedId] = useState(params.get('dokument') || '')
  const selectedDocument = officialDocuments.find(d => d.id === selectedId) || officialDocuments[0]
  const selectedDoc = selectedDocument ? {...selectedDocument,sections:selectedDocument.sections.filter(s=>selectedYear==='all'||(s.yearLevel||1)===selectedYear)} : undefined
  const [searchQuery, setSearchQuery] = useState('')
  const [activeColor, setActiveColor] = useState<string>('#fef08a') // light yellow highlight
  const [userHighlights, setUserHighlights] = useState<UserHighlight[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [annotationNote, setAnnotationNote] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])

  // Local storage scoping for private user annotations
  const storageKey = `medlearn_doc_highlights_${currentUser?.id || 'anon'}_${selectedDoc?.id}`
  const bookmarkKey = `medlearn_bookmarks_${currentUser?.id || 'anon'}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      // Restore the external browser store when the document or profile changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setUserHighlights(JSON.parse(saved))
      else setUserHighlights([])

      const savedBms = localStorage.getItem(bookmarkKey)
      if (savedBms) setBookmarks(JSON.parse(savedBms))
      else setBookmarks([])
    } catch (e) {
      console.error(e)
    }
  }, [storageKey, bookmarkKey])

  const saveHighlights = (newHighlights: UserHighlight[]) => {
    setUserHighlights(newHighlights)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newHighlights))
    } catch (e) {
      console.error(e)
    }
  }

  const toggleBookmark = (sectionId: string) => {
    const next = bookmarks.includes(sectionId)
      ? bookmarks.filter((b) => b !== sectionId)
      : [...bookmarks, sectionId]
    setBookmarks(next)
    try {
      localStorage.setItem(bookmarkKey, JSON.stringify(next))
    } catch (e) {
      console.error(e)
    }
  }

  // Handle text selection in document
  const handleMouseUp = (sectionId: string) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()
    if (text.length > 3) {
      setSelectedText(text)
      setSelectedSectionId(sectionId)
    }
  }

  const applyHighlight = (withNote = false) => {
    if (!selectedDoc || !selectedText || !selectedSectionId) return

    if (withNote) {
      setShowNoteModal(true)
      return
    }

    const newHl: UserHighlight = {
      id: 'hl_' + Date.now(),
      docId: selectedDoc.id,
      sectionId: selectedSectionId,
      text: selectedText,
      color: activeColor,
      language: learningLanguage,
      createdAt: new Date().toLocaleTimeString(),
    }

    saveHighlights([...userHighlights, newHl])
    setSelectedText('')
  }

  const confirmSaveNote = () => {
    if (!selectedDoc || !selectedText || !selectedSectionId) return
    const newHl: UserHighlight = {
      id: 'hl_' + Date.now(),
      docId: selectedDoc.id,
      sectionId: selectedSectionId,
      text: selectedText,
      color: activeColor,
      note: annotationNote,
      language: learningLanguage,
      createdAt: new Date().toLocaleTimeString(),
    }

    saveHighlights([...userHighlights, newHl])
    setShowNoteModal(false)
    setAnnotationNote('')
    setSelectedText('')
  }

  const removeHighlight = (id: string) => {
    saveHighlights(userHighlights.filter((h) => h.id !== id))
  }

  if (!selectedDoc) return <div className="p-8">Noch keine veröffentlichten Unterlagen. Inhalte können im Verwaltungsportal ergänzt werden.</div>
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-ink text-sm font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>Lernunterlagen für Deutschland</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Lernunterlagen & persönliche Notizen
          </h1>
          <p className="text-sm text-muted">
            Markiere Textstellen bunt, füge Randnotizen hinzu und verwalte persönliche Lesezeichen (nur für dich sichtbar).
          </p>
        </div>

        {/* Document Switcher */}
        <div className="flex flex-wrap bg-surface border border-border p-1 rounded-2xl">
          {officialDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => { setSelectedId(doc.id); setSelectedText(''); setSelectedSectionId(''); setShowNoteModal(false) }}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                selectedDoc?.id === doc.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {doc.title.split('–')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Lernkapitel nach Lehrjahr filtern">{(['all',1,2,3] as const).map(year=><button key={year} aria-pressed={selectedYear===year} onClick={()=>setSelectedYear(year)} className="px-4 py-2 border border-border rounded-xl">{year==='all'?'Alle Lehrjahre':`${year}. Lehrjahr`}</button>)}<span className="p-2 text-sm text-muted">{selectedDoc.sections.length} Abschnitte</span></div>
      {selectedDoc.sections.length===0&&<p>In diesem Dokument gibt es noch keine Abschnitte für das gewählte Lehrjahr.</p>}
      {/* ── Document Reader Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Document Content & Interactive Highlighter */}
        <div className="lg:col-span-3 rounded-3xl bg-surface border border-border shadow-md overflow-hidden flex flex-col">
          {/* Document Header & Mini-Editor Toolbar */}
          <div className="p-4 border-b border-border bg-background/50 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
            <div>
              <span className="text-[11px] font-bold text-accent-ink px-2.5 py-0.5 rounded-full bg-accent/10">
                {selectedDoc.category}
              </span>
              <h2 className="text-base font-bold text-foreground mt-1">
                {selectedDoc.title}
              </h2>
            </div>

            {/* Highlighter Color Picker & Tools */}
            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border">
              <span className="text-xs text-muted font-medium pl-1 flex items-center gap-1">
                <Highlighter className="w-3.5 h-3.5 text-accent-ink" /> Marker:
              </span>
              {[
                { color: '#fef08a', name: 'Gelb' },
                { color: '#bbf7d0', name: 'Grün' },
                { color: '#bfdbfe', name: 'Blau' },
                { color: '#fbcfe8', name: 'Pink' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setActiveColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={cn(
                    'w-5 h-5 rounded-full border border-black/20 transition-transform',
                    activeColor === c.color && 'ring-2 ring-primary scale-125'
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Quick Selection Action Bar (appears when text is selected) */}
          <AnimatePresence>
            {selectedText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-accent/15 border-b border-accent/30 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground"
              >
                <div className="flex items-center gap-2 overflow-hidden mr-4">
                  <span className="text-accent-ink font-bold">Ausgewählt:</span>
                  <span className="italic truncate text-muted">
                    „{selectedText}“
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => applyHighlight(false)}
                    className="px-3 py-1 rounded-lg bg-accent text-white font-bold shadow-sm hover:bg-accent-light transition-colors"
                  >
                    Markieren
                  </button>
                  <button
                    onClick={() => applyHighlight(true)}
                    className="px-3 py-1 rounded-lg bg-surface border border-border text-foreground hover:bg-surface-hover transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>+ Notiz</span>
                  </button>
                  <button
                    onClick={() => setSelectedText('')}
                    className="p-1 rounded-lg text-muted hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 pt-5"><LanguageSwitch onChange={() => { setSelectedText(''); setSelectedSectionId(''); setShowNoteModal(false) }} /></div>
          {/* Document Content Flow */}
          <div className="p-6 md:p-8 space-y-8 select-text">
            <p className="text-sm text-muted">{selectedDoc.summary}</p>
            <LessonMedia key={selectedDoc.id} document={selectedDoc}/>
            {selectedDoc.sections.map((section) => {
              const visibleText = learningLanguage === 'simple' ? section.simpleContent || 'Für diesen Abschnitt fehlt noch die einfache Fassung. Bitte wechsle zur Fachsprache.' : section.content
              const isBookmarked = bookmarks.includes(section.id)

              return (
                <div
                  key={section.id}
                  onMouseUp={() => handleMouseUp(section.id)}
                  className="space-y-3 p-5 rounded-2xl bg-background border border-border hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-foreground">
                      {section.title}
                    </h3>
                    <button
                      onClick={() => toggleBookmark(section.id)}
                      className={cn(
                        'p-1.5 rounded-xl border transition-colors',
                        isBookmarked
                          ? 'border-amber-500 bg-amber-500/10 text-warning-ink'
                          : 'border-border text-muted hover:text-foreground'
                      )}
                      title={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <SourceLinks source={section.sources}/>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-serif">
                    {(() => {
                      const matches = userHighlights.filter(h => (h.language || 'technical') === learningLanguage && h.sectionId === section.id && visibleText.includes(h.text)).map(h => ({ ...h, start: visibleText.indexOf(h.text) })).sort((a,b) => a.start - b.start)
                      const chunks: React.ReactNode[] = []; let offset = 0
                      for (const h of matches) { if (h.start < offset) continue; chunks.push(<TermText key={`text-${offset}`} text={visibleText.slice(offset, h.start)} />); chunks.push(<mark key={h.id} style={{ backgroundColor: h.color, color: '#172b40' }} title={h.note}>{h.text}</mark>); offset = h.start + h.text.length }
                      chunks.push(<TermText key={`text-${offset}`} text={visibleText.slice(offset)} />); return chunks
                    })()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 1 Col: User Annotations & Bookmarks */}
        <div className="space-y-6">
          {/* Instructions Box */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Highlighter className="w-4 h-4 text-accent-ink" />
              <span>Markierungs-Anleitung</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Markiere beliebigen Text im Dokument mit der Maus oder dem Finger. Klicke auf <strong>Markieren</strong> oder füge eine persönliche Randnotiz hinzu.
            </p>
            <div className="pt-2 text-[11px] text-accent-ink font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Automatisch lokal gespeichert</span>
            </div>
          </div>

          {/* User's Highlights List */}
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-foreground">
                Meine Notizen & Zitate ({userHighlights.length})
              </h4>
              <span className="text-[10px] text-muted">Privat</span>
            </div>

            {userHighlights.length === 0 ? (
              <p className="text-xs text-muted">
                Noch keine Textstellen markiert.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {userHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3 rounded-xl bg-background border border-border space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="px-2 py-0.5 rounded text-[11px] font-medium text-black line-clamp-2"
                        style={{ backgroundColor: hl.color }}
                      >
                        „{hl.text}“
                      </div>
                      <button
                        onClick={() => removeHighlight(hl.id)}
                        className="text-muted hover:text-secondary-ink p-0.5"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {hl.note && (
                      <div className="p-2 rounded-lg bg-surface border border-border text-[11px] text-foreground font-sans">
                        <strong className="text-accent-ink">Notiz: </strong>
                        {hl.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Note Creation Modal ── */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent-ink" />
                  <span>Notiz an Textstelle anheften</span>
                </h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="p-2.5 rounded-xl text-xs text-black italic"
                style={{ backgroundColor: activeColor }}
              >
                „{selectedText}“
              </div>

              <textarea
                rows={3}
                placeholder="Deine persönliche Notiz / Merksatz zur Prüfung..."
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted hover:text-foreground"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmSaveNote}
                  className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold shadow-md hover:bg-accent-light"
                >
                  Notiz speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
