import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, YearLevel, ClassTimeline } from '@/types'

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

  // Apprenticeship & Timeline
  selectedYear: YearLevel
  setSelectedYear: (year: YearLevel) => void
  personalTimeline: ClassTimeline | null
  setPersonalTimeline: (timeline: ClassTimeline | null) => void
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

      // Apprenticeship & Timeline
      selectedYear: 'all',
      setSelectedYear: (selectedYear) => set({ selectedYear }),
      personalTimeline: {
        startDate: '2024-10-01',
        durationMonths: 36,
        examDate: '2027-08-15',
        milestones: [
          { id: 'ms-1', title: 'Start 1. Ausbildungsjahr', date: '2024-10-01', yearLevel: 1, description: 'Grundlagen & Basismaßnahmen' },
          { id: 'ms-2', title: 'Zwischenprüfung Grundlagen', date: '2025-09-15', yearLevel: 1, description: 'Schriftliche & praktische Überprüfung' },
          { id: 'ms-3', title: 'Start 2. Ausbildungsjahr', date: '2025-10-01', yearLevel: 2, description: 'Spezielle Notfallmedizin & Traumatologie' },
          { id: 'ms-4', title: 'Klinikblock Anästhesie / Intensiv', date: '2026-03-01', yearLevel: 2, description: 'Praktikum Anästhesie & Notaufnahme' },
          { id: 'ms-5', title: 'Start 3. Ausbildungsjahr', date: '2026-10-01', yearLevel: 3, description: 'Invasive Maßnahmen § 2a & NotSan-APrV Falltraining' },
          { id: 'ms-6', title: 'Staatsexamen Vorbereitung', date: '2027-06-01', yearLevel: 3, description: 'Intensives Prüfungstraining' },
          { id: 'ms-7', title: 'Staatsexamen Notfallsanitäter', date: '2027-08-15', yearLevel: 3, description: 'Schriftlicher, mündlicher und praktischer Teil' },
        ],
      },
      setPersonalTimeline: (personalTimeline) => set({ personalTimeline }),
    }),
    {
      name: 'medlearn-app-store',
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        learningLanguage: state.learningLanguage,
        currentUser: state.currentUser,
        sidebarOpen: state.sidebarOpen,
        selectedYear: state.selectedYear,
        personalTimeline: state.personalTimeline,
      }),
    },
  ),
)
