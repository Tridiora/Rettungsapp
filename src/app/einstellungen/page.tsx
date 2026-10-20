'use client'
import { useAppStore } from '@/stores/app-store'
export default function Settings() {
  const { theme, setTheme } = useAppStore()
  return <div className="max-w-2xl mx-auto p-6 space-y-5"><h1 className="text-3xl font-bold">Einstellungen</h1><div className="rounded-2xl border border-border bg-surface p-6 space-y-5"><label className="block">Darstellung<select className="block w-full border border-border rounded-xl p-3 mt-2 bg-background" value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'system')}><option value="system">Automatisch</option><option value="light">Hell</option><option value="dark">Dunkel</option></select></label><p className="text-sm text-muted">Die Auswahl wird automatisch gespeichert.</p><p>Sprache: Deutsch · Geltungsbereich: Deutschland</p><p className="text-sm text-muted">Lerninhalte und persönliche Notizen werden derzeit lokal gespeichert. Eine Synchronisierung zwischen Geräten ist noch nicht eingerichtet.</p></div></div>
}
