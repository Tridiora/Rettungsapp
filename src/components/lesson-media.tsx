'use client'

import {useEffect, useState} from 'react'
import {motion, useReducedMotion} from 'framer-motion'
import {LearningText} from '@/components/learning-language'
import type {LearningDocument} from '@/lib/library-types'

export function LessonMedia({document}: {document: LearningDocument}) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reduced = useReducedMotion()
  const steps = document.visualSteps || []
  useEffect(() => {
    if (!playing || reduced || !steps.length) return
    const timer = setInterval(() => setActive(n => (n + 1) % steps.length), 15000)
    return () => clearInterval(timer)
  }, [playing, reduced, steps.length])
  const step = steps[active]
  const resources = (document.resources || []).filter(r => /^https:\/\//.test(r.url) || /^\/(?!\/)/.test(r.url))
  if (!document.imageUrl && !steps.length && !resources.length) return null
  return <section aria-label="Veranschaulichung und Medien" className="space-y-4 border border-border rounded-2xl p-4 bg-background">
    {document.imageUrl && <img src={document.imageUrl} alt={`Themenübersicht: ${document.title}`} className="rounded-xl w-full"/>}
    {!!steps.length && <>
      <div className="flex items-center justify-between gap-3 flex-wrap"><h3 className="font-bold">Zusammenhänge entdecken</h3><button type="button" disabled={!!reduced} aria-pressed={playing && !reduced} onClick={() => setPlaying(p => !p)} className="border border-border rounded-xl px-3 py-2 text-sm disabled:opacity-60">{reduced ? 'Bewegung reduziert – Themen einzeln wählen' : playing ? 'Rundgang pausieren' : 'Geführten Rundgang starten'}</button></div>
      <p className="text-xs text-muted">Vier ausgewählte Zusammenhänge. Der Rundgang wechselt alle 15 Sekunden; du kannst jederzeit pausieren oder selbst auswählen.</p>
      <div className="grid sm:grid-cols-2 gap-2">{steps.map((s, i) => <button key={i} type="button" aria-pressed={i === active} onClick={() => {setActive(i); setPlaying(false)}} className={`text-left rounded-xl border p-3 ${i === active ? 'bg-accent text-white border-accent' : 'bg-surface text-foreground border-border'}`}>{i + 1}. {s.title}</button>)}</div>
      {step && <motion.div key={active} initial={reduced ? false : {opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} className="bg-surface border border-border rounded-xl p-4 leading-relaxed"><LearningText technical={step.technical} simple={step.simple}/></motion.div>}
    </>}
    {!!resources.length && <div className="space-y-3"><h3 className="font-bold">Filme und Original-Unterlagen</h3>{resources.map(r => r.kind === 'video' && r.url.startsWith('/') ? <figure key={r.url}><video controls preload="none" className="w-full rounded-xl bg-black" aria-label={r.title}><source src={r.url}/>Dein Browser unterstützt dieses Video nicht.</video><figcaption className="text-xs text-muted mt-2">{r.title}</figcaption></figure> : <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-border bg-surface p-3 underline text-accent-ink">{r.title}<span className="block text-xs mt-1">{r.kind === 'video-external' ? 'Video beim Herausgeber öffnen' : r.kind === 'pdf' ? 'Original-PDF öffnen' : 'Quelle öffnen'} ↗</span></a>)}</div>}
  </section>
}
