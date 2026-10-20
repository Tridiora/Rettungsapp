'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Layers,
  Brain,
  HeartPulse,
  FileText,
  TrendingUp,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { useNative } from '@/lib/use-native'

// ── Navigation items ─────────────────────────────────
interface SidebarNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navItems: SidebarNavItem[] = [
  { title: 'Übersicht', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Karteikarten', href: '/karteikarten', icon: Layers },
  { title: 'Quiz', href: '/quiz', icon: Brain },
  { title: 'Anatomie', href: '/anatomie', icon: HeartPulse },
  { title: 'Dokumente', href: '/dokumente', icon: FileText },
  { title: 'PDF & Medien', href: '/medien', icon: FileText },
  { title: 'Fortschritt', href: '/fortschritt', icon: TrendingUp },
  { title: 'Verwaltungsportal', href: '/verwaltung', icon: Settings },
]

const adminItems: SidebarNavItem[] = [
  { title: 'Verwaltung', href: '/verwaltung', icon: Settings, adminOnly: true },
]

// ── Sidebar overlay for mobile ───────────────────────
function MobileOverlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/50 md:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

// ── Sidebar component ────────────────────────────────
export function Sidebar() {
  const native=useNative()
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, setSidebarOpen, currentUser } =
    useAppStore()

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'moderator' ||
    currentUser?.role === 'developer'

  const sidebarWidth = sidebarOpen ? 'md:w-64' : 'md:w-[68px]'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden">
            <MobileOverlay onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-primary text-white',
          'transition-[width] duration-300 ease-in-out',
          // Mobile: slide-over
          'max-md:w-64',
          sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          // Desktop: collapsible
          'md:relative md:translate-x-0 shrink-0', sidebarWidth,
        )}
        style={{ width: undefined }}
        aria-label="Hauptnavigation"
      >
        {/* ── Header ──────────────────────────────── */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 font-bold text-lg whitespace-nowrap',
              !sidebarOpen && 'md:justify-center',
            )}
          >
            <span className="text-2xl shrink-0">🚑</span>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                MedLearn
              </motion.span>
            )}
          </Link>

          {/* Collapse toggle – desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center rounded-md p-1.5 hover:bg-white/10 transition-colors"
            aria-label={sidebarOpen ? 'Seitenleiste einklappen' : 'Seitenleiste ausklappen'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                !sidebarOpen && 'rotate-180',
              )}
            />
          </button>

          {/* Close button – mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex md:hidden items-center justify-center rounded-md p-1.5 hover:bg-white/10 transition-colors"
            aria-label="Seitenleiste schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.filter(item=>!native||!item.href.startsWith('/verwaltung')).map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={!sidebarOpen}
              />
            )
          })}

          {false && isAdmin && (
            <>
              <div className="my-3 mx-2 border-t border-white/10" />
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={!sidebarOpen}
                  />
                )
              })}
            </>
          )}
        </nav>

        {/* ── User info ───────────────────────────── */}
        {currentUser && (
          <div
            className={cn(
              'border-t border-white/10 p-4',
              !sidebarOpen && 'md:flex md:justify-center md:px-2',
            )}
          >
            <div
              className={cn(
                'flex items-center gap-3',
                !sidebarOpen && 'md:justify-center',
              )}
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {currentUser.email}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </>
  )
}

// ── NavLink sub-component ────────────────────────────
function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: SidebarNavItem
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={() => { if (window.innerWidth < 768) useAppStore.getState().setSidebarOpen(false) }}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        collapsed && 'md:justify-center md:px-2',
      )}
      title={collapsed ? item.title : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-accent"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <Icon className="relative z-10 h-5 w-5 shrink-0" />
      {!collapsed && (
        <span className="relative z-10 truncate">{item.title}</span>
      )}
    </Link>
  )
}
