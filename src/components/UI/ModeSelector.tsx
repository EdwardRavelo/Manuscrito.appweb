import { motion } from 'framer-motion'
import { useEditorStore } from '@/store/editorStore'
import type { EditorMode } from '@/types'

const MODES: { id: EditorMode; label: string; icon: string }[] = [
  { id: 'write',    label: 'Escritura', icon: '✍' },
  { id: 'chapters', label: 'Capítulos', icon: '◈' },
  { id: 'outline',  label: 'Organizar', icon: '⊞' },
  { id: 'ideas',    label: 'Ideas',     icon: '◉' },
]

export default function ModeSelector() {
  const { mode, setMode } = useEditorStore()

  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-sans text-xs font-medium transition-colors"
          style={{ color: mode === m.id ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {mode === m.id && (
            <motion.div
              layoutId="mode-active"
              className="absolute inset-0 rounded-md"
              style={{ background: 'var(--bg-active)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
          <span className="relative z-10" style={{ fontSize: '11px' }}>{m.icon}</span>
          <span className="relative z-10 hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
