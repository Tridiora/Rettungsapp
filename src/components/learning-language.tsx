'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useAppStore } from '@/stores/app-store'
import { glossary, splitTerms } from '@/lib/learning-glossary'
import { useEditorialStore } from '@/stores/editorial-store'

export function TermText({ text, trail=[] }: { text: string; trail?:string[] }) {
  const records=useEditorialStore(s=>s.records)
  const entries=(records===null?glossary:records.filter(r=>r.kind==='glossary').sort((a,b)=>Number(b.scope==='class')-Number(a.scope==='class')).map(r=>r.data as unknown as typeof glossary[number])).filter(g=>!trail.includes(g.term))
  if(trail.length>=8)return <>{text}</>
  return <>{splitTerms(text,entries).map((piece, i) => piece.index === undefined ? piece.text : <Dialog.Root key={`${entries[piece.index].term}:${i}`}>
    <Dialog.Trigger asChild><button type="button" onClick={e => e.stopPropagation()} className="inline text-inherit underline decoration-dotted decoration-accent-ink underline-offset-4 hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-accent rounded-sm" aria-label={`${piece.text} erklären`}>{piece.text}</button></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" /><Dialog.Content onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-6 space-y-4">
      <p className="text-xs font-semibold text-accent-ink">Begriff verstehen</p><Dialog.Title className="text-2xl font-bold">{entries[piece.index].term}</Dialog.Title>
      <Dialog.Description asChild><div className="text-base leading-relaxed whitespace-pre-wrap"><TermText text={entries[piece.index].explanation} trail={[...trail,entries[piece.index].term]}/></div></Dialog.Description>
      {/^(https?:\/\/|\/)/.test(entries[piece.index].source)?<a href={entries[piece.index].source} target="_blank" rel="noreferrer" className="block text-sm text-accent-ink underline">Quelle nachlesen</a>:<p className="text-sm text-muted">{entries[piece.index].source}</p>}
      <Dialog.Close className="rounded-xl bg-accent px-4 py-2 text-white">Zurück zum Lerntext</Dialog.Close>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>)}</>
}

export function LanguageSwitch({ onChange }: { onChange?: () => void } = {}) {
  const mode = useAppStore(s => s.learningLanguage)
  const setMode = useAppStore(s => s.setLearningLanguage)
  return <div className="space-y-2" onClick={e => e.stopPropagation()}>
    <div role="group" aria-label="Sprache der Lerninhalte" className="flex flex-wrap gap-2">
      {(['technical', 'simple'] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => { setMode(value); onChange?.() }} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${mode === value ? 'border-accent bg-accent text-white' : 'border-border bg-surface text-foreground hover:bg-surface-hover'}`}>{value === 'technical' ? 'Fachsprache' : 'Einfach erklärt'}</button>)}
    </div><p className="text-xs text-muted">{mode === 'technical' ? 'Punktiert unterstrichene Fachwörter anklicken oder antippen.' : 'Ohne Vorwissen verständlich. Du kannst jederzeit zurückwechseln.'}</p>
  </div>
}

export function LearningText({ technical, simple }: { technical: string; simple?: string }) {
  const mode = useAppStore(s => s.learningLanguage)
  return <TermText text={mode==='simple'?(simple?.trim() || 'Für diesen Inhalt fehlt noch eine einfach verständliche Fassung. Bitte wechsle zur Fachsprache.'):technical}/>
}
