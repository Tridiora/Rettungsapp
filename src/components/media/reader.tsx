'use client'
import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Highlighter, Trash2, Download } from 'lucide-react'
import { LearningText, LanguageSwitch } from '@/components/learning-language'
import type { Account, MediaNote, MediaRecord } from '@/lib/media-types'
import 'pdfjs-dist/web/pdf_viewer.css'

const button='rounded-xl border border-border bg-surface px-3 py-2 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40'
async function request<T>(url: string, init?: RequestInit): Promise<T> { const response=await fetch(url,init); const body=await response.json(); if(!response.ok)throw Error(body.error || 'Anfrage fehlgeschlagen.');return body }
export function MediaReader({ media, user, onClose }: {media:MediaRecord;user:Account|null;onClose:()=>void}) {
  const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null),[page,setPage]=useState(1),[zoom,setZoom]=useState(1),[width,setWidth]=useState(700),[error,setError]=useState(''),[loading,setLoading]=useState(true)
  const [notes,setNotes]=useState<MediaNote[]>([]),[mark,setMark]=useState(false),[color,setColor]=useState('#facc15'),[noteText,setNoteText]=useState(''),[saving,setSaving]=useState(false),[ready,setReady]=useState(false)
  const [draft,setDraft]=useState<{x:number;y:number;width:number;height:number}|null>(null)
  const start=useRef<{x:number;y:number}|null>(null),canvas=useRef<HTMLCanvasElement>(null),textLayer=useRef<HTMLDivElement>(null),wrapper=useRef<HTMLDivElement>(null)
  const isPdf=media.mime==='application/pdf',url=`/api/media/${media.id}/file`,pages=pdf?.numPages||1
  useEffect(()=>{ const element=wrapper.current;if(!element)return;const observer=new ResizeObserver(entries=>setWidth(Math.max(240,entries[0].contentRect.width-32)));observer.observe(element);return()=>observer.disconnect() },[])
  useEffect(()=>{
    if(!isPdf)return
    let active=true;let task: ReturnType<typeof import('pdfjs-dist')['getDocument']>|undefined
    void import('pdfjs-dist').then(lib=>{if(!active)return;lib.GlobalWorkerOptions.workerSrc='/vendor/pdf.worker.min.mjs';task=lib.getDocument({url,isEvalSupported:false,cMapUrl:'/vendor/cmaps/',cMapPacked:true,standardFontDataUrl:'/vendor/standard_fonts/'});return task.promise}).then(doc=>{if(doc&&active){setPdf(doc);setLoading(false)}}).catch(e=>{if(active){setError(`PDF konnte nicht geöffnet werden: ${e.message}`);setLoading(false)}})
    return()=>{active=false;void task?.destroy()}
  },[isPdf,url])
  useEffect(()=>{
    if(!pdf || !canvas.current)return
    let active=true;let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>|undefined;let text: import('pdfjs-dist').TextLayer|undefined
    const target=canvas.current, layer=textLayer.current
    void pdf.getPage(page).then(async p=>{
      if(!active)return
      setReady(false)
      const base=p.getViewport({scale:1}),viewport=p.getViewport({scale:width*zoom/base.width}),ratio=Math.min(window.devicePixelRatio||1,2)
      target.width=Math.floor(viewport.width*ratio);target.height=Math.floor(viewport.height*ratio);target.style.width=`${viewport.width}px`;target.style.height=`${viewport.height}px`
      const context=target.getContext('2d');if(!context)throw Error('Darstellung ist nicht verfügbar.')
      render=p.render({canvas:target,canvasContext:context,viewport,transform:[ratio,0,0,ratio,0,0]});await render.promise
      if(!active)return
      if(layer){layer.replaceChildren();layer.style.setProperty('--scale-factor',String(viewport.scale));const lib=await import('pdfjs-dist');if(!active)return;text=new lib.TextLayer({textContentSource:await p.getTextContent(),container:layer,viewport});await text.render()}
      if(active)setReady(true)
    }).catch(e=>{if(active && e.name!=='RenderingCancelledException')setError('Die Seite konnte nicht dargestellt werden.')})
    return()=>{active=false;render?.cancel();text?.cancel()}
  },[pdf,page,width,zoom])
  useEffect(()=>{let active=true;if(user)request<MediaNote[]>(`/api/media/${media.id}/notes`).then(rows=>{if(active)setNotes(rows)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[media.id,user])
  function point(event:React.PointerEvent<HTMLDivElement>){const rect=event.currentTarget.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))}}
  async function saveNote(){if(!draft||saving)return;setSaving(true);setError('');try{const saved=await request<MediaNote>(`/api/media/${media.id}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,page,color,text:noteText})});setNotes([...notes,saved]);setDraft(null);setNoteText('');setMark(false)}catch(e){setError((e as Error).message)}finally{setSaving(false)}}
  async function removeNote(id:string){try{await request(`/api/media/${media.id}/notes`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});setNotes(notes.filter(n=>n.id!==id))}catch(e){setError((e as Error).message)}}
  const pageNotes=notes.filter(n=>n.page===page)
  return <section className="space-y-4">
    <div className="flex flex-wrap justify-between items-center gap-3"><button className={button} onClick={onClose}><ArrowLeft size={17}/>Bibliothek</button><span className="text-xs text-muted">{media.status === 'published' ? 'Veröffentlicht' : 'Redaktionsvorschau'} · Version {media.revision}</span></div>
    <h1 className="text-2xl font-bold">{media.title}</h1>
    <div className="flex flex-wrap items-center gap-2"><button aria-label="Vorherige Seite" disabled={page===1} className={button} onClick={()=>{setPage(page-1);setDraft(null)}}><ArrowLeft size={18}/></button><label className="text-sm">Seite <select aria-label="PDF-Seite" value={page} onChange={e=>{setPage(Number(e.target.value));setDraft(null)}} className="bg-surface border border-border rounded-lg p-2">{Array.from({length:pages},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select> / {pages}</label><button aria-label="Nächste Seite" disabled={page===pages} className={button} onClick={()=>{setPage(page+1);setDraft(null)}}><ArrowRight size={18}/></button><button aria-label="Verkleinern" disabled={zoom<=.5} className={button} onClick={()=>setZoom(Math.max(.5,zoom-.25))}><ZoomOut size={18}/></button><button className={button} onClick={()=>setZoom(1)}>{Math.round(zoom*100)} % · Einpassen</button><button aria-label="Vergrößern" disabled={zoom>=3} className={button} onClick={()=>setZoom(Math.min(3,zoom+.25))}><ZoomIn size={18}/></button><button disabled={!user || !ready} aria-pressed={mark} className={`${button} ${mark?'border-accent text-accent-ink':''}`} onClick={()=>{setMark(!mark);setDraft(null)}}><Highlighter size={18}/>Bereich markieren</button><a href={url} download={media.filename} className={button}><Download size={18}/>Originaldatei</a></div>
    {error && <p role="alert" className="rounded-xl bg-red-500/10 text-red-700 p-3">{error}</p>}
    <div className="grid xl:grid-cols-[minmax(0,1fr)_310px] gap-5">
      <div ref={wrapper} className="min-w-0 rounded-2xl border border-border overflow-auto bg-slate-200 p-4 max-h-[75vh]">
        {isPdf && loading && <p className="p-8 text-slate-800">PDF wird geladen …</p>}
        <div className="relative w-fit bg-white shadow-lg leading-none">
          {isPdf ? <><canvas ref={canvas} aria-label={`PDF-Seite ${page}`} className="block"/><div ref={textLayer} className="textLayer"/></> : <img src={url} alt={media.title} style={{width:width*zoom,maxWidth:'none'}} onLoad={()=>{setReady(true);setLoading(false)}} onError={()=>setError('Bild konnte nicht geladen werden.')} />}
          {ready && <div aria-label="Persönliche Markierungen" className="absolute inset-0" style={{pointerEvents:mark?'auto':'none',touchAction:mark?'none':'auto',cursor:mark?'crosshair':'auto'}} onPointerDown={e=>{if(!mark)return;e.currentTarget.setPointerCapture(e.pointerId);start.current=point(e);setDraft(null)}} onPointerMove={e=>{if(!start.current)return;const to=point(e),from=start.current;setDraft({x:Math.min(to.x,from.x),y:Math.min(to.y,from.y),width:Math.abs(to.x-from.x),height:Math.abs(to.y-from.y)})}} onPointerUp={()=>{start.current=null}} onPointerCancel={()=>{start.current=null;setDraft(null)}}>
            {pageNotes.map(n=><div key={n.id} title={n.text} style={{position:'absolute',left:`${n.x*100}%`,top:`${n.y*100}%`,width:`${n.width*100}%`,height:`${n.height*100}%`,backgroundColor:n.color,opacity:.35,border:`1px solid ${n.color}`}}/>)}
            {draft && <div style={{position:'absolute',left:`${draft.x*100}%`,top:`${draft.y*100}%`,width:`${draft.width*100}%`,height:`${draft.height*100}%`,backgroundColor:color,opacity:.4,border:'2px solid #0f766e'}}/>}
          </div>}
        </div>
      </div>
      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-surface p-4 space-y-3"><h2 className="font-bold">Meine Markierungen</h2><p className="text-sm text-muted">{user?'Nur für dein angemeldetes Konto sichtbar. Auf dem Server gespeichert.':'Zum Speichern persönlicher Markierungen bitte anmelden.'}</p>{mark&&<p className="text-sm">Ziehe mit Maus oder Finger ein Rechteck über die gewünschte Stelle.</p>}
          {mark&&<><label className="text-sm block">Farbe<select aria-label="Markierungsfarbe" value={color} onChange={e=>setColor(e.target.value)} className="block border border-border bg-background p-2 rounded-lg w-full"><option value="#facc15">Gelb</option><option value="#4ade80">Grün</option><option value="#60a5fa">Blau</option><option value="#f472b6">Pink</option></select></label><label className="text-sm block">Notiz<textarea maxLength={4000} value={noteText} onChange={e=>setNoteText(e.target.value)} className="block w-full bg-background border border-border p-3 rounded-lg" rows={3}/></label><button disabled={!draft||draft.width<.003||draft.height<.003||saving} className={button} onClick={saveNote}>{saving?'Wird gespeichert …':'Markierung speichern'}</button></>}
          <p className="text-xs text-muted">{pageNotes.length} Markierungen auf Seite {page}</p>{pageNotes.map((n,i)=><div key={n.id} className="border-l-4 pl-3 py-2 flex gap-2 text-sm" style={{borderColor:n.color}}><p className="flex-1 break-words">{n.text||`Markierung ${i+1}`}</p><button aria-label={`Markierung ${i+1} entfernen`} onClick={()=>removeNote(n.id)}><Trash2 size={16}/></button></div>)}
        </section>
        <section className="rounded-2xl border border-border bg-surface p-4 space-y-3"><h2 className="font-bold">Begleittext</h2><LanguageSwitch/><p className="text-sm leading-relaxed"><LearningText technical={media.technical} simple={media.simple}/></p><p className="text-xs text-muted">Der Schalter betrifft den Begleittext. Der Inhalt der Originaldatei bleibt unverändert.</p></section>
        <details className="rounded-2xl border border-border p-4 text-xs space-y-2"><summary className="font-semibold cursor-pointer">Quelle und Nutzungsrechte</summary><p className="break-words">{media.source}</p><p>{media.rights}</p><p>Stand: {media.sourceDate} · Deutschland</p></details>
      </aside>
    </div>
  </section>
}
