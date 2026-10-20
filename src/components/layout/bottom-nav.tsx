'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Layers,
  Brain,
  HeartPulse,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Navigation items ─────────────────────────────────
interface BottomNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const items: BottomNavItem[] = [
  { title: 'Übersicht', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Karten', href: '/karteikarten', icon: Layers },
  { title: 'Quiz', href: '/quiz', icon: Brain },
  { title: 'Anatomie', href: '/anatomie', icon: HeartPulse },
  { title: 'Dokumente', href: '/dokumente', icon: FileText },
]

// ── BottomNav component ──────────────────────────────
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 md:hidden',
        'border-t border-border bg-surface',
        'pb-[env(safe-area-inset-bottom)]',
      )}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full',
                'text-xs transition-colors',
                isActive
                  ? 'text-accent-ink'
                  : 'text-muted hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive && 'stroke-[2.5]',
                  )}
                />
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-accent" />
                )}
              </span>
              <span className={cn('font-medium', isActive && 'font-semibold')}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
