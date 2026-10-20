'use client'
import {useEffect,useState} from 'react'
import type {MediaRecord} from '@/lib/media-types'
export function MediaPicker({onChoose}:{onChoose:(url:string)=>void}){
 const [media,setMedia]=useState<MediaRecord[]>([]),[error,setError]=useState('')
 useEffect(()=>{void fetch('/api/media').then(async r=>{if(!r.ok)throw Error('Medienliste nicht erreichbar.');return r.json()}).then(setMedia).catch(e=>setError(e.message))},[])
 return <div className="mt-2 space-y-2"><select aria-label="Bild aus Medienbibliothek wählen" className="bg-background border border-border rounded-lg p-2 w-full" defaultValue="" onChange={e=>{if(e.target.value)onChoose(e.target.value)}}><option value="">Bild aus Medienbibliothek wählen …</option>{media.filter(m=>m.mime.startsWith('image/')).map(m=><option key={m.id} value={`/api/media/${m.id}/file`}>{m.title} · {m.status==='published'?'veröffentlicht':'Entwurf / Prüfung'}</option>)}</select><a className="text-sm underline" href="/verwaltung/medien" target="_blank" rel="noreferrer">Weitere Bilder hochladen</a>{error&&<p role="alert">{error}</p>}</div>
}
