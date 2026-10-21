'use client'
import {AnatomyProcess} from '@/components/anatomy-process'
import {useEffect,useState} from 'react'
import {useReducedMotion} from 'framer-motion'
import {anatomyModels,type AnatomyModel} from '@/lib/anatomy-data'
import {useEditorialStore} from '@/stores/editorial-store'
import {SourceLinks} from '@/components/source-links'
import {LearningText} from '@/components/learning-language'

const btn='rounded-xl border border-border bg-surface px-3 py-2 text-sm disabled:opacity-50'
export function AnatomyLearningMedia({modelId,onSelect}:{modelId:string;onSelect:(id:string)=>void}) {
 const records=useEditorialStore(s=>s.records)
 const model=(records?.find(r=>r.kind==='anatomy'&&r.data.id===modelId)?.data as unknown as AnatomyModel)||anatomyModels.find(m=>m.id===modelId)!
 const [view,setView]=useState<'structure'|'function'|'process'|'video'>('structure')
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[seconds,setSeconds]=useState(6),[labels,setLabels]=useState(true)
 const reduced=useReducedMotion(),part=model.parts[Math.min(index,model.parts.length-1)]
 useEffect(()=>{if(!playing||reduced||view==='video')return;const timer=setInterval(()=>setIndex(i=>(i+1)%model.parts.length),seconds*1000);return()=>clearInterval(timer)},[playing,reduced,seconds,model.parts.length,view])
 useEffect(()=>()=>{if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()},[])
 function select(i:number){setIndex(i);onSelect(model.parts[i].id)}
 function read(){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(`${part.name}. ${part.simple}`);speech.lang='de-DE';window.speechSynthesis.speak(speech)}
 return <section className="rounded-3xl border border-border bg-surface overflow-hidden">
  <div className="p-4 sm:p-6 space-y-3"><h2 className="text-xl font-bold">{model.title} · interaktiv verstehen</h2><p className="text-sm text-muted">Eigene schematische Darstellung · {model.view||'Vereinfachte Übersicht'} · nicht maßstabsgetreu</p>
   <div className="flex flex-wrap gap-2">{([['structure','Strukturansicht'],['function','Funktionsübersicht'],['process','Ablaufanimation'],['video','Erklärvideo']] as const).map(([id,label])=><button key={id} className={btn} aria-pressed={view===id} onClick={()=>{setView(id);setPlaying(false)}}>{label}</button>)}</div>
  </div>
  {view==='process'?<AnatomyProcess key={modelId} modelId={modelId}/>:view==='video'?<div className="p-4 space-y-3"><video key={modelId} controls preload="none" playsInline className="w-full rounded-2xl bg-slate-950" poster={`/anatomie/eigen/${modelId}.svg`}><source src={`/anatomie/eigen/${modelId}.mp4`} type="video/mp4"/><track kind="captions" src={`/anatomie/eigen/${modelId}.vtt`} srcLang="de" label="Deutsch" default/></video><p className="text-sm text-muted">Beschrifteter Rundgang ohne Ton. Den vollständigen Text kannst du in der Strukturansicht lesen oder mit der Geräte-Stimme vorlesen lassen.</p></div>:<>
   <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)] gap-4 p-4 sm:p-6">
    <div className="min-w-0 rounded-2xl bg-[#f3f8fb] p-2">
     {view==='structure'?<svg viewBox="0 0 500 520" className="w-full max-h-[65dvh]" role="img" aria-label={`${model.title}: ${part.name} hervorgehoben`}>
      <title>{model.title} – Strukturschema</title>
      {model.parts.map((p,i)=><g key={p.id} role="button" tabIndex={0} aria-label={`${p.name} erklären`} aria-pressed={i===index} onClick={()=>select(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(i)}}} className="cursor-pointer outline-none focus:opacity-70"><path d={p.path} fill={p.color} fillOpacity={i===index?1:0.28} stroke={i===index?'#075c70':'#657c89'} strokeWidth={i===index?4:1.5}/>{labels&&<g><circle cx={p.x} cy={p.y} r="13" fill={i===index?'#075c70':'#334f62'}/><text x={p.x} y={p.y+5} textAnchor="middle" fill="white" fontSize="14" fontFamily="Arial">{i+1}</text></g>}</g>)}
     </svg>:<div className="p-3 space-y-3"><p className="text-sm font-semibold text-slate-800">Struktur → zugehörige Funktion</p>{model.parts.map((p,i)=><button key={p.id} onClick={()=>select(i)} className={`w-full text-left p-3 rounded-xl border ${i===index?'bg-teal-100 border-teal-700':'bg-white border-slate-200'} text-slate-800`}><span className="font-bold">{i+1}. {p.name}</span><span className="block text-sm mt-2">→ {p.technical}</span>{i===index&&playing&&!reduced&&<span key={`${index}-${seconds}`} className="block h-1 bg-teal-600 mt-2 rounded" style={{animation:`anatomy-progress ${seconds}s linear`}}/>}</button>)}</div>}
    </div>
    <div className="space-y-4 min-w-0"><h3 className="text-xl font-bold">{part.name}</h3><p className="text-sm text-accent-ink">{part.term}</p><p className="leading-relaxed"><LearningText technical={part.technical} simple={part.simple}/></p><p className="text-sm leading-relaxed text-muted">{part.simple}</p>
     <div className="flex flex-wrap gap-2"><button className={btn} onClick={read}>Erklärung vorlesen</button><button className={btn} onClick={()=>window.speechSynthesis?.cancel()}>Vorlesen stoppen</button></div>
     <ol className="space-y-2">{model.parts.map((p,i)=><li key={p.id}><button className={`${btn} w-full text-left ${index===i?'font-bold border-accent':''}`} onClick={()=>select(i)} aria-pressed={index===i}>{i+1}. {p.name}</button></li>)}</ol>
    </div>
   </div>
   <div className="border-t border-border p-4 flex flex-wrap items-center gap-3"><button className={btn} onClick={()=>setPlaying(p=>!p)} disabled={!!reduced}>{playing?'Rundgang pausieren':'Rundgang starten'}</button><label className="text-sm">Sekunden je Struktur <select className={btn} value={seconds} onChange={e=>setSeconds(Number(e.target.value))}>{[4,6,10,15].map(n=><option key={n}>{n}</option>)}</select></label><label className="text-sm flex gap-2"><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/>Nummern anzeigen</label><input aria-label="Struktur auswählen" className="grow min-w-32" type="range" min="0" max={model.parts.length-1} value={index} onChange={e=>select(Number(e.target.value))}/>{reduced&&<p className="text-xs">Automatischer Rundgang wegen deiner Einstellung für reduzierte Bewegung deaktiviert.</p>}</div>
  </>}
  <div className="p-4 border-t border-border text-xs text-muted"><SourceLinks source={model.source}/><p>Eigene neue Darstellungen und Videos: CC0 1.0, soweit Rechte bestehen. Fachliche Quellen bleiben beim jeweiligen Herausgeber.</p></div>
 </section>
}
