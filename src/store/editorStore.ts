import { create } from 'zustand'
import type { EditorMode, Document } from '@/types'

// Inicializa dark mode desde localStorage antes de montar React
const _initDark = localStorage.getItem('mss-dark') === 'true'
if (_initDark) document.documentElement.classList.add('dark')

interface EditorState {
  mode: EditorMode
  activeDocument: Document | null
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  focusMode: boolean
  darkMode: boolean
  wordCount: number
  setMode: (mode: EditorMode) => void
  setActiveDocument: (doc: Document | null) => void
  setWordCount: (n: number) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleFocusMode: () => void
  toggleDarkMode: () => void
  // kept for backwards compat
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'chapters',
  activeDocument: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  focusMode: false,
  darkMode: _initDark,
  wordCount: 0,
  sidebarOpen: true,

  setMode: (mode) => set({ mode }),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  setWordCount: (n) => set({ wordCount: n }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen, sidebarOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('mss-dark', String(next))
    return { darkMode: next }
  }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen, leftPanelOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open, leftPanelOpen: open }),
}))
