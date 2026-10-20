'use client'
import { LanguageSwitch, LearningText, TermText } from '@/components/learning-language'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Search, LayoutGrid, ZoomIn, ZoomOut, Maximize, Play, Pause, Eye, GraduationCap, Bookmark, ArrowRight } from 'lucide-react'
import { AnatomyThumbnail } from '@/components/anatomy-thumbnail'
import { AnatomyMedia, hasAnatomyMedia } from '@/components/anatomy-media'
import { useSearchParams } from 'next/navigation'
import { anatomyModels as initialModels } from '@/lib/anatomy-data'
import { useEditorialStore } from '@/stores/editorial-store'
import { useAppStore } from '@/stores/app-store'

const action = 'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover'
export default function AnatomyExplorer() {
  const params = useSearchParams()
  const requested = params.get('bereich') || ''
  const part = params.get('struktur') || ''
  return <Explorer key={requested + part} initialModel={requested} initialPart={part} />
}
function Explorer({ initialModel, initialPart }: { initialModel: string; initialPart: string }) {
  const records=useEditorialStore(s=>s.records)
  const anatomyModels=records===null?initialModels:records.filter(r=>r.kind==='anatomy').map(r=>r.data as unknown as typeof initialModels[number])
  const [modelId, setModelId] = useState(initialModel || 'heart')
  const [showCatalog, setShowCatalog] = useState(!initialModel)
  const [search, setSearch] = useState('')
  const model = anatomyModels.find(m => m.id === modelId)||initialModels.find(m=>m.id===modelId)||initialModels[0]
  const [selectedId, setSelectedId] = useState(model.parts.some(p => p.id === initialPart) ? initialPart : model.parts[0].id)
  const [labels, setLabels] = useState(true)
  const [detail, setDetail] = useState(true)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useReducedMotion()
  const [quiz, setQuiz] = useState(false)
  const [question, setQuestion] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [completed, setCompleted] = useState(false)
  const user = useAppStore(s => s.currentUser)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [noteStatus, setNoteStatus] = useState('')
  const selected = model.parts.find(p => p.id === selectedId) || model.parts[0]
  const target = model.parts[question] || model.parts[0]
  const query = search.trim().toLocaleLowerCase('de')
  const matches = (text: string) => text.toLocaleLowerCase('de').includes(query)
  const filteredModels = anatomyModels.filter(m => matches(m.title + ' ' + m.subtitle) || m.parts.some(p => matches(p.name + ' ' + p.term)))
  useEffect(() => {
    if (!playing || reducedMotion) return
    const timer = window.setInterval(() => setSelectedId(id => model.parts[(model.parts.findIndex(p => p.id === id) + 1) % model.parts.length].id), 2800)
    return () => window.clearInterval(timer)
  }, [playing, reducedMotion, model])
  function openModel(id: string) {
    setDetail(true)
    const next = anatomyModels.find(m => m.id === id)!
    const match = query ? next.parts.find(p => matches(p.name + ' ' + p.term)) : undefined
    setModelId(id); setSelectedId(match?.id || next.parts[0].id); setQuiz(false); setQuestion(0); setAnswered(false); setCompleted(false); setScore(0); setFeedback(''); setPlaying(false); setDraft(''); setNoteStatus(''); setNotes({}); setShowCatalog(false)
  }
  const noteKey = (id: string) => `medlearn-anatomy-text:${user?.id}:${modelId}:${id}`
  useEffect(() => {
    // Synchronize the selected structure with its external, profile-scoped note.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setDraft(localStorage.getItem(`medlearn-anatomy-text:${user?.id}:${modelId}:${selectedId}`) || '') } catch { setDraft('') }
  }, [user?.id, modelId, selectedId])
  function select(id: string) {
    if (quiz) {
      if (answered || completed) return
      const correct = id === target.id
      setAnswered(true); setScore(s => s + Number(correct)); setSelectedId(target.id)
      setFeedback(correct ? 'Richtig zugeordnet!' : `Noch nicht richtig. Markiert ist: ${target.name}.`)
      return
    }
    setSelectedId(id); setNoteStatus('')
    try { setDraft(localStorage.getItem(noteKey(id)) || '') } catch { setDraft(''); setNoteStatus('Lokale Notizen sind in diesem Browser nicht verfügbar.') }
  }
  function startQuiz() { setDetail(false); setQuiz(true); setQuestion(0); setAnswered(false); setCompleted(false); setScore(0); setFeedback(''); setPlaying(false) }
  function saveNote() {
    try { localStorage.setItem(noteKey(selected.id), draft); setNotes({ ...notes, [selected.id]: draft }); setNoteStatus('Private Notiz gespeichert.') } catch { setNoteStatus('Die Notiz konnte nicht gespeichert werden. Bitte den Browserspeicher prüfen.') }
  }
  if(records!==null&&!anatomyModels.some(m=>m.id===modelId))return <div className="p-8 space-y-4"><h1 className="text-2xl font-bold">Dieser Bereich ist nicht veröffentlicht oder für dein Konto nicht verfügbar.</h1>{anatomyModels.map(m=><button key={m.id} className={action} onClick={()=>openModel(m.id)}>{m.title}</button>)}</div>
  return <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-accent-ink text-sm font-semibold">Anatomie verstehen · Deutschsprachige Grundlagen</p><h1 className="text-3xl md:text-4xl font-bold mt-2">Entdecken. Verstehen. Wiedererkennen.</h1><p className="text-muted mt-3">Wähle eine Struktur in der Grafik. Zoome hinein und teste anschließend dein Wissen.</p></div><span className="border border-border rounded-full px-3 py-1 text-sm">Deutschland · Lernansicht</span></header>
    <section className="rounded-2xl border border-border bg-surface p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-xl">{showCatalog ? 'Dein Anatomieatlas' : model.title}</h2><p className="text-sm text-muted">{anatomyModels.length} Lernbereiche · {anatomyModels.reduce((n,m) => n + m.parts.length, 0)} auswählbare Strukturen · Grundlagen</p></div><button className={action} aria-expanded={showCatalog} aria-controls="anatomy-catalog" onClick={() => { setShowCatalog(!showCatalog); setPlaying(false) }}><LayoutGrid size={18} />{showCatalog ? 'Zur aktuellen Ansicht' : 'Bereich wechseln'}</button></div>
      {showCatalog && <div id="anatomy-catalog" className="space-y-4"><label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"><Search size={20} /><input aria-label="Körpersystem oder Struktur suchen" className="min-w-0 w-full bg-transparent outline-none" value={search} onChange={e => setSearch(e.target.value)} placeholder="Bereich, Organ oder Fachwort suchen …" /></label><p role="status" className="text-sm text-muted">{filteredModels.length} Bereiche gefunden</p><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{filteredModels.map(m => <button key={m.id} onClick={() => openModel(m.id)} className="group rounded-2xl border border-border p-3 text-left hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"><AnatomyThumbnail modelId={m.id} /><strong className="block mt-3">{m.title}</strong><span className="block text-xs text-muted mt-1">{m.subtitle}</span><span className="block text-xs text-accent-ink mt-2">{m.parts.length} Strukturen · Erkunden →</span></button>)}</div>{!filteredModels.length && <p>Kein passender Bereich. Versuche zum Beispiel „Niere“, „Gehirn“ oder „Haut“.</p>}</div>}
    </section>
    {!showCatalog && <>
    <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-6">
      <div className="space-y-4">
        {hasAnatomyMedia(modelId) && <div className="flex flex-wrap gap-2"><button className={action} aria-pressed={detail} onClick={() => {setDetail(true);setQuiz(false);setPlaying(false)}}>{modelId === 'heart' ? 'Erklärfilm' : 'Anatomische Tafel'}</button><button className={action} aria-pressed={!detail} onClick={() => setDetail(false)}>Strukturen im Übungsschema</button></div>}
        {detail && hasAnatomyMedia(modelId) ? <AnatomyMedia key={modelId} modelId={modelId} onSelect={select}/> : <section className="rounded-3xl border border-border bg-surface overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-border"><button className={action} aria-pressed={labels} disabled={quiz} onClick={() => setLabels(!labels)}><Eye size={17} />{labels ? 'Beschriftung ausblenden' : 'Beschriftung anzeigen'}</button><button className={action} aria-pressed={playing} disabled={quiz || !!reducedMotion} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={17} /> : <Play size={17} />}{playing ? 'Anhalten' : 'Strukturen-Rundgang'}</button><button className={action} onClick={quiz ? () => { setQuiz(false); setFeedback('') } : startQuiz}><GraduationCap size={17} />{quiz ? 'Erkunden' : 'Wissen testen'}</button></div>
        <TransformWrapper key={modelId} minScale={0.8} maxScale={4} initialScale={1} doubleClick={{ disabled: true }}>
          {({ zoomIn, zoomOut, resetTransform }) => <>
            <div className="relative bg-[#101e30] overflow-hidden">
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%' }}>
                <svg viewBox="0 0 500 540" className="w-full max-h-[570px]" role="group" aria-label={`Interaktive Anatomie: ${model.title}`}>
                  <defs><pattern id="anatomy-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#26384e" strokeWidth=".6" /></pattern><radialGradient id="anatomy-glow"><stop stopColor="#244b69" /><stop offset="1" stopColor="#101e30" /></radialGradient></defs>
                  <rect width="500" height="540" fill="url(#anatomy-glow)" /><rect width="500" height="540" fill="url(#anatomy-grid)" opacity=".5" />
                  <text x="25" y="33" fill="#b4c8dd" fontSize="11">SCHEMATISCHE LERNABBILDUNG</text>
                  {['heart', 'lungs'].includes(modelId) && <><text x="55" y="65" fill="#b4c8dd" fontSize="12">rechte Körperseite</text><text x="315" y="65" fill="#b4c8dd" fontSize="12">linke Körperseite</text></>}
                  {model.view && <text x="250" y="52" textAnchor="middle" fill="#b4c8dd" fontSize="10">{model.view}</text>}
                  {model.bodyOutline && <path d="M215 110C175 40 325 40 285 110L280 140L330 165L365 290L340 300L310 215L315 350L300 485H270L250 375L230 485H200L185 350L190 215L160 300L135 290L170 165L220 140Z" fill="#1c3147" stroke="#577087" strokeWidth="2" pointerEvents="none" />}
                  {modelId === 'eye' && <ellipse cx="265" cy="275" rx="160" ry="155" fill="none" stroke="#577087" strokeWidth="2" pointerEvents="none" />}
                  {modelId === 'heart' && <><path d="M165 145V95 M305 140V90 Q305 65 350 75 V115" fill="none" stroke="#647c96" strokeWidth="24" strokeLinecap="round" /><path d="M245 130V420" stroke="#52667e" strokeWidth="6" /></>}
                  {model.parts.map((part, index) => <motion.g key={part.id} role="button" tabIndex={0} aria-label={quiz && !answered ? `Struktur ${index + 1}` : part.name} aria-pressed={selected.id === part.id && (!quiz || answered)} onClick={() => select(part.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(part.id) } }} className="cursor-pointer focus-visible:[&>path]:stroke-white focus-visible:[&>path]:stroke-[5]" whileHover={{ opacity: .85 }}>
                    <path d={part.path} fill={part.color} fillOpacity={selected.id === part.id && (!quiz || answered) ? .65 : .22} stroke={selected.id === part.id && (!quiz || answered) ? '#ffffff' : part.color} strokeWidth={selected.id === part.id && (!quiz || answered) ? 4 : 2} />
                    <circle cx={part.x} cy={part.y} r="15" fill="#101e30" stroke={part.color} strokeWidth="2" /><text x={part.x} y={part.y + 4} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">{index + 1}</text>
                    {labels && !quiz && <text x={part.x} y={part.y + 33} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600" paintOrder="stroke" stroke="#101e30" strokeWidth="3">{part.name}</text>}
                  </motion.g>)}
                  <text x="250" y="520" textAnchor="middle" fill="#b4c8dd" fontSize="11">{playing ? 'Rundgang · Strukturen werden nacheinander hervorgehoben' : 'Anklicken · mit zwei Fingern zoomen · verschieben'}</text>
                </svg>
              </TransformComponent>
              <div className="absolute right-3 bottom-3 flex gap-1 rounded-xl bg-surface p-1 shadow-lg"><button aria-label="Vergrößern" className="p-2" onClick={() => zoomIn()}><ZoomIn size={19} /></button><button aria-label="Verkleinern" className="p-2" onClick={() => zoomOut()}><ZoomOut size={19} /></button><button aria-label="Ansicht zurücksetzen" className="p-2" onClick={() => resetTransform()}><Maximize size={19} /></button></div>
            </div>
          </>}
        </TransformWrapper>
        <p className="text-xs text-muted px-5 py-3">Vereinfachte Darstellung, nicht maßstabsgetreu. {reducedMotion ? 'Der automatische Rundgang ist wegen deiner Systemeinstellung für reduzierte Bewegung deaktiviert.' : 'Der Strukturen-Rundgang startet nur auf Wunsch.'}</p>
      </section>}</div>
      <aside className="space-y-4">
        {quiz ? <section className="p-6 rounded-2xl bg-surface border border-border space-y-5"><p className="text-accent-ink font-semibold">Zuordnungsübung · {question + 1} / {model.parts.length}</p><h2 className="text-2xl font-bold">{completed ? 'Lernrunde abgeschlossen' : `Wo liegt: ${target.name}?`}</h2><p className="text-muted">{completed ? `${score} von ${model.parts.length} Strukturen richtig zugeordnet.` : 'Klicke die passende Struktur in der Grafik an.'}</p><p role="status" className="font-semibold">{feedback}</p>{completed ? <button className={action} onClick={startQuiz}>Erneut üben</button> : <button disabled={!answered} className={action} onClick={() => { if (question + 1 === model.parts.length) { setCompleted(true); setFeedback('') } else { setQuestion(question + 1); setAnswered(false); setFeedback('') } }}>Weiter<ArrowRight size={17} /></button>}</section> : <>
          <section className="p-6 rounded-2xl bg-surface border border-border space-y-4"><p className="text-sm text-accent-ink">Struktur verstehen</p><h2 className="text-2xl font-bold">{selected.name}</h2><p className="text-muted italic"><TermText text={selected.term} /></p><LanguageSwitch /><p className="text-lg leading-relaxed"><LearningText technical={`${selected.term}: ${selected.technical}`} simple={selected.simple} /></p></section>
          <section className="p-5 rounded-2xl bg-surface border border-border space-y-3"><h3 className="font-bold">Strukturen auswählen</h3>{model.parts.map((p,i) => <button key={p.id} aria-pressed={selected.id === p.id} onClick={() => select(p.id)} className="w-full text-left rounded-lg border border-border p-3 text-sm hover:bg-surface-hover"><span className="text-accent-ink mr-3">{i + 1}</span>{p.name}{notes[p.id] ? ' · Notiz' : ''}</button>)}</section>
          <section className="p-5 rounded-2xl bg-surface border border-border space-y-3"><label className="font-bold block" htmlFor="structure-note">Meine Notiz zu dieser Struktur</label><textarea id="structure-note" className="w-full border border-border bg-background rounded-xl p-3" rows={3} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Eigene Eselsbrücke oder offene Frage …" /><button className={action} onClick={saveNote}><Bookmark size={16} />Notiz speichern</button><p role="status" className="text-sm text-accent-ink">{noteStatus}</p><p className="text-xs text-muted">Nur im lokalen Profil gespeichert.</p></section>
        </>}
        <section className="p-4 text-xs text-muted space-y-2"><p>Deutschsprachige Quelle aus Deutschland:</p><a className="text-accent-ink underline" href={model.source} target="_blank" rel="noreferrer">{model.sourceName}</a>{modelId === 'lungs' && <a className="block text-accent-ink underline" href="https://gesund.bund.de/glossar/lunge" target="_blank" rel="noreferrer">gesund.bund.de · Aufbau der Lunge</a>}<p>Abgerufen am 19.10.2026. Grundlagenwissen, keine Anleitung zu invasiven Maßnahmen.</p></section>
      </aside>
    </div>
    </>}
  </div>
}
