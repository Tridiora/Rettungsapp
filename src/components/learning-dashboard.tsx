'use client'
import Link from 'next/link'
import { useNative } from '@/lib/use-native'
import { AnatomyThumbnail } from '@/components/anatomy-thumbnail'
import { BookOpen, Brain, HeartPulse, FileText, ArrowRight, Plus, ShieldCheck } from 'lucide-react'
import { useLibrary } from '@/lib/use-library'
import { useLearningStore } from '@/stores/learning-store'
import { useAppStore } from '@/stores/app-store'

export default function LearningDashboard() {
  const native=useNative()
  const { decks, quizzes, documents, cards } = useLibrary()
  const user = useAppStore(s => s.currentUser)
  const learning = useLearningStore()
  const reviews = Object.values(learning.reviews).filter(r => r.userId === user?.id)
  const attempts = learning.attempts.filter(a => a.userId === user?.id)
  const today = new Date().toISOString()
  const due = reviews.filter(r => r.nextAt <= today && cards.some(c => c.id === r.cardId))
  const resume = decks.find(d => d.id === due[0]?.deckId) || decks.find(d => d.cardCount > 0)
  return <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-7">
    <section className="relative overflow-hidden rounded-3xl bg-primary text-white p-6 md:p-10"><div className="relative z-10 max-w-2xl"><span className="text-sm text-white/80">Dein Lernbegleiter für den Rettungsdienst in Deutschland</span><h1 className="text-3xl md:text-4xl font-bold mt-3">Hallo {user?.name.split(' ')[0] || 'du'},<br />was möchtest du heute verstehen?</h1><p className="text-white/80 mt-4">Wissen aufbauen, Zusammenhänge entdecken und sicher wiederholen – in deinem Tempo.</p><div className="flex flex-wrap gap-3 mt-6"><Link href={resume ? `/karteikarten/${resume.id}` : '/karteikarten'} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold">{due.length ? 'Wiederholen' : 'Lernen starten'}<ArrowRight size={18} /></Link><Link href="/karteikarten?create=true" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3"><Plus size={18} />Eigene Karte erstellen</Link></div></div><HeartPulse className="absolute -right-12 top-10 w-72 h-72 text-white/10" strokeWidth={1} /></section>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Karten geübt',reviews.length],['Quiz abgeschlossen',attempts.length],['Zur Wiederholung',due.length],['Lernmaterialien',decks.length + quizzes.length + documents.length]].map(([label,value]) => <div className="rounded-2xl border border-border bg-surface p-5" key={label}><p className="text-sm text-muted">{label}</p><p className="text-3xl font-bold mt-3">{value}</p></div>)}</div>
    <section className="grid md:grid-cols-3 gap-4">{[{ href:'/anatomie',title:'Anatomie entdecken',text:'Strukturen anklicken, Animationen ansehen und Zuordnungen üben.',icon:HeartPulse },{ href:'/quiz',title:'Wissen testen',text:'Fragen beantworten und aus den Begründungen lernen.',icon:Brain },{ href:'/dokumente',title:'Unterlagen verstehen',text:'Texte lesen, Stellen markieren und persönliche Notizen sammeln.',icon:FileText }].map(item => <Link key={item.href} href={item.href} className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors"><item.icon className="w-12 h-12 text-accent-ink mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} /><h2 className="text-xl font-bold">{item.title}</h2><p className="text-muted text-sm mt-2">{item.text}</p><span className="inline-flex items-center gap-2 text-accent-ink mt-5 text-sm">Öffnen<ArrowRight size={16} /></span></Link>)}</section>
    <section className="space-y-4"><div className="flex justify-between"><h2 className="text-xl font-bold">Deine Lernsets</h2><Link href="/karteikarten" className="text-accent-ink underline">Alle ansehen</Link></div><div className="grid md:grid-cols-3 gap-4">{decks.slice(0,6).map(d => <Link href={`/karteikarten/${d.id}`} key={d.id} className="bg-surface rounded-2xl border border-border p-5 hover:border-accent">{d.id.startsWith('de-') ? <AnatomyThumbnail modelId={d.id.slice(3)} /> : <BookOpen className="text-primary-ink" />}<h3 className="font-bold mt-3">{d.title}</h3><p className="text-sm text-muted mt-2">{d.cardCount} Karten · {d.category?.name || 'Grundlagen'}</p></Link>)}</div>{!decks.length && <p className="text-muted">Noch keine veröffentlichten Lernsets. Im Verwaltungsportal kannst du Inhalte ergänzen.</p>}</section>
    {!native&&<Link href="/verwaltung" className="flex items-center gap-3 rounded-2xl border border-border p-5 bg-surface"><ShieldCheck className="text-accent-ink" /><span><strong>Inhalte pflegen</strong><span className="block text-sm text-muted">Verwaltungsportal für Lernsets, Karten, Quizfragen und Unterlagen</span></span><ArrowRight className="ml-auto" /></Link>}
  </div>
}
