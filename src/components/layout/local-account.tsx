'use client'
import { useAppStore, mockUser } from '@/stores/app-store'
export function LocalAccount() {
  const setUser = useAppStore(s => s.setCurrentUser)
  return <div className="min-h-screen flex items-center justify-center p-6 bg-background"><div className="max-w-lg bg-surface border border-border rounded-3xl p-8 space-y-5"><h1 className="text-2xl font-bold">Lokale Sitzung beendet</h1><p className="text-muted">Deine Lerninhalte und Notizen bleiben in diesem Browser erhalten. Es handelt sich um einen lokalen Testzugang, nicht um eine geschützte Anmeldung.</p><button onClick={() => setUser(mockUser)} className="bg-accent text-white rounded-xl px-5 py-3">Lokalen Testzugang öffnen</button></div></div>
}
