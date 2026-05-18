import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import type { Document, DocumentStatus } from '@/types'

const COLUMNS: { id: DocumentStatus; label: string; color: string; bg: string }[] = [
  { id: 'draft',    label: 'Borrador', color: '#a07850', bg: 'rgba(160, 120, 80, 0.08)' },
  { id: 'revision', label: 'Revisión', color: '#7c6b8e', bg: 'rgba(124, 107, 142, 0.08)' },
  { id: 'final',    label: 'Final',    color: '#4a6741', bg: 'rgba(74, 103, 65, 0.08)' },
]

export default function OutlineMode() {
  const { documents, editDocument, activeProject } = useProjectStore()
  const { setActiveDocument, setMode } = useEditorStore()
  const [dragOver, setDragOver] = useState<DocumentStatus | null>(null)

  const openDoc = (doc: Document) => {
    setActiveDocument(doc)
    setMode('chapters')
  }

  const moveCard = (docId: string, status: DocumentStatus) => {
    editDocument(docId, { status })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full overflow-hidden flex flex-col"
    >
      <div className="px-6 pt-6 pb-4">
        <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--text)' }}>
          {activeProject?.title}
        </h2>
        <p className="font-sans text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {documents.length} documentos · arrastra para cambiar estado
        </p>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-5 h-full min-w-max">
          {COLUMNS.map((col) => {
            const cards = documents.filter((d) => d.status === col.id)
            const isOver = dragOver === col.id
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{
                  width: 280,
                  background: isOver ? `${col.color}14` : col.bg,
                  border: `1.5px solid ${isOver ? col.color + '70' : col.color + '30'}`,
                  transform: isOver ? 'scale(1.01)' : 'scale(1)',
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                }}
                onDragOver={(e) => { e.preventDefault(); if (!isOver) setDragOver(col.id) }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null)
                }}
                onDrop={(e) => {
                  setDragOver(null)
                  const docId = e.dataTransfer.getData('docId')
                  if (docId) moveCard(docId, col.id)
                }}
              >
                {/* Column header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${col.color}25` }}
                >
                  <span className="font-sans text-sm font-semibold" style={{ color: col.color }}>
                    {col.label}
                  </span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${col.color}20`, color: col.color }}
                  >
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <AnimatePresence>
                    {cards.map((doc) => (
                      <KanbanCard
                        key={doc.id}
                        doc={doc}
                        onOpen={() => openDoc(doc)}
                        accentColor={col.color}
                      />
                    ))}
                  </AnimatePresence>
                  {cards.length === 0 && (
                    <div
                      className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: isOver ? `${col.color}60` : `${col.color}25`,
                        color: isOver ? col.color : `${col.color}60`,
                        background: isOver ? `${col.color}08` : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span className="font-sans text-xs">
                        {isOver ? 'Soltar aquí' : 'Arrastra aquí'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function KanbanCard({
  doc,
  onOpen,
  accentColor,
}: {
  doc: Document
  onOpen: () => void
  accentColor: string
}) {
  const TYPE_ICONS: Record<string, string> = {
    chapter: '📖', note: '📝', idea: '💡', character: '👤', scene: '🎬',
  }

  const cardColor = doc.cardColor

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDragStart={(e: any) => e.dataTransfer.setData('docId', doc.id)}
      onClick={onOpen}
      className="rounded-xl p-3.5 cursor-pointer group overflow-hidden"
      style={{
        background: cardColor ? `${cardColor}14` : 'var(--bg-surface)',
        boxShadow: 'var(--shadow-warm)',
        border: `1px solid ${cardColor ? `${cardColor}35` : 'var(--border)'}`,
        borderLeft: cardColor ? `3px solid ${cardColor}` : undefined,
      }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-warm-lg)' }}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm flex-shrink-0 mt-0.5">{TYPE_ICONS[doc.type] ?? '📄'}</span>
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>
            {doc.title}
          </p>
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-md font-sans text-xs"
                  style={{
                    background: `${cardColor ?? accentColor}15`,
                    color: cardColor ?? accentColor,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p
            className="font-mono text-xs mt-2 opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            {new Date(doc.updatedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
