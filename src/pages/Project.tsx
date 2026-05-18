import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import ModeSelector from '@/components/UI/ModeSelector'
import LeftPanel from '@/components/Panels/LeftPanel'
import RightPanel from '@/components/Panels/RightPanel'
import WriteMode from '@/modes/WriteMode'
import ChaptersMode from '@/modes/ChaptersMode'
import OutlineMode from '@/modes/OutlineMode'
import IdeasMode from '@/modes/IdeasMode'
import { getProject } from '@/db/database'

const PANEL_WIDTH = 260

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { activeProject, setActiveProject } = useProjectStore()
  const { mode, leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel, darkMode, toggleDarkMode } = useEditorStore()

  useEffect(() => {
    if (!projectId) return
    if (activeProject?.id === projectId) return
    getProject(projectId).then((project) => {
      if (!project) { navigate('/'); return }
      setActiveProject(project)
    })
  }, [projectId, activeProject, setActiveProject, navigate])

  if (!activeProject) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <span className="font-mono text-xs animate-pulse">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Top bar ──────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 h-11 flex-shrink-0 z-20 relative"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel)',
        }}
      >
        {/* Left panel toggle */}
        <PanelToggle
          open={leftPanelOpen}
          onClick={toggleLeftPanel}
          side="left"
          title="Panel izquierdo"
        />

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        {/* App name + project */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-mono text-xs flex-shrink-0"
            style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}
          >
            MSS
          </span>
          <span style={{ color: 'var(--border-mid)', fontSize: '10px' }}>›</span>
          <span
            className="font-sans text-xs truncate"
            style={{ color: 'var(--text-mid)' }}
          >
            {activeProject.title}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode selector */}
        <ModeSelector />

        <div className="flex-1" />

        {/* Auto-save indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
          />
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            auto
          </span>
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)', border: '1px solid transparent' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
        >
          <DarkModeIcon dark={darkMode} />
        </button>

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        {/* Right panel toggle */}
        <PanelToggle
          open={rightPanelOpen}
          onClick={toggleRightPanel}
          side="right"
          title="Panel derecho"
        />
      </header>

      {/* ── Body: 3 columns ─────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <AnimatePresence initial={false}>
          {leftPanelOpen && (
            <motion.aside
              key="left-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: PANEL_WIDTH, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="flex-shrink-0 overflow-hidden z-10"
              style={{
                borderRight: '1px solid var(--border)',
                background: 'var(--bg-panel)',
              }}
            >
              <div style={{ width: PANEL_WIDTH, height: '100%' }}>
                <LeftPanel />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center — editor / mode */}
        <main className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            {mode === 'write'    && <WriteMode    key="write" />}
            {mode === 'chapters' && <ChaptersMode key="chapters" />}
            {mode === 'outline'  && <OutlineMode  key="outline" />}
            {mode === 'ideas'    && <IdeasMode    key="ideas" />}
          </AnimatePresence>
        </main>

        {/* Right panel */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <motion.aside
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: PANEL_WIDTH, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="flex-shrink-0 overflow-hidden z-10"
              style={{
                borderLeft: '1px solid var(--border)',
                background: 'var(--bg-panel)',
              }}
            >
              <div style={{ width: PANEL_WIDTH, height: '100%' }}>
                <RightPanel />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DarkModeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1" />
      <line x1="7" y1="0.5" x2="7" y2="2.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="11.8" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="0.5" y1="7" x2="2.2" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="11.8" y1="7" x2="13.5" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="2.4" y1="2.4" x2="3.6" y2="3.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="10.4" y1="10.4" x2="11.6" y2="11.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="11.6" y1="2.4" x2="10.4" y2="3.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="3.6" y1="10.4" x2="2.4" y2="11.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.5 8.5A5 5 0 0 1 5.5 2.5a5 5 0 1 0 6 6z"
        stroke="currentColor" strokeWidth="1"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function PanelToggle({
  open,
  onClick,
  side,
  title,
}: {
  open: boolean
  onClick: () => void
  side: 'left' | 'right'
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
      style={{
        background: open ? 'var(--bg-active)' : 'transparent',
        color: open ? 'var(--accent)' : 'var(--text-muted)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!open) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'transparent'
      }}
    >
      <PanelIcon side={side} open={open} />
    </button>
  )
}

function PanelIcon({ side, open }: { side: 'left' | 'right'; open: boolean }) {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
      <rect x="0.5" y="0.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" />
      {side === 'left' ? (
        <line x1="4" y1="1" x2="4" y2="11" stroke="currentColor" strokeWidth="1" opacity={open ? 1 : 0.4} />
      ) : (
        <line x1="10" y1="1" x2="10" y2="11" stroke="currentColor" strokeWidth="1" opacity={open ? 1 : 0.4} />
      )}
    </svg>
  )
}
