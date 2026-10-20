'use client'

import { useState } from 'react'
import { categories } from '@/lib/db/mock-data'
import { useLibraryStore } from '@/stores/library-store'
import { useAppStore } from '@/stores/app-store'
import type { ContentKind, LibraryItem, Publication } from '@/lib/library-types'
import type { Question } from '@/types'

const field = 'block w-full rounded-xl border border-border bg-background p-3 mt-1 text-foreground'
const button = 'rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface-hover'

export function ContentEditor({ kind, item, onClose }: { kind: ContentKind; item?: LibraryItem; onClose: (saved?: boolean) => void }) {
  const library = useLibraryStore()
  const user = useAppStore(s => s.currentUser)
  const [title, setTitle] = useState(item && ('title' in item ? item.title : item.front) || '')
  const [description, setDescription] = useState(item && ('description' in item ? item.description : 'summary' in item ? item.summary : '') || '')
  const [categoryId, setCategoryId] = useState(item && 'categoryId' in item ? item.categoryId : categories[0].id)
  const [deckId, setDeckId] = useState(item && 'deckId' in item ? item.deckId : library.decks[0]?.id || '')
  const [back, setBack] = useState(item && 'back' in item ? item.back : '')
  const [simple, setSimple] = useState(item && 'simpleExplanation' in item ? item.simpleExplanation || '' : '')
  const [source, setSource] = useState(item?.source || '')
  const [publication, setPublication] = useState<Publication>(item?.publication || (item ? 'published' : 'draft'))
  const [minutes, setMinutes] = useState(item && 'timeLimit' in item ? (item.timeLimit || 0) / 60 : 0)
  const [passing, setPassing] = useState(item && 'passingScore' in item ? item.passingScore : 70)
  const [questions, setQuestions] = useState<Question[]>(item && 'questions' in item ? item.questions : [])
  const [sections, setSections] = useState<{ id: string; title: string; content: string; simpleContent?: string }[]>(item && 'sections' in item ? item.sections : [{ id: crypto.randomUUID(), title: '', content: '' }])
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)
  const updateQuestion = (id: string, patch: Partial<Question>) => setQuestions(rows => rows.map(q => q.id === id ? { ...q, ...patch } : q))
  function addQuestion() {
    const id = crypto.randomUUID()
    setQuestions([...questions, { id, quizId: item?.id || '', type: 'single_choice', text: '', explanation: '', points: 1, order: questions.length,
      answers: Array.from({ length: 4 }, (_, order) => ({ id: crypto.randomUUID(), questionId: id, text: '', isCorrect: order === 0, order })) }])
  }
  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Bitte einen Titel beziehungsweise eine Frage eingeben.')
    if (publication === 'published' && (!source.trim() || !checked)) return setError('Zur Veröffentlichung sind eine deutsche Quelle und die bestätigte fachliche Prüfung erforderlich.')
    if (kind === 'cards' && (!deckId || !back.trim() || !simple.trim())) return setError('Bitte Lernset und beide Erklärungen ergänzen.')
    if (kind === 'quizzes' && (!questions.length || questions.some(q => !q.text.trim() || q.answers.length < 2 || q.answers.some(a => !a.text.trim()) || !q.answers.some(a => a.isCorrect) || (q.type !== 'multiple_choice' && q.answers.filter(a => a.isCorrect).length !== 1)))) return setError('Jede Frage benötigt mindestens zwei ausgefüllte Antworten und eine passende richtige Auswahl.')
    if (kind === 'documents' && (!sections.length || sections.some(s => !s.title.trim() || !s.content.trim()))) return setError('Bitte Überschrift und Text für jeden Abschnitt ergänzen.')
    if (publication === 'published' && kind === 'quizzes' && questions.some(q => !q.simpleText?.trim() || !q.explanation?.trim() || !q.simpleExplanation?.trim())) return setError('Zum Veröffentlichen braucht jede Frage beide Fragefassungen und beide Begründungen.')
    if (publication === 'published' && kind === 'documents' && sections.some(s => !s.simpleContent?.trim())) return setError('Zum Veröffentlichen braucht jeder Abschnitt eine einfache Fassung.')
    const id = item?.id || crypto.randomUUID()
    const common = { id, source: source.trim(), publication, updatedAt: new Date() }
    const author = { authorId: item && 'authorId' in item ? item.authorId : user?.id || '1', createdAt: item && 'createdAt' in item ? item.createdAt : new Date() }
    const category = categories.find(c => c.id === categoryId)
    let result: LibraryItem
    if (kind === 'decks') result = { ...item, ...common, ...author, title: title.trim(), description, categoryId, category, isOfficial: true, cardCount: 0, difficulty: item && 'difficulty' in item ? item.difficulty : 'beginner', tags: item && 'tags' in item ? item.tags : [] }
    else if (kind === 'cards') result = { ...item, ...common, ...author, front: title.trim(), back, simpleExplanation: simple, deckId, categoryId: library.decks.find(d => d.id === deckId)?.categoryId || categoryId, difficulty: item && 'difficulty' in item ? item.difficulty : 'beginner', tags: item && 'tags' in item ? item.tags : [], status: 'approved' }
    else if (kind === 'quizzes') result = { ...item, ...common, ...author, title: title.trim(), description, categoryId, category, questions: questions.map((q, order) => ({ ...q, quizId: id, order })), passingScore: passing, timeLimit: minutes ? minutes * 60 : undefined, isExamSimulation: minutes > 0, difficulty: item && 'difficulty' in item ? item.difficulty : 'beginner' }
    else result = { ...common, title: title.trim(), summary: description, category: category?.name || 'Allgemein', pages: sections.length, date: new Date().toLocaleDateString('de-DE'), sections }
    try { library.save(kind, result); onClose(true) } catch (err) { setError(err instanceof Error ? err.message : 'Speichern nicht möglich.') }
  }
  return <form onSubmit={save} className="rounded-2xl border border-border bg-surface p-5 md:p-7 space-y-5">
    <div className="flex justify-between gap-4"><h2 className="text-xl font-bold">{item ? 'Inhalt bearbeiten' : 'Neuen Inhalt erstellen'}</h2><button type="button" className={button} onClick={() => onClose()}>Abbrechen</button></div>
    <p className="text-sm text-muted">Geltungsbereich: Deutschland · Sprache: Deutsch. Quellen mit Herausgeber, Stand und gegebenenfalls Bundesland oder örtlicher Vorgabe angeben.</p>
    {error && <p role="alert" className="text-secondary-ink">{error}</p>}
    <label className="block">{kind === 'cards' ? 'Frage' : 'Titel'}<input required className={field} value={title} onChange={e => setTitle(e.target.value)} /></label>
    {kind !== 'cards' && <label className="block">Beschreibung<textarea className={field} value={description} onChange={e => setDescription(e.target.value)} /></label>}
    <label className="block">{kind === 'cards' ? 'Lernset' : 'Fachbereich'}<select className={field} value={kind === 'cards' ? deckId : categoryId} onChange={e => kind === 'cards' ? setDeckId(e.target.value) : setCategoryId(e.target.value)}>{(kind === 'cards' ? library.decks.map(d => ({ id: d.id, name: d.title })) : categories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    {kind === 'cards' && <div className="grid md:grid-cols-2 gap-4"><label>Fachlich<textarea required rows={5} className={field} value={back} onChange={e => setBack(e.target.value)} /></label><label>Einfach erklärt<textarea required rows={5} className={field} value={simple} onChange={e => setSimple(e.target.value)} /></label></div>}
    {kind === 'quizzes' && <section className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4"><label>Zeitlimit in Minuten (0 = ohne)<input type="number" min={0} max={180} className={field} value={minutes} onChange={e => setMinutes(Number(e.target.value))} /></label><label>Bestehensgrenze in Prozent<input type="number" min={1} max={100} className={field} value={passing} onChange={e => setPassing(Number(e.target.value))} /></label></div>
      {questions.map((q, index) => <fieldset key={q.id} className="border border-border rounded-xl p-4 space-y-3"><legend className="px-2 font-bold">Frage {index + 1}</legend>
        <label className="block">Fragestellung<input required className={field} value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} /></label>
        <label className="block">Antworttyp<select className={field} value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value as Question['type'] })}><option value="single_choice">Eine richtige Antwort</option><option value="multiple_choice">Mehrere richtige Antworten</option><option value="true_false">Richtig / falsch</option></select></label>
        {q.answers.map((a, index) => <div key={a.id} className="flex items-center gap-3"><input aria-label={`Antwort ${index + 1} ist richtig`} type="checkbox" checked={a.isCorrect} onChange={e => updateQuestion(q.id, { answers: q.answers.map(row => row.id === a.id ? { ...row, isCorrect: e.target.checked } : q.type === 'multiple_choice' ? row : { ...row, isCorrect: false }) })} /><input aria-label={`Antwort ${index + 1}`} required className={field} value={a.text} onChange={e => updateQuestion(q.id, { answers: q.answers.map(row => row.id === a.id ? { ...row, text: e.target.value } : row) })} /></div>)}
        <label className="block">Frage · Einfach erklärt<textarea className={field} value={q.simpleText || ''} onChange={e => updateQuestion(q.id, { simpleText: e.target.value })} /></label><label className="block">Begründung · Einfach erklärt<textarea className={field} value={q.simpleExplanation || ''} onChange={e => updateQuestion(q.id, { simpleExplanation: e.target.value })} /></label><label className="block">Begründung · Fachsprache<textarea className={field} value={q.explanation || ''} onChange={e => updateQuestion(q.id, { explanation: e.target.value })} /></label><button type="button" className={button} onClick={() => setQuestions(questions.filter(row => row.id !== q.id))}>Frage entfernen</button>
      </fieldset>)}<button type="button" className={button} onClick={addQuestion}>Frage hinzufügen</button>
    </section>}
    {kind === 'documents' && <section className="space-y-4">{sections.map((s, index) => <fieldset key={s.id} className="border border-border rounded-xl p-4 space-y-3"><legend>Abschnitt {index + 1}</legend><label className="block">Überschrift<input required className={field} value={s.title} onChange={e => setSections(sections.map(row => row.id === s.id ? { ...row, title: e.target.value } : row))} /></label><label className="block">Inhalt · Fachsprache<textarea required rows={6} className={field} value={s.content} onChange={e => setSections(sections.map(row => row.id === s.id ? { ...row, content: e.target.value } : row))} /></label><label className="block">Inhalt · Einfach erklärt<textarea rows={6} className={field} value={s.simpleContent || ''} onChange={e => setSections(sections.map(row => row.id === s.id ? { ...row, simpleContent: e.target.value } : row))} /></label><button type="button" className={button} onClick={() => setSections(sections.filter(row => row.id !== s.id))}>Abschnitt entfernen</button></fieldset>)}<button type="button" className={button} onClick={() => setSections([...sections, { id: crypto.randomUUID(), title: '', content: '' }])}>Abschnitt hinzufügen</button></section>}
    <label className="block">Deutsche Quelle und Stand<textarea className={field} value={source} onChange={e => setSource(e.target.value)} placeholder="Herausgeber, Titel, Ausgabe / Datum, Link; örtlicher Geltungsbereich" /></label>
    <label className="block">Sichtbarkeit<select className={field} value={publication} onChange={e => setPublication(e.target.value as Publication)}><option value="draft">Entwurf – nur Verwaltung</option><option value="published">Veröffentlicht – in der lokalen Lernansicht</option><option value="archived">Archiviert</option></select></label>
    {publication === 'published' && <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={checked} onChange={e => setChecked(e.target.checked)} /><span>Ich habe Inhalt und Quellen auf fachliche Richtigkeit und Anwendbarkeit in Deutschland geprüft.</span></label>}
    <button className="rounded-xl bg-accent text-white px-6 py-3 font-semibold" type="submit">Inhalt speichern</button>
  </form>
}
