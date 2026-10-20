import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'

// ── Mock user for development ────────────────────────
export const mockUser: User = {
  id: '1',
  email: 'max.mustermann@medlearn.de',
  name: 'Max Mustermann',
  role: 'user' as UserRole,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ── Store interface ──────────────────────────────────
interface AppState {
  // User
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // UI State
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Navigation
  learningLanguage: 'technical' | 'simple'
  setLearningLanguage: (mode: 'technical' | 'simple') => void
  activeSection: string
  setActiveSection: (section: string) => void
}

// ── Store implementation ─────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      currentUser: mockUser,
      setCurrentUser: (user) => set({ currentUser: user }),

      // UI State
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Navigation
      learningLanguage: 'technical',
      setLearningLanguage: (learningLanguage) => set({ learningLanguage }),
      activeSection: 'dashboard',
      setActiveSection: (section) => set({ activeSection: section }),
    }),
    {
      name: 'medlearn-app-store',
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        learningLanguage: state.learningLanguage,
        currentUser: state.currentUser,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
)
