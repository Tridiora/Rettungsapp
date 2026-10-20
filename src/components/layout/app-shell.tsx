'use client'

import { Suspense, useEffect } from 'react'
import { useLibraryStore } from '@/stores/library-store'
import { useLearningStore } from '@/stores/learning-store'
import { LocalAccount } from './local-account'
import { useContentStore } from '@/stores/content-store'
import { useAppStore } from '@/stores/app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { EditorialSync } from '@/stores/editorial-store'
import { useNative } from '@/lib/use-native'
import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const native=useNative(),pathname=usePathname()
  const currentUser = useAppStore(s => s.currentUser)
  const theme = useAppStore(s => s.theme)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (preference.matches ? 'dark' : 'light') : theme
    }
    applyTheme()
    preference.addEventListener('change', applyTheme)
    return () => preference.removeEventListener('change', applyTheme)
  }, [theme])
  useEffect(() => { void useAppStore.persist.rehydrate(); void useContentStore.persist.rehydrate(); void useLibraryStore.persist.rehydrate(); void useLearningStore.persist.rehydrate() }, [])
  if (!currentUser) return <LocalAccount />
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar – desktop always visible, mobile slide-over */}
      <Suspense fallback={<aside className="w-64 bg-primary hidden md:block" />}>
        <Sidebar />
      </Suspense>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-16 border-b border-border bg-surface" />}>
          <Header />
        </Suspense>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <EditorialSync/>
          <Suspense fallback={<div className="p-8 text-center text-muted">Laden...</div>}>
            {native&&pathname.startsWith('/verwaltung')?<div className="p-8"><h1 className="text-2xl font-bold">Verwaltung im Browser</h1><p>Inhalte, Klassen und Rechte werden über das Verwaltungsportal im Webbrowser gepflegt.</p></div>:children}
          </Suspense>
        </main>

        {/* Bottom nav – mobile only */}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  )
}
