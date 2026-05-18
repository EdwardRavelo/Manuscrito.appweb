import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MarginComment, MarginCommentColor } from '@/types'

const COLOR_CONFIG: Record<MarginCommentColor, { bg: string; border: string; dot: string }> = {
  amber:  { bg: 'rgba(138,106,42,0.10)', border: 'rgba(138,106,42,0.28)', dot: '#8a6a2a' },
  green:  { bg: 'rgba(74,103,65,0.10)',  border: 'rgba(74,103,65,0.28)',  dot: '#4a6741' },
  red:    { bg: 'rgba(138,48,32,0.09)',  border: 'rgba(138,48,32,0.25)',  dot: '#8a3020' },
  purple: { bg: 'rgba(106,74,122,0.09)', border: 'rgba(106,74,122,0.25)', dot: '#6a4a7a' },
}

interface Props {
  comments: MarginComment[]
  onChange: (comments: MarginComment[]) => void
}

export default function MarginComments({ comments, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftColor, setDraftColor] = useState<MarginCommentColor>('amber')

  const add = () => {
    if (!draft.trim()) return
    onChange([
      ...comments,
      {
        id: crypto.randomUUID(),
        text: draft.trim(),
        color: draftColor,
        createdAt: Date.now(),
      },
    ])
    setDraft('')
    setDraftColor('amber')
    setAdding(false)
  }

  const remove = (id: string) => onChange(comments.filter((c) => c.id !== id))

  return (
    <div className="flex flex-col gap-2.5">

      {/* Header label */}
      <p
        className="font-mono text-xs uppercase tracking-widest mb-1"
        style={{ color: 'var(--text-muted)', fontSize: '9px' }}
      >
        Notas al margen
      </p>

      {/* Add button / form */}
      <AnimatePresence mode="wait">
        {adding ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl p-3 space-y-2.5"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-mid)',
            }}
          >
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add()
                if (e.key === 'Escape') { setAdding(false); setDraft('') }
              }}
              placeholder="Escribe una nota..."
              className="w-full bg-transparent outline-none resize-none font-sans text-xs leading-relaxed"
              style={{ color: 'var(--text)', minHeight: 64 }}
              rows={3}
            />

            {/* Color + acciones */}
            <div className="flex items-center gap-1.5">
              {(Object.keys(COLOR_CONFIG) as MarginCommentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setDraftColor(c)}
                  className="w-3.5 h-3.5 rounded-full transition-all"
                  style={{
                    background: COLOR_CONFIG[c].dot,
                    outline: draftColor === c ? `2px solid ${COLOR_CONFIG[c].dot}` : 'none',
                    outlineOffset: '2px',
                    transform: draftColor === c ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              ))}
              <div className="flex-1" />
              <button
                onClick={() => { setAdding(false); setDraft('') }}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={add}
                disabled={!draft.trim()}
                className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Guardar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdding(true)}
            className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            style={{
              border: '1.5px dashed var(--border-mid)',
              color: 'var(--text-muted)',
            }}
            whileHover={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
            Añadir nota
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comment bubbles */}
      <AnimatePresence>
        {comments.map((comment) => {
          const cfg = COLOR_CONFIG[comment.color] ?? COLOR_CONFIG.amber
          return (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-3 group relative"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {/* Color dot */}
              <div
                className="w-2 h-2 rounded-full mb-2"
                style={{ background: cfg.dot }}
              />

              <p
                className="font-sans text-xs leading-relaxed"
                style={{ color: 'var(--text-mid)', whiteSpace: 'pre-wrap' }}
              >
                {comment.text}
              </p>

              <p
                className="font-mono mt-2 opacity-50"
                style={{ fontSize: '10px', color: 'var(--text-muted)' }}
              >
                {new Date(comment.createdAt).toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>

              {/* Delete */}
              <button
                onClick={() => remove(comment.id)}
                className="absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(44,24,16,0.12)',
                  color: 'var(--text-muted)',
                  fontSize: '9px',
                }}
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {comments.length === 0 && !adding && (
        <p
          className="text-center font-sans pt-2"
          style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}
        >
          Sin notas aún
        </p>
      )}
    </div>
  )
}
