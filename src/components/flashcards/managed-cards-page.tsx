'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useLibrary} from '@/lib/use-library'
import {useNative} from '@/lib/use-native'
import {useEditorialStore} from '@/stores/editorial-store'
import {TermText} from '@/components/learning-language'
export default function ManagedCardsPage(){
 const {decks,cards}=useLibrary(),native=useNative(),error=useEditorialStore(s=>s.error),records=useEditorialStore(s=>s.records)
 const [query,setQuery]=useState('')
 const filtered=decks.filter(d=>[d.title,d.description,...cards.filter(c=>c.deckId===d.id).map(c=>c.front)].join(' ').toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')))
 return <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6"><header><p className="text-accent-ink">Lernen und wiederholen</p><h1 className="text-3xl font-bold mt-2">Karteikarten & Lernsets</h1><p className="text-muted mt-3">Hier stehen freigegebene gemeinsame Inhalte und die Lernsets deiner Klasse.</p></header><input aria-label="Lernsets durchsuchen" className="w-full border border-border bg-surface rounded-xl p-3" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Thema oder Kartenfrage suchen …"/>{error&&<p role="alert">{error}</p>}{records===null?<p>Lernsets werden geladen …</p>:<><p className="text-sm text-muted">{filtered.length} Lernsets · {cards.length} Karten verfügbar</p><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(deck=><article key={deck.id} className="rounded-2xl border border-border bg-surface p-5 space-y-4">{deck.coverImage&&<img src={deck.coverImage} alt="" className="rounded-xl w-full h-36 object-cover"/>}<h2 className="font-bold text-xl"><TermText text={deck.title}/></h2><p className="text-muted"><TermText text={deck.description||''}/></p><p className="text-sm">{deck.cardCount} Karten</p><Link className="inline-block bg-accent text-white rounded-xl px-4 py-3" href={`/karteikarten/${deck.id}`}>Lernen starten</Link></article>)}</div>{!filtered.length&&<p>Keine passenden freigegebenen Lernsets. Für Klasseninhalte bitte mit deinem Konto anmelden.</p>}</>}<div className="flex flex-wrap gap-4 text-sm"><Link className="underline text-accent-ink" href="/medien">Mit Lernkonto anmelden</Link>{!native&&<Link className="underline text-accent-ink" href="/verwaltung">Inhalte im Browser verwalten</Link>}</div></div>
}
