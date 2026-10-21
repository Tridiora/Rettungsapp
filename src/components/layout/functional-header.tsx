'use client'
import { useState } from 'react'
import { isLearningBeta } from '@/lib/build-mode'
import { useNative } from '@/lib/use-native'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Search, Bell, UserRound, ShieldCheck } from 'lucide-react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { useContentStore } from '@/stores/content-store'

export function Header() {
  const nativeDevice = useNative(); const native = nativeDevice || isLearningBeta
  const { currentUser, setCurrentUser, setSidebarOpen, theme, setTheme } = useAppStore()
  const cards = useContentStore(s => s.cards)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const item = 'block rounded-lg px-3 py-2 text-sm hover:bg-surface-hover focus:bg-surface-hover outline-none cursor-pointer'
  const notifications = cards.filter(c => c.authorId === currentUser?.id && c.status !== 'pending_review')
  return <header className="flex min-h-16 flex-wrap items-center gap-2 md:gap-4 border-b border-border bg-surface px-3 py-2 md:px-6">
    <button aria-label="Menü öffnen" onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-surface-hover md:hidden"><Menu size={20} /></button>
    <Link href="/dashboard" className="font-bold text-primary-ink hidden lg:block">MedLearn <span className="text-xs font-normal text-muted">Deutschland</span></Link>
    <form className="flex min-w-0 flex-1 max-w-lg items-center rounded-xl border border-border bg-background" onSubmit={e => { e.preventDefault(); router.push(`/suche?q=${encodeURIComponent(query.trim())}`) }}><input aria-label="Inhalte suchen" placeholder="Thema suchen …" value={query} onChange={e => setQuery(e.target.value)} className="bg-transparent w-full min-w-0 p-2 text-sm" /><button type="submit" aria-label="Suche starten" className="p-2 text-accent-ink"><Search size={20} /></button></form>
    <select aria-label="Farbdarstellung" value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'system')} className="rounded-lg border border-border bg-background p-2 text-sm max-w-24 sm:max-w-32"><option value="system">System</option><option value="light">Hell</option><option value="dark">Dunkel</option></select>
    <Dropdown.Root><Dropdown.Trigger asChild><button aria-label="Benachrichtigungen" className="relative rounded-lg p-2 hover:bg-surface-hover"><Bell size={20} />{!!notifications.length && <span className="absolute -top-1 -right-1 rounded-full bg-accent text-white text-xs px-1">{notifications.length}</span>}</button></Dropdown.Trigger><Dropdown.Portal><Dropdown.Content align="end" sideOffset={10} className="z-50 w-80 max-w-[90vw] max-h-96 overflow-auto rounded-2xl border border-border bg-surface p-4 shadow-xl"><h2 className="font-bold mb-3">Rückmeldungen</h2>{!notifications.length ? <p className="text-sm text-muted">Noch keine Rückmeldungen zu deinen Einreichungen.</p> : notifications.map(c => <Dropdown.Item asChild key={c.id}><Link href="/karteikarten" className={item}><strong>{c.status === 'approved' ? 'Freigegeben' : 'Überarbeitung nötig'}</strong><p className="truncate">{c.front}</p><p className="text-muted">{c.feedback}</p></Link></Dropdown.Item>)}</Dropdown.Content></Dropdown.Portal></Dropdown.Root>
    <Dropdown.Root><Dropdown.Trigger asChild><button aria-label="Benutzermenü" className="flex items-center gap-2 rounded-lg p-2 hover:bg-surface-hover"><UserRound size={20} /><span className="hidden xl:inline text-sm">{currentUser?.name}</span></button></Dropdown.Trigger><Dropdown.Portal><Dropdown.Content align="end" sideOffset={10} className="z-50 min-w-52 rounded-xl border border-border bg-surface p-2 shadow-xl">{[['/profil','Profil'],['/einstellungen','Einstellungen'],['/verwaltung','Verwaltungsportal']].filter(([href])=>!native||href!=='/verwaltung').map(([href,label]) => <Dropdown.Item asChild key={href}><Link className={item} href={href}>{label}</Link></Dropdown.Item>)}<Dropdown.Separator className="border-t border-border my-2" /><Dropdown.Item className={item} onSelect={() => setCurrentUser(null)}>Lokale Sitzung beenden</Dropdown.Item></Dropdown.Content></Dropdown.Portal></Dropdown.Root>
    {!native&&<Link href="/verwaltung" aria-label="Verwaltungsportal öffnen" className="hidden sm:block p-2 rounded-lg text-accent-ink hover:bg-surface-hover"><ShieldCheck size={20} /></Link>}
  </header>
}
