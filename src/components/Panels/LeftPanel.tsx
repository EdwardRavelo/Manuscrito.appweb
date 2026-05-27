import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import type { Document, DocumentType } from '@/types'

const CARD_COLORS = ['#a07850', '#4a6741', '#7c6b8e', '#2a5a6e', '#8a3020', '#5c6e2a']

const TYPE_ICONS: Record<DocumentType, string> = {
  chapter: '◆',
  note: '○',
  idea: '◇',
  character: '△',
  scene: '▷',
}

const TYPE_COLORS: Record<DocumentType, string> = {
  chapter: 'var(--accent)',
  note: 'var(--accent-amber)',
  idea: 'var(--accent-blue)',
  character: 'var(--accent-purple)',
  scene: 'var(--text-mid)',
}

const STATUS_DOT: Record<string, string> = {
  draft: '#4a6b50',
  revision: '#7c6b8e',
  final: '#3fb950',
}

export default function LeftPanel() {
  const navigate = useNavigate()
  const { documents, activeProject, addDocument } = useProjectStore()
  const { activeDocument, setActiveDocument, setMode } = useEditorStore()

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<DocumentType>('chapter')
  const [newColor, setNewColor] = useState<string | undefined>(undefined)

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped: Partial<Record<DocumentType, Document[]>> = {}
  for (const doc of filtered) {
    if (!grouped[doc.type]) grouped[doc.type] = []
    grouped[doc.type]!.push(doc)
  }

  const typeOrder: DocumentType[] = ['chapter', 'scene', 'character', 'note', 'idea']
  const TYPE_LABELS: Record<DocumentType, string> = {
    chapter: 'Capítulos',
    scene: 'Escenas',
    character: 'Personajes',
    note: 'Notas',
    idea: 'Ideas',
  }

  const handleAdd = async () => {
    if (!newTitle.trim() || !activeProject) return
    const doc = await addDocument({
      projectId: activeProject.id,
      title: newTitle.trim(),
      type: newType,
      order: documents.length,
      content: {},
      status: 'draft',
      tags: [],
      cardColor: newColor,
    })
    setActiveDocument(doc)
    if (newType === 'chapter' || newType === 'scene') setMode('chapters')
    setShowAdd(false)
    setNewTitle('')
    setNewType('chapter')
    setNewColor(undefined)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mb-3 transition-opacity hover:opacity-70 w-full text-left"
          style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}
        >
          ← Proyectos
        </button>
        <h2
          className="font-serif font-bold text-sm leading-snug truncate"
          style={{ color: 'var(--text)' }}
        >
          {activeProject?.title ?? '—'}
        </h2>
        {activeProject?.description && (
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {activeProject.description}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs leading-none"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Document tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {typeOrder.map((type) => {
          const docs = grouped[type]
          if (!docs || docs.length === 0) return null
          return (
            <div key={type} className="mb-1">
              <div
                className="px-4 py-1 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <span style={{ fontSize: '9px', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  {TYPE_LABELS[type]}
                </span>
                <span
                  className="px-1 rounded font-mono"
                  style={{ fontSize: '9px', background: 'var(--bg-active)', color: 'var(--text-muted)' }}
                >
                  {docs.length}
                </span>
              </div>
              {docs.map((doc) => (
                <DocItem
                  key={doc.id}
                  doc={doc}
                  isActive={activeDocument?.id === doc.id}
                  icon={TYPE_ICONS[doc.type]}
                  iconColor={TYPE_COLORS[doc.type]}
                  onSelect={() => {
                    setActiveDocument(doc)
                    if (doc.type === 'chapter' || doc.type === 'scene') setMode('chapters')
                  }}
                />
              ))}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Sin resultados' : 'Sin documentos'}
            </p>
          </div>
        )}
      </div>

      {/* Add document */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <AnimatePresence>
          {showAdd ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Nombre del documento..."
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-mid)',
                  color: 'var(--text)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DocumentType)}
                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-mid)',
                }}
              >
                <option value="chapter">Capítulo</option>
                <option value="scene">Escena</option>
                <option value="character">Personaje</option>
                <option value="note">Nota</option>
                <option value="idea">Idea</option>
              </select>
              {/* Color picker */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setNewColor(undefined)}
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  title="Sin color"
                  style={{
                    border: newColor === undefined ? '2px solid var(--accent)' : '1.5px solid var(--border-mid)',
                    background: 'var(--bg)',
                    transform: newColor === undefined ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {newColor === undefined && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '9px', lineHeight: 1 }}>—</span>
                  )}
                </button>
                {CARD_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="w-5 h-5 rounded-full flex-shrink-0 transition-all"
                    title={c}
                    style={{
                      background: c,
                      outline: newColor === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px',
                      transform: newColor === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => { setShowAdd(false); setNewTitle(''); setNewColor(undefined) }}
                  className="flex-1 py-1.5 rounded-lg text-xs"
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                >
                  Crear
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
              style={{
                border: '1px dashed var(--border-mid)',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              Nuevo documento
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DocItem({
  doc,
  isActive,
  icon,
  iconColor,
  onSelect,
}: {
  doc: Document
  isActive: boolean
  icon: string
  iconColor: string
  onSelect: () => void
}) {
  const accentColor = doc.cardColor ?? 'var(--accent)'
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors group"
      style={{
        background: isActive ? 'var(--bg-active)' : 'transparent',
        borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
      }}
    >
      <span style={{ fontSize: '9px', color: isActive ? (doc.cardColor ?? iconColor) : 'var(--text-muted)', flexShrink: 0 }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span
          className="text-xs truncate leading-snug block"
          style={{ color: isActive ? 'var(--text)' : 'var(--text-mid)' }}
        >
          {doc.title}
        </span>
        {doc.songTitle && (
          <span
            className="truncate block leading-tight"
            style={{ fontSize: '10px', color: 'var(--text-muted)' }}
          >
            ♪ {doc.songTitle}
          </span>
        )}
      </div>
      {doc.cardColor && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
          style={{ background: doc.cardColor }}
        />
      )}
      {!doc.cardColor && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: STATUS_DOT[doc.status] ?? '#4a6b50' }}
        />
      )}
    </button>
  )
}
