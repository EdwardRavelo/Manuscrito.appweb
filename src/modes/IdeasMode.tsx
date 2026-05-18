import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createStickyNote, updateStickyNote, deleteStickyNote, getProjectStickyNotes } from '@/db/database'
import { useProjectStore } from '@/store/projectStore'
import type { StickyNote } from '@/types'

const NOTE_COLORS = [
  '#f5e6c8', // amber cálido
  '#e8d5c0', // arena
  '#d4e8d0', // salvia
  '#d8d0e8', // lavanda
  '#e8d0d0', // rosa
  '#d0e0e8', // cielo
  '#e8e0d0', // crema
]

export default function IdeasMode() {
  const { activeProject } = useProjectStore()
  const boardRef = useRef<HTMLDivElement>(null)

  const [notes, setNotes] = useState<StickyNote[]>([])

  useEffect(() => {
    if (!activeProject) { setNotes([]); return }
    getProjectStickyNotes(activeProject.id).then(setNotes)
  }, [activeProject?.id])

  const handleBoardClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeProject) return
      if ((e.target as HTMLElement) !== boardRef.current) return

      const rect = boardRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left - 100
      const y = e.clientY - rect.top - 60

      const newNote = await createStickyNote({
        projectId: activeProject.id,
        content: '',
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 200,
      })
      setNotes((prev) => [...prev, newNote])
    },
    [activeProject]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}
      >
        <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
          Haz clic en el tablero para añadir una nota
        </p>
        <div className="flex items-center gap-1.5 ml-auto">
          {NOTE_COLORS.slice(0, 5).map((c) => (
            <div
              key={c}
              className="w-4 h-4 rounded-full"
              style={{ background: c, border: '1px solid rgba(139,69,19,0.2)' }}
            />
          ))}
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-auto cursor-crosshair"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(139,69,19,0.06) 31px, rgba(139,69,19,0.06) 32px), ' +
            'repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(139,69,19,0.06) 31px, rgba(139,69,19,0.06) 32px)',
          minHeight: '100%',
          minWidth: '100%',
        }}
        onClick={handleBoardClick}
      >
        <AnimatePresence>
          {notes.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onDelete={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
            />
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-40">
              <div className="text-5xl mb-3">💡</div>
              <p className="font-serif text-lg" style={{ color: 'var(--text-mid)' }}>
                Haz clic para añadir tu primera idea
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function StickyNoteCard({ note, onDelete }: { note: StickyNote; onDelete: (id: string) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [pos, setPos] = useState({ x: note.x, y: note.y })
  const [content, setContent] = useState(note.content)
  const posRef = useRef({ x: note.x, y: note.y })
  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync posición cuando la nota cambia desde fuera (carga inicial, etc.)
  useEffect(() => {
    if (!isDragging) {
      setPos({ x: note.x, y: note.y })
      posRef.current = { x: note.x, y: note.y }
    }
  }, [note.x, note.y]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: pos.x, ny: pos.y }

    const onMove = (me: MouseEvent) => {
      if (!dragStart.current) return
      const newX = Math.max(0, dragStart.current.nx + me.clientX - dragStart.current.mx)
      const newY = Math.max(0, dragStart.current.ny + me.clientY - dragStart.current.my)
      posRef.current = { x: newX, y: newY }
      setPos({ x: newX, y: newY })
    }

    const onUp = () => {
      setIsDragging(false)
      dragStart.current = null
      // Una sola escritura a DB al soltar, no en cada frame
      updateStickyNote(note.id, posRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => updateStickyNote(note.id, { content: val }), 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: note.width,
        background: note.color,
        zIndex: isDragging ? 100 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '6px 10px 30px rgba(44,24,16,0.25)'
          : '3px 5px 16px rgba(44,24,16,0.15)',
        borderRadius: 12,
        rotate: isDragging ? 2 : 0,
        colorScheme: 'light',
        color: '#252e12',
      }}
      transition={{ rotate: { duration: 0.15 } }}
      className="group"
      onMouseDown={handleMouseDown}
    >
      {/* Pin */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{ background: 'var(--accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
      />

      {/* Contenido */}
      <div className="p-3 pt-4">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Escribe tu idea..."
          className="w-full bg-transparent border-none outline-none resize-none font-sans text-sm leading-relaxed"
          style={{ color: '#252e12', minHeight: 80, cursor: 'text' }}
          rows={4}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Eliminar */}
      <button
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(44,24,16,0.2)', color: '#252e12', fontSize: '9px' }}
        onClick={(e) => { e.stopPropagation(); deleteStickyNote(note.id); onDelete(note.id) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        ✕
      </button>
    </motion.div>
  )
}
