import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import TipTapEditor from '@/components/Editor/TipTapEditor'
import MarginComments from '@/components/Editor/MarginComments'
import type { Document, MarginComment } from '@/types'

const STATUS_CONFIG = {
  draft:    { label: 'Borrador',  color: '#4a6b50' },
  revision: { label: 'Revisión', color: '#7c6b8e' },
  final:    { label: 'Final',    color: '#3fb950' },
}

export default function ChaptersMode() {
  const { documents } = useProjectStore()
  const { activeDocument, setActiveDocument } = useEditorStore()

  useEffect(() => {
    if (!activeDocument && documents.length > 0) {
      setActiveDocument(documents[0])
    }
  }, [documents, activeDocument, setActiveDocument])

  const handleCommentsChange = (comments: MarginComment[]) => {
    if (!activeDocument) return
    useProjectStore.getState().editDocument(activeDocument.id, { marginComments: comments })
    useEditorStore.setState({ activeDocument: { ...activeDocument, marginComments: comments } })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-hidden flex flex-col"
    >
      {activeDocument ? (
        <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-paper)' }}>
          <div className="min-h-full flex justify-center px-6 py-14">
            <div className="flex w-full gap-0" style={{ maxWidth: '1140px' }}>

              {/* ── Margen izquierdo ── */}
              <LeftMarginDecor />

              {/* ── Lienzo principal ── */}
              <div className="flex-1 min-w-0 px-10">
                <DocTitle doc={activeDocument} />

                {/* Meta bar — estado + fecha */}
                <div
                  className="flex items-center gap-3 mt-4 mb-8 pb-5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <StatusCycler docId={activeDocument.id} status={activeDocument.status} />
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(activeDocument.updatedAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <TipTapEditor document={activeDocument} />
              </div>

              {/* ── Línea de margen — notebook rule ── */}
              <div
                className="self-stretch shrink-0 mx-5"
                style={{ borderLeft: '1px dashed rgba(80,90,40,0.18)' }}
              />

              {/* ── Margen derecho — notas ── */}
              <div className="w-52 shrink-0">
                <MarginComments
                  comments={activeDocument.marginComments ?? []}
                  onChange={handleCommentsChange}
                />
              </div>

            </div>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </motion.div>
  )
}

function LeftMarginDecor() {
  return (
    <div className="w-14 shrink-0 flex flex-col items-center py-14 relative select-none pointer-events-none">
      <div
        className="absolute right-0 inset-y-10"
        style={{ borderRight: '1px dashed rgba(80,90,40,0.18)' }}
      />
      <div className="flex flex-col items-center gap-2.5" style={{ opacity: 0.22 }}>
        <span style={{ color: 'var(--accent)', fontSize: '8px' }}>◆</span>
        <div
          style={{
            width: 1,
            height: 52,
            background: 'linear-gradient(to bottom, var(--accent), transparent)',
          }}
        />
      </div>
    </div>
  )
}

function DocTitle({ doc }: { doc: Document }) {
  const [value, setValue] = useState(doc.title)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(doc.title)
  }, [doc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    useEditorStore.setState({ activeDocument: { ...doc, title: val } })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      useProjectStore.getState().editDocument(doc.id, { title: val })
    }, 500)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Sin título..."
      className="w-full bg-transparent outline-none border-none font-serif font-bold"
      style={{
        fontSize: '2.4rem',
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        color: 'var(--text)',
      }}
    />
  )
}

function StatusCycler({ docId, status }: { docId: string; status: string }) {
  const { editDocument } = useProjectStore()
  const statuses = ['draft', 'revision', 'final'] as const
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft

  const cycle = () => {
    const idx = statuses.indexOf(status as typeof statuses[number])
    const next = statuses[(idx + 1) % statuses.length]
    editDocument(docId, { status: next })
    const { activeDocument } = useEditorStore.getState()
    if (activeDocument?.id === docId) {
      useEditorStore.setState({ activeDocument: { ...activeDocument, status: next } })
    }
  }

  return (
    <button
      onClick={cycle}
      className="px-2.5 py-1 rounded-md font-mono text-xs font-semibold uppercase tracking-wider transition-all"
      style={{
        background: `${config.color}18`,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      {config.label}
    </button>
  )
}

function EmptyState() {
  const { activeProject, addDocument } = useProjectStore()
  const { setActiveDocument } = useEditorStore()

  const create = async () => {
    if (!activeProject) return
    const doc = await addDocument({
      projectId: activeProject.id,
      title: 'Sin título',
      type: 'chapter',
      order: 0,
      content: {},
      status: 'draft',
      tags: [],
    })
    setActiveDocument(doc)
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg-paper)' }}
    >
      <p className="font-serif text-lg" style={{ color: 'var(--text-muted)' }}>
        Selecciona un documento del panel izquierdo
      </p>
      <button
        onClick={create}
        className="px-5 py-2.5 rounded-lg font-sans text-sm font-medium transition-all"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
      >
        Crear primer capítulo
      </button>
    </div>
  )
}
